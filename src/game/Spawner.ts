// Spawner system for collectibles and obstacles
import { GAME_CONFIG } from '../utils/constants';
import { randomBetween, randomInt } from '../utils/helpers';
import { Collectible } from './Collectible';
import type { CollectibleType } from './Collectible';
import { Obstacle } from './Obstacle';

export class Spawner {
    private frameCount: number = 0;
    private difficulty: number = 1;
    private spawnRate: number = GAME_CONFIG.SPAWN_RATE;

    public collectibles: Collectible[] = [];
    public obstacles: Obstacle[] = [];

    public reset(): void {
        this.frameCount = 0;
        this.difficulty = 1;
        this.spawnRate = GAME_CONFIG.SPAWN_RATE;
        this.collectibles = [];
        this.obstacles = [];
    }

    public update(): void {
        this.frameCount++;

        // Increase difficulty over time
        this.difficulty += GAME_CONFIG.DIFFICULTY_INCREASE_RATE;

        // Spawn logic
        if (this.frameCount % Math.floor(this.spawnRate / this.difficulty) === 0) {
            this.spawnWave();
        }
    }

    private spawnWave(): void {
        const padding = 50;
        const laneWidth = (GAME_CONFIG.CANVAS_WIDTH - padding * 2) / 5;

        // Decide what to spawn
        const spawnType = Math.random();

        if (spawnType < 0.4) {
            // Spawn a row of collectibles
            const lane = randomInt(0, 4);
            const x = padding + laneWidth * lane + laneWidth / 2;
            const collectibleType = this.getRandomCollectibleType();
            this.collectibles.push(new Collectible(x, -30, collectibleType));

            // Sometimes spawn additional collectibles in adjacent lanes
            if (Math.random() < 0.3 && lane > 0) {
                const x2 = padding + laneWidth * (lane - 1) + laneWidth / 2;
                this.collectibles.push(new Collectible(x2, -30, 'coin'));
            }
            if (Math.random() < 0.3 && lane < 4) {
                const x3 = padding + laneWidth * (lane + 1) + laneWidth / 2;
                this.collectibles.push(new Collectible(x3, -30, 'coin'));
            }
        } else if (spawnType < 0.7) {
            // Spawn an obstacle
            const x = randomBetween(padding + 30, GAME_CONFIG.CANVAS_WIDTH - padding - 30);
            this.obstacles.push(new Obstacle(x, -40));
        } else {
            // Spawn mixed: collectible + obstacle
            const obstacleLane = randomInt(0, 4);
            const collectibleLane = (obstacleLane + randomInt(1, 4)) % 5;

            const obstacleX = padding + laneWidth * obstacleLane + laneWidth / 2;
            const collectibleX = padding + laneWidth * collectibleLane + laneWidth / 2;

            this.obstacles.push(new Obstacle(obstacleX, -40));
            this.collectibles.push(new Collectible(
                collectibleX,
                -30,
                this.getRandomCollectibleType()
            ));
        }
    }

    private getRandomCollectibleType(): CollectibleType {
        const rand = Math.random();
        if (rand < 0.6) return 'coin';
        if (rand < 0.85) return 'star';
        return 'gem';
    }

    public getScrollSpeed(): number {
        return Math.min(
            GAME_CONFIG.BASE_SCROLL_SPEED * this.difficulty,
            GAME_CONFIG.MAX_SCROLL_SPEED
        );
    }

    public cleanup(): void {
        this.collectibles = this.collectibles.filter(c => !c.isOffScreen() && !c.collected);
        this.obstacles = this.obstacles.filter(o => !o.isOffScreen() && o.active);
    }
}
