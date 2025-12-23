// Main Game class - orchestrates all game components
import { Canvas } from './Canvas';
import { Spaceship } from './Spaceship';
import { Spawner } from './Spawner';
import { ParticleSystem } from './ParticleSystem';
import { GAME_CONFIG, COLORS } from '../utils/constants';
import { circlesCollide } from '../utils/helpers';
import {
    saveScore,
    getHighScore,
    isHighScore,
    getPlayerName
} from '../storage/ScoreStorage';
import { soundManager } from '../audio/SoundManager';

export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export interface GameStats {
    score: number;
    coins: number;
    gems: number;
    stars: number;
    highScore: number;
    isNewHighScore: boolean;
}

export class Game {
    private canvas: Canvas;
    private ctx: CanvasRenderingContext2D;
    private spaceship: Spaceship;
    private spawner: Spawner;
    private particles: ParticleSystem;

    private state: GameState = 'menu';
    private score: number = 0;
    private timeRemaining: number = GAME_CONFIG.GAME_DURATION;
    private lastTime: number = 0;
    private animationId: number = 0;

    private coins: number = 0;
    private gems: number = 0;
    private stars: number = 0;

    private screenShake: number = 0;
    private lastTimeWarning: number = 0;

    // Event callbacks
    public onStateChange?: (state: GameState) => void;
    public onScoreChange?: (score: number) => void;
    public onTimeChange?: (time: number) => void;
    public onGameOver?: (stats: GameStats) => void;

    constructor(container: HTMLElement) {
        this.canvas = new Canvas(container);
        this.ctx = this.canvas.getContext();
        this.spaceship = new Spaceship();
        this.spawner = new Spawner();
        this.particles = new ParticleSystem();

        this.setupInput();
        this.startLoop();
    }

    private setupInput(): void {
        const canvas = this.canvas.getCanvas();

        // Touch controls
        let touchStartX: number | null = null;

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (touchStartX === null || this.state !== 'playing') return;

            const rect = canvas.getBoundingClientRect();
            const touchX = e.touches[0].clientX - rect.left;
            const gameX = (touchX / rect.width) * GAME_CONFIG.CANVAS_WIDTH;
            this.spaceship.setTargetX(gameX);
        }, { passive: false });

        canvas.addEventListener('touchend', () => {
            touchStartX = null;
        });

        // Mouse controls (for desktop)
        canvas.addEventListener('mousemove', (e) => {
            if (this.state !== 'playing') return;

            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const gameX = (mouseX / rect.width) * GAME_CONFIG.CANVAS_WIDTH;
            this.spaceship.setTargetX(gameX);
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.state !== 'playing') return;

            switch (e.key) {
                case 'ArrowLeft':
                case 'a':
                    this.spaceship.moveLeft();
                    break;
                case 'ArrowRight':
                case 'd':
                    this.spaceship.moveRight();
                    break;
                case 'Escape':
                    this.pause();
                    break;
            }
        });
    }

    private startLoop(): void {
        const loop = (time: number) => {
            const delta = (time - this.lastTime) / 1000;
            this.lastTime = time;

            this.update(delta);
            this.render();

            this.animationId = requestAnimationFrame(loop);
        };

        this.animationId = requestAnimationFrame(loop);
    }

    private update(delta: number): void {
        // Always update starfield
        this.canvas.updateStars(this.state === 'playing' ? this.spawner.getScrollSpeed() : 1);
        this.particles.update();

        if (this.state !== 'playing') return;

        // Update timer
        this.timeRemaining -= delta;
        if (this.timeRemaining <= 0) {
            this.timeRemaining = 0;
            this.gameOver();
            return;
        }
        this.onTimeChange?.(Math.ceil(this.timeRemaining));

        // Time warning beep at 10, 5, 4, 3, 2, 1
        const currentSecond = Math.ceil(this.timeRemaining);
        if (currentSecond <= 10 && currentSecond !== this.lastTimeWarning) {
            this.lastTimeWarning = currentSecond;
            soundManager.playTimeWarning();
        }

        // Update game objects
        this.spaceship.update();
        this.spawner.update();

        // Emit ship trail particles occasionally
        if (Math.random() < 0.3) {
            this.particles.emitTrail(
                this.spaceship.x,
                this.spaceship.y + this.spaceship.height / 2
            );
        }

        const scrollSpeed = this.spawner.getScrollSpeed();

        // Update collectibles
        for (const collectible of this.spawner.collectibles) {
            collectible.update(scrollSpeed);

            // Check collision with spaceship
            if (!collectible.collected && circlesCollide(
                this.spaceship.x, this.spaceship.y,
                this.spaceship.getCollisionRadius(),
                collectible.x, collectible.y,
                collectible.radius
            )) {
                collectible.collected = true;
                this.addScore(collectible.points, collectible.type);

                // Play sound based on collectible type
                if (collectible.type === 'coin') {
                    soundManager.playCoinCollect();
                } else if (collectible.type === 'gem') {
                    soundManager.playGemCollect();
                } else {
                    soundManager.playStarCollect();
                }

                this.particles.emitCollect(
                    collectible.x,
                    collectible.y,
                    collectible.type === 'coin' ? COLORS.NEON_GOLD :
                        collectible.type === 'gem' ? COLORS.NEON_PURPLE :
                            COLORS.NEON_BLUE
                );
            }
        }

        // Update obstacles
        for (const obstacle of this.spawner.obstacles) {
            obstacle.update(scrollSpeed);

            // Check collision with spaceship
            if (obstacle.active && circlesCollide(
                this.spaceship.x, this.spaceship.y,
                this.spaceship.getCollisionRadius(),
                obstacle.x, obstacle.y,
                obstacle.getCollisionRadius()
            )) {
                obstacle.active = false;
                this.hitObstacle();
                this.particles.emitExplosion(obstacle.x, obstacle.y);
                soundManager.playHit();
            }
        }

        // Cleanup off-screen objects
        this.spawner.cleanup();

        // Update screen shake
        if (this.screenShake > 0) {
            this.screenShake *= 0.9;
            if (this.screenShake < 0.1) this.screenShake = 0;
        }
    }

    private render(): void {
        this.ctx.save();

        // Apply screen shake
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake * 10;
            const shakeY = (Math.random() - 0.5) * this.screenShake * 10;
            this.ctx.translate(shakeX, shakeY);
        }

        // Clear and render background
        this.canvas.clear();
        this.canvas.renderStars();

        if (this.state === 'playing' || this.state === 'paused') {
            // Render game objects
            for (const collectible of this.spawner.collectibles) {
                collectible.render(this.ctx);
            }

            for (const obstacle of this.spawner.obstacles) {
                obstacle.render(this.ctx);
            }

            this.spaceship.render(this.ctx);
        }

        // Always render particles
        this.particles.render(this.ctx);

        this.ctx.restore();
    }

    private addScore(points: number, type: string): void {
        this.score += points;
        this.onScoreChange?.(this.score);

        switch (type) {
            case 'coin':
                this.coins++;
                break;
            case 'gem':
                this.gems++;
                break;
            case 'star':
                this.stars++;
                break;
        }
    }

    private hitObstacle(): void {
        // Penalty for hitting obstacle
        this.score = Math.max(0, this.score - 20);
        this.onScoreChange?.(this.score);
        this.screenShake = 1;

        // Lose 2 seconds
        this.timeRemaining = Math.max(0, this.timeRemaining - 2);
    }

    public start(): void {
        this.reset();
        this.state = 'playing';
        this.onStateChange?.(this.state);
        soundManager.playGameStart();
    }

    public pause(): void {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.onStateChange?.(this.state);
        }
    }

    public resume(): void {
        if (this.state === 'paused') {
            this.state = 'playing';
            this.onStateChange?.(this.state);
        }
    }

    private gameOver(): void {
        this.state = 'gameover';
        this.onStateChange?.(this.state);
        soundManager.playGameOver();

        const highScore = getHighScore();
        const isNew = isHighScore(this.score);

        // Save score
        if (isNew) {
            saveScore({
                playerName: getPlayerName(),
                score: this.score,
                coins: this.coins,
                gems: this.gems,
                stars: this.stars,
            });
        }

        const stats: GameStats = {
            score: this.score,
            coins: this.coins,
            gems: this.gems,
            stars: this.stars,
            highScore: isNew ? this.score : highScore,
            isNewHighScore: isNew && this.score > highScore,
        };

        // Play high score fanfare if applicable
        if (stats.isNewHighScore) {
            setTimeout(() => soundManager.playHighScore(), 500);
        }

        this.onGameOver?.(stats);
    }

    private reset(): void {
        this.score = 0;
        this.coins = 0;
        this.gems = 0;
        this.stars = 0;
        this.timeRemaining = GAME_CONFIG.GAME_DURATION;
        this.screenShake = 0;
        this.lastTimeWarning = 0;

        this.spaceship.reset();
        this.spawner.reset();
        this.particles.clear();

        this.onScoreChange?.(0);
        this.onTimeChange?.(GAME_CONFIG.GAME_DURATION);
    }

    public getState(): GameState {
        return this.state;
    }

    public setState(state: GameState): void {
        this.state = state;
        this.onStateChange?.(state);
    }

    public destroy(): void {
        cancelAnimationFrame(this.animationId);
    }
}
