// Main Application Entry Point
import './styles/index.css';
import { Game } from './game/Game';
import type { GameState, GameStats } from './game/Game';
import {
  initI18n,
  t,
  getCurrentLanguage,
  setLanguage,
  getAvailableLanguages,
} from './i18n';
import type { Language } from './i18n';
import {
  getHighScore,
  getScores,
  getPlayerName,
  setPlayerName,
} from './storage/ScoreStorage';
import type { ScoreEntry } from './storage/ScoreStorage';
import { formatScore, formatTime } from './utils/helpers';
import { GAME_CONFIG } from './utils/constants';
import { soundManager } from './audio/SoundManager';

class SpaceCollectorApp {
  private game: Game | null = null;
  private gameContainer: HTMLElement;

  // Screen elements
  private startScreen!: HTMLElement;
  private gameScreen!: HTMLElement;
  private gameoverScreen!: HTMLElement;
  private leaderboardScreen!: HTMLElement;
  private pauseOverlay!: HTMLElement;

  // HUD elements
  private scoreDisplay!: HTMLElement;
  private timerDisplay!: HTMLElement;

  constructor() {
    this.gameContainer = document.getElementById('app')!;
    initI18n();
    this.createUI();
    this.bindEvents();
    this.updateLanguageUI();
  }

  private createUI(): void {
    this.gameContainer.innerHTML = `
      <div class="game-container">
        <!-- Start Screen -->
        <div class="screen start-screen" id="start-screen">
          <div class="header-area">
            <div class="language-switcher" id="language-switcher">
              ${getAvailableLanguages().map(lang => `
                <button class="language-btn ${getCurrentLanguage() === lang.code ? 'active' : ''}" 
                        data-lang="${lang.code}">
                  ${lang.nativeName}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="animate-float">
            <h1 class="game-title" data-i18n="appName">${t('appName')}</h1>
          </div>
          <p class="game-tagline" data-i18n="tagline">${t('tagline')}</p>
          
          <div class="high-score-badge animate-pulse">
            <span>🏆</span>
            <span data-i18n="highScore">${t('highScore')}</span>:
            <span id="menu-high-score">${formatScore(getHighScore())}</span>
          </div>
          
          <ul class="instructions-list">
            <li data-i18n="instructionMove">${t('instructionMove')}</li>
            <li data-i18n="instructionCollect">${t('instructionCollect')}</li>
            <li data-i18n="instructionAvoid">${t('instructionAvoid')}</li>
            <li data-i18n="instructionTime">${t('instructionTime')}</li>
          </ul>
          
          <div class="start-buttons">
            <button class="btn btn-primary animate-pulse-glow" id="play-btn">
              <span data-i18n="play">${t('play')}</span> 🚀
            </button>
            <button class="btn btn-secondary" id="leaderboard-btn">
              <span data-i18n="leaderboard">${t('leaderboard')}</span> 🏆
            </button>
          </div>
          
          <!-- Player name input -->
          <div class="form-group" style="margin-top: var(--spacing-lg); max-width: 280px; width: 100%;">
            <input type="text" 
                   class="input" 
                   id="player-name-input" 
                   data-i18n-placeholder="enterName"
                   placeholder="${t('enterName')}"
                   value="${getPlayerName()}"
                   maxlength="20">
          </div>
        </div>
        
        <!-- Game Screen (Canvas will be inserted here) -->
        <div class="screen game-screen hidden" id="game-screen">
          <div id="canvas-container"></div>
          
          <!-- HUD -->
          <div class="game-hud">
            <div class="hud-left">
              <div class="hud-item score-display" id="score-display">0</div>
            </div>
            <div class="hud-center">
              <div class="hud-item timer-display" id="timer-display">${formatTime(GAME_CONFIG.GAME_DURATION)}</div>
            </div>
            <div class="hud-right">
              <button class="btn btn-icon hud-item" id="pause-btn">⏸️</button>
            </div>
          </div>
        </div>
        
        <!-- Pause Overlay -->
        <div class="pause-overlay hidden" id="pause-overlay">
          <h2 class="pause-title" data-i18n="pause">${t('pause')}</h2>
          <button class="btn btn-primary" id="resume-btn">
            <span data-i18n="resume">${t('resume')}</span> ▶️
          </button>
          <button class="btn btn-secondary" id="quit-btn">
            <span data-i18n="mainMenu">${t('mainMenu')}</span>
          </button>
        </div>
        
        <!-- Game Over Screen -->
        <div class="screen gameover-screen hidden" id="gameover-screen">
          <div id="new-high-score-badge" class="new-high-score hidden animate-bounce">
            🌟 <span data-i18n="newHighScore">${t('newHighScore')}</span> 🌟
          </div>
          
          <h2 class="gameover-title animate-slide-down" data-i18n="gameOver">${t('gameOver')}</h2>
          
          <div class="gameover-score-section animate-scale-in">
            <div class="trophy-icon">🏆</div>
            <div class="score-display" id="final-score">0</div>
          </div>
          
          <div class="stats-grid animate-slide-up">
            <div class="stat-item">
              <span class="stat-icon">🪙</span>
              <span class="stat-value" id="coins-collected">0</span>
              <span class="stat-label" data-i18n="coinsCollected">${t('coinsCollected')}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">💎</span>
              <span class="stat-value" id="gems-collected">0</span>
              <span class="stat-label" data-i18n="gemsCollected">${t('gemsCollected')}</span>
            </div>
            <div class="stat-item">
              <span class="stat-icon">⭐</span>
              <span class="stat-value" id="stars-collected">0</span>
              <span class="stat-label" data-i18n="starsCollected">${t('starsCollected')}</span>
            </div>
          </div>
          
          <div class="gameover-buttons">
            <button class="btn btn-primary" id="play-again-btn">
              <span data-i18n="playAgain">${t('playAgain')}</span> 🚀
            </button>
            <button class="btn btn-secondary" id="back-to-menu-btn">
              <span data-i18n="mainMenu">${t('mainMenu')}</span>
            </button>
          </div>
        </div>
        
        <!-- Leaderboard Screen -->
        <div class="screen leaderboard-screen hidden" id="leaderboard-screen">
          <h2 class="game-title" style="font-size: 1.8rem;" data-i18n="leaderboardTitle">
            ${t('leaderboardTitle')}
          </h2>
          
          <div class="leaderboard-container glass-panel" id="leaderboard-container">
            <!-- Leaderboard items inserted here -->
          </div>
          
          <button class="btn btn-secondary" id="leaderboard-back-btn">
            <span data-i18n="back">${t('back')}</span>
          </button>
        </div>
      </div>
    `;

    // Cache DOM references
    this.startScreen = document.getElementById('start-screen')!;
    this.gameScreen = document.getElementById('game-screen')!;
    this.gameoverScreen = document.getElementById('gameover-screen')!;
    this.leaderboardScreen = document.getElementById('leaderboard-screen')!;
    this.pauseOverlay = document.getElementById('pause-overlay')!;
    this.scoreDisplay = document.getElementById('score-display')!;
    this.timerDisplay = document.getElementById('timer-display')!;
  }

  private bindEvents(): void {
    // Add click sounds to all buttons
    document.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.btn, .language-btn');
      if (btn) {
        soundManager.playClick();
      }
    });

    // Language switcher
    document.getElementById('language-switcher')!.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.language-btn');
      if (btn) {
        const lang = btn.getAttribute('data-lang') as Language;
        setLanguage(lang);
        this.updateLanguageUI();
      }
    });

    // Player name input
    const nameInput = document.getElementById('player-name-input') as HTMLInputElement;
    nameInput.addEventListener('change', () => {
      setPlayerName(nameInput.value || 'Player');
    });

    // Play button
    document.getElementById('play-btn')!.addEventListener('click', () => {
      this.startGame();
    });

    // Leaderboard button
    document.getElementById('leaderboard-btn')!.addEventListener('click', () => {
      this.showLeaderboard();
    });

    // Leaderboard back button
    document.getElementById('leaderboard-back-btn')!.addEventListener('click', () => {
      this.showScreen('start');
    });

    // Pause button
    document.getElementById('pause-btn')!.addEventListener('click', () => {
      this.game?.pause();
    });

    // Resume button
    document.getElementById('resume-btn')!.addEventListener('click', () => {
      this.game?.resume();
    });

    // Quit button
    document.getElementById('quit-btn')!.addEventListener('click', () => {
      this.game?.setState('menu');
      this.showScreen('start');
    });

    // Play again button
    document.getElementById('play-again-btn')!.addEventListener('click', () => {
      this.startGame();
    });

    // Back to menu button
    document.getElementById('back-to-menu-btn')!.addEventListener('click', () => {
      this.showScreen('start');
      this.updateHighScoreDisplay();
    });

    // Language change event
    window.addEventListener('languagechange', () => {
      this.updateLanguageUI();
    });
  }

  private startGame(): void {
    // Save player name
    const nameInput = document.getElementById('player-name-input') as HTMLInputElement;
    setPlayerName(nameInput.value || 'Player');

    this.showScreen('game');

    // Initialize game if not exists
    if (!this.game) {
      const container = document.getElementById('canvas-container')!;
      this.game = new Game(container);

      // Setup callbacks
      this.game.onScoreChange = (score) => {
        this.scoreDisplay.textContent = formatScore(score);
      };

      this.game.onTimeChange = (time) => {
        this.timerDisplay.textContent = formatTime(time);

        // Update timer color based on remaining time
        this.timerDisplay.classList.remove('warning', 'critical');
        if (time <= 10) {
          this.timerDisplay.classList.add('critical');
        } else if (time <= 20) {
          this.timerDisplay.classList.add('warning');
        }
      };

      this.game.onStateChange = (state) => {
        this.handleGameStateChange(state);
      };

      this.game.onGameOver = (stats) => {
        this.showGameOver(stats);
      };
    }

    this.game.start();
  }

  private handleGameStateChange(state: GameState): void {
    switch (state) {
      case 'paused':
        this.pauseOverlay.classList.remove('hidden');
        break;
      case 'playing':
        this.pauseOverlay.classList.add('hidden');
        break;
      case 'gameover':
        // Handled by onGameOver callback
        break;
      case 'menu':
        this.pauseOverlay.classList.add('hidden');
        break;
    }
  }

  private showGameOver(stats: GameStats): void {
    // Update game over display
    document.getElementById('final-score')!.textContent = formatScore(stats.score);
    document.getElementById('coins-collected')!.textContent = stats.coins.toString();
    document.getElementById('gems-collected')!.textContent = stats.gems.toString();
    document.getElementById('stars-collected')!.textContent = stats.stars.toString();

    // Show new high score badge
    const badge = document.getElementById('new-high-score-badge')!;
    if (stats.isNewHighScore) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }

    this.showScreen('gameover');
  }

  private showLeaderboard(): void {
    const container = document.getElementById('leaderboard-container')!;
    const scores = getScores();

    if (scores.length === 0) {
      container.innerHTML = `
        <p style="text-align: center; padding: var(--spacing-lg); color: var(--text-secondary);">
          ${t('noScores')}
        </p>
      `;
    } else {
      container.innerHTML = `
        <ul class="leaderboard-list">
          ${scores.map((entry, index) => this.renderLeaderboardItem(entry, index)).join('')}
        </ul>
      `;
    }

    this.showScreen('leaderboard');
  }

  private renderLeaderboardItem(entry: ScoreEntry, index: number): string {
    const rankClass = index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : '';

    return `
      <li class="leaderboard-item animate-slide-up stagger-${Math.min(index + 1, 5)}">
        <div class="leaderboard-rank ${rankClass}">${index + 1}</div>
        <div class="leaderboard-name">${entry.playerName}</div>
        <div class="leaderboard-score">${formatScore(entry.score)}</div>
      </li>
    `;
  }

  private showScreen(screen: 'start' | 'game' | 'gameover' | 'leaderboard'): void {
    this.startScreen.classList.add('hidden');
    this.gameScreen.classList.add('hidden');
    this.gameoverScreen.classList.add('hidden');
    this.leaderboardScreen.classList.add('hidden');

    switch (screen) {
      case 'start':
        this.startScreen.classList.remove('hidden');
        break;
      case 'game':
        this.gameScreen.classList.remove('hidden');
        break;
      case 'gameover':
        this.gameoverScreen.classList.remove('hidden');
        break;
      case 'leaderboard':
        this.leaderboardScreen.classList.remove('hidden');
        break;
    }
  }

  private updateHighScoreDisplay(): void {
    const menuHighScore = document.getElementById('menu-high-score')!;
    menuHighScore.textContent = formatScore(getHighScore());
  }

  private updateLanguageUI(): void {
    // Update all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n') as any;
      if (key) {
        el.textContent = t(key);
      }
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder') as any;
      if (key) {
        (el as HTMLInputElement).placeholder = t(key);
      }
    });

    // Update language button active states
    const currentLang = getCurrentLanguage();
    document.querySelectorAll('.language-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === currentLang);
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SpaceCollectorApp();
});
