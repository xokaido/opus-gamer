// Particle system for visual effects
import { COLORS } from '../utils/constants';
import { randomBetween } from '../utils/helpers';

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
    type: 'explosion' | 'collect' | 'trail';
}

export class ParticleSystem {
    private particles: Particle[] = [];

    public emit(
        x: number,
        y: number,
        count: number,
        color: string,
        type: Particle['type'] = 'collect'
    ): void {
        for (let i = 0; i < count; i++) {
            const angle = randomBetween(0, Math.PI * 2);
            const speed = type === 'explosion'
                ? randomBetween(3, 8)
                : randomBetween(1, 4);

            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed + (type === 'trail' ? 2 : 0),
                life: 1,
                maxLife: 1,
                size: type === 'explosion' ? randomBetween(3, 8) : randomBetween(2, 5),
                color,
                type,
            });
        }
    }

    public emitCollect(x: number, y: number, color: string): void {
        // Sparkle effect for collection
        this.emit(x, y, 12, color, 'collect');

        // Add some white sparkles
        this.emit(x, y, 5, '#ffffff', 'collect');
    }

    public emitExplosion(x: number, y: number): void {
        // Main explosion
        this.emit(x, y, 20, COLORS.NEON_PINK, 'explosion');
        this.emit(x, y, 15, COLORS.NEON_PURPLE, 'explosion');
        this.emit(x, y, 10, '#ffffff', 'explosion');
    }

    public emitTrail(x: number, y: number): void {
        this.emit(x, y, 1, COLORS.NEON_BLUE, 'trail');
    }

    public update(): void {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;

            // Apply gravity for explosion particles
            if (p.type === 'explosion') {
                p.vy += 0.1;
            }

            // Fade and shrink
            if (p.type === 'trail') {
                p.life -= 0.03;
            }

            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        for (const p of this.particles) {
            const alpha = p.life;
            const size = p.size * p.life;

            ctx.save();
            ctx.globalAlpha = alpha;

            // Glow effect
            const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2);
            glow.addColorStop(0, p.color);
            glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.beginPath();
            ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
            ctx.fillStyle = glow;
            ctx.fill();

            // Core
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();

            ctx.restore();
        }
    }

    public clear(): void {
        this.particles = [];
    }

    public get count(): number {
        return this.particles.length;
    }
}
