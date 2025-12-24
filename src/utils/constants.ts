// Game constants
export const GAME_CONFIG = {
  // Game dimensions
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 700,

  // Game mechanics
  GAME_DURATION: 45, // seconds
  SPAWN_RATE: 60, // frames between spawns
  DIFFICULTY_INCREASE_RATE: 0.001,

  // Spaceship
  SHIP_WIDTH: 50,
  SHIP_HEIGHT: 60,
  SHIP_SPEED: 8,
  SHIP_SMOOTHING: 0.15,

  // Collectibles
  COIN_RADIUS: 15,
  COIN_POINTS: 10,
  GEM_RADIUS: 18,
  GEM_POINTS: 50,
  STAR_RADIUS: 12,
  STAR_POINTS: 25,

  ENHANCER_RADIUS: 18,
  ENHANCER_TIME: 10,
  REDUCER_RADIUS: 18,
  REDUCER_TIME: 5,

  // Obstacles
  ASTEROID_MIN_RADIUS: 20,
  ASTEROID_MAX_RADIUS: 40,

  // Speeds
  BASE_SCROLL_SPEED: 3,
  MAX_SCROLL_SPEED: 8,

  // Visual
  STAR_COUNT: 100,
  PARTICLE_COUNT: 20,
} as const;

export const COLORS = {
  // Background
  SPACE_DARK: '#0a0a1a',
  SPACE_PURPLE: '#1a0a2e',

  // Neon accents
  NEON_BLUE: '#00d4ff',
  NEON_PINK: '#ff00ff',
  NEON_PURPLE: '#8b00ff',
  NEON_GOLD: '#ffd700',
  NEON_GREEN: '#00ff88',

  // UI
  GLASS_BG: 'rgba(255, 255, 255, 0.1)',
  GLASS_BORDER: 'rgba(255, 255, 255, 0.2)',
  TEXT_PRIMARY: '#ffffff',
  TEXT_SECONDARY: 'rgba(255, 255, 255, 0.7)',
} as const;

export const STORAGE_KEYS = {
  SCORES: 'space_collector_scores',
  PLAYER_NAME: 'space_collector_player',
  LANGUAGE: 'space_collector_language',
  SOUND: 'space_collector_sound',
} as const;
