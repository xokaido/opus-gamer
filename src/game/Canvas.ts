// Canvas renderer with animated starfield background
import { GAME_CONFIG, COLORS } from '../utils/constants';
import { randomBetween } from '../utils/helpers';

interface Star {
    x: number;
    y: number;
    size: number;
    speed: number;
    brightness: number;
}

export class Canvas {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private stars: Star[] = [];
    private scale: number = 1;

    constructor(container: HTMLElement) {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'game-canvas';
        this.ctx = this.canvas.getContext('2d')!;

        container.appendChild(this.canvas);
        this.resize();
        this.initStars();

        window.addEventListener('resize', () => this.resize());
    }

    private resize(): void {
        const maxWidth = Math.min(window.innerWidth, GAME_CONFIG.CANVAS_WIDTH);
        const maxHeight = Math.min(window.innerHeight * 0.85, GAME_CONFIG.CANVAS_HEIGHT);

        const aspectRatio = GAME_CONFIG.CANVAS_WIDTH / GAME_CONFIG.CANVAS_HEIGHT;

        let width = maxWidth;
        let height = width / aspectRatio;

        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }

        this.scale = width / GAME_CONFIG.CANVAS_WIDTH;

        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.canvas.width = GAME_CONFIG.CANVAS_WIDTH;
        this.canvas.height = GAME_CONFIG.CANVAS_HEIGHT;
    }

    private initStars(): void {
        this.stars = [];
        for (let i = 0; i < GAME_CONFIG.STAR_COUNT; i++) {
            this.stars.push({
                x: randomBetween(0, GAME_CONFIG.CANVAS_WIDTH),
                y: randomBetween(0, GAME_CONFIG.CANVAS_HEIGHT),
                size: randomBetween(0.5, 2),
                speed: randomBetween(0.5, 2),
                brightness: randomBetween(0.3, 1),
            });
        }
    }

    public getContext(): CanvasRenderingContext2D {
        return this.ctx;
    }

    public getScale(): number {
        return this.scale;
    }

    public getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    public clear(): void {
        // Create gradient background
        const gradient = this.ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.CANVAS_HEIGHT);
        gradient.addColorStop(0, COLORS.SPACE_DARK);
        gradient.addColorStop(0.5, COLORS.SPACE_PURPLE);
        gradient.addColorStop(1, COLORS.SPACE_DARK);

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    }

    public updateStars(speedMultiplier: number = 1): void {
        for (const star of this.stars) {
            star.y += star.speed * speedMultiplier;

            if (star.y > GAME_CONFIG.CANVAS_HEIGHT) {
                star.y = 0;
                star.x = randomBetween(0, GAME_CONFIG.CANVAS_WIDTH);
            }
        }
    }

    public renderStars(): void {
        for (const star of this.stars) {
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
            this.ctx.fill();

            // Add subtle glow to larger stars
            if (star.size > 1.5) {
                this.ctx.beginPath();
                this.ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * 0.2})`;
                this.ctx.fill();
            }
        }
    }

    public getWidth(): number {
        return GAME_CONFIG.CANVAS_WIDTH;
    }

    public getHeight(): number {
        return GAME_CONFIG.CANVAS_HEIGHT;
    }
}
