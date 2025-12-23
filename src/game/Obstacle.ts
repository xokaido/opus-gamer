// Obstacles: Asteroids
import { GAME_CONFIG } from '../utils/constants';
import { randomBetween, randomInt } from '../utils/helpers';

export class Obstacle {
    public x: number;
    public y: number;
    public radius: number;
    public active: boolean = true;

    private rotation: number = 0;
    private rotationSpeed: number;
    private points: { x: number; y: number }[] = [];
    private craterCount: number;
    private baseColor: string;

    constructor(x: number, y: number, radius?: number) {
        this.x = x;
        this.y = y;
        this.radius = radius ?? randomBetween(
            GAME_CONFIG.ASTEROID_MIN_RADIUS,
            GAME_CONFIG.ASTEROID_MAX_RADIUS
        );
        this.rotationSpeed = randomBetween(-0.02, 0.02);
        this.craterCount = randomInt(2, 5);
        this.baseColor = `hsl(${randomInt(20, 40)}, ${randomInt(10, 30)}%, ${randomInt(25, 40)}%)`;

        this.generateShape();
    }

    private generateShape(): void {
        const pointCount = randomInt(8, 12);
        this.points = [];

        for (let i = 0; i < pointCount; i++) {
            const angle = (i / pointCount) * Math.PI * 2;
            const radiusVariation = this.radius * randomBetween(0.7, 1.1);

            this.points.push({
                x: Math.cos(angle) * radiusVariation,
                y: Math.sin(angle) * radiusVariation,
            });
        }
    }

    public update(scrollSpeed: number): void {
        this.y += scrollSpeed;
        this.rotation += this.rotationSpeed;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Shadow/glow effect
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fill();

        // Main asteroid body
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.closePath();

        // Gradient fill
        const gradient = ctx.createRadialGradient(
            -this.radius * 0.3, -this.radius * 0.3, 0,
            0, 0, this.radius
        );
        gradient.addColorStop(0, `hsl(30, 20%, 50%)`);
        gradient.addColorStop(0.5, this.baseColor);
        gradient.addColorStop(1, `hsl(30, 15%, 20%)`);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Craters
        for (let i = 0; i < this.craterCount; i++) {
            const angle = (i / this.craterCount) * Math.PI * 2 + 0.5;
            const dist = this.radius * randomBetween(0.2, 0.5);
            const craterX = Math.cos(angle) * dist;
            const craterY = Math.sin(angle) * dist;
            const craterRadius = this.radius * randomBetween(0.1, 0.2);

            ctx.beginPath();
            ctx.arc(craterX, craterY, craterRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fill();
        }

        // Highlight
        ctx.beginPath();
        ctx.arc(-this.radius * 0.3, -this.radius * 0.3, this.radius * 0.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.fill();

        ctx.restore();
    }

    public isOffScreen(): boolean {
        return this.y > GAME_CONFIG.CANVAS_HEIGHT + this.radius;
    }

    public getCollisionRadius(): number {
        return this.radius * 0.8; // Slightly smaller for fair gameplay
    }
}
