// English translations
export const en = {
    // App
    appName: 'Space Collector',
    tagline: 'Collect stars, avoid asteroids!',

    // Start screen
    play: 'Play',
    leaderboard: 'Leaderboard',
    settings: 'Settings',
    highScore: 'High Score',

    // Game
    score: 'Score',
    time: 'Time',
    pause: 'Pause',
    resume: 'Resume',

    // Game Over
    gameOver: 'Game Over',
    finalScore: 'Final Score',
    newHighScore: 'New High Score!',
    coinsCollected: 'Coins Collected',
    gemsCollected: 'Gems Collected',
    starsCollected: 'Stars Collected',
    playAgain: 'Play Again',
    mainMenu: 'Main Menu',

    // Leaderboard
    leaderboardTitle: 'Leaderboard',
    rank: 'Rank',
    player: 'Player',
    noScores: 'No scores yet. Be the first!',
    back: 'Back',

    // Settings
    enterName: 'Enter your name',
    playerName: 'Player Name',
    sound: 'Sound',
    on: 'On',
    off: 'Off',
    language: 'Language',
    save: 'Save',

    // Instructions
    instructions: 'How to Play',
    instructionMove: 'Swipe or use arrow keys to move',
    instructionCollect: 'Collect coins, gems, and stars',
    instructionAvoid: 'Avoid asteroids',
    instructionTime: 'You have 45 seconds!',

    // Misc
    loading: 'Loading...',
    tapToStart: 'Tap to Start',
    getReady: 'Get Ready!',
} as const;

export type TranslationKey = keyof typeof en;
