// Collectible items: coins, gems, stars
import { GAME_CONFIG, COLORS } from '../utils/constants';
import { randomBetween } from '../utils/helpers';

export type CollectibleType = 'coin' | 'gem' | 'star' | 'enhancer' | 'reducer';

export interface CollectibleConfig {
    type: CollectibleType;
    radius: number;
    points: number;
    color: string;
    glowColor: string;
}

const COLLECTIBLE_CONFIGS: Record<CollectibleType, Omit<CollectibleConfig, 'type'>> = {
    coin: {
        radius: GAME_CONFIG.COIN_RADIUS,
        points: GAME_CONFIG.COIN_POINTS,
        color: COLORS.NEON_GOLD,
        glowColor: 'rgba(255, 215, 0, 0.5)',
    },
    gem: {
        radius: GAME_CONFIG.GEM_RADIUS,
        points: GAME_CONFIG.GEM_POINTS,
        color: COLORS.NEON_PURPLE,
        glowColor: 'rgba(139, 0, 255, 0.5)',
    },
    star: {
        radius: GAME_CONFIG.STAR_RADIUS,
        points: GAME_CONFIG.STAR_POINTS,
        color: COLORS.NEON_BLUE,
        glowColor: 'rgba(0, 212, 255, 0.5)',
    },
    enhancer: {
        radius: GAME_CONFIG.ENHANCER_RADIUS,
        points: 0,
        color: COLORS.NEON_GREEN,
        glowColor: 'rgba(0, 255, 136, 0.5)',
    },
    reducer: {
        radius: GAME_CONFIG.REDUCER_RADIUS,
        points: 0,
        color: COLORS.NEON_PINK,
        glowColor: 'rgba(255, 0, 255, 0.5)',
    },
};

export class Collectible {
    public x: number;
    public y: number;
    public type: CollectibleType;
    public radius: number;
    public points: number;
    public collected: boolean = false;

    private color: string;
    private glowColor: string;
    private rotation: number = 0;
    private rotationSpeed: number;
    private bobOffset: number = 0;
    private bobSpeed: number;
    private pulsePhase: number = 0;

    constructor(x: number, y: number, type: CollectibleType) {
        this.x = x;
        this.y = y;
        this.type = type;

        const config = COLLECTIBLE_CONFIGS[type];
        this.radius = config.radius;
        this.points = config.points;
        this.color = config.color;
        this.glowColor = config.glowColor;

        this.rotationSpeed = randomBetween(0.02, 0.05);
        this.bobSpeed = randomBetween(0.05, 0.1);
        this.pulsePhase = randomBetween(0, Math.PI * 2);
    }

    public update(scrollSpeed: number): void {
        this.y += scrollSpeed;
        this.rotation += this.rotationSpeed;
        this.bobOffset = Math.sin(this.pulsePhase) * 3;
        this.pulsePhase += this.bobSpeed;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        if (this.collected) return;

        ctx.save();
        ctx.translate(this.x, this.y + this.bobOffset);
        ctx.rotate(this.rotation);

        // Outer glow
        const glowSize = this.radius * 2 + Math.sin(this.pulsePhase) * 5;
        const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
        glow.addColorStop(0, this.glowColor);
        glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        switch (this.type) {
            case 'coin':
                this.renderCoin(ctx);
                break;
            case 'gem':
                this.renderGem(ctx);
                break;
            case 'star':
                this.renderStar(ctx);
                break;
            case 'enhancer':
                this.renderEnhancer(ctx);
                break;
            case 'reducer':
                this.renderReducer(ctx);
                break;
        }

        ctx.restore();
    }

    private renderCoin(ctx: CanvasRenderingContext2D): void {
        // Coin body
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
            -this.radius / 3, -this.radius / 3, 0,
            0, 0, this.radius
        );
        gradient.addColorStop(0, '#fff7a1');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, '#cc9900');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Inner ring
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Dollar sign or symbol
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = `bold ${this.radius}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);
    }

    private renderGem(ctx: CanvasRenderingContext2D): void {
        const r = this.radius;

        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r * 0.8, 0);
        ctx.lineTo(0, r);
        ctx.lineTo(-r * 0.8, 0);
        ctx.closePath();

        // Gradient fill
        const gradient = ctx.createLinearGradient(0, -r, 0, r);
        gradient.addColorStop(0, '#ff88ff');
        gradient.addColorStop(0.4, this.color);
        gradient.addColorStop(0.6, this.color);
        gradient.addColorStop(1, '#4400aa');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Shine effect
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r * 0.3, -r * 0.2);
        ctx.lineTo(0, -r * 0.3);
        ctx.lineTo(-r * 0.3, -r * 0.2);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();

        // Border
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.lineTo(r * 0.8, 0);
        ctx.lineTo(0, r);
        ctx.lineTo(-r * 0.8, 0);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    private renderStar(ctx: CanvasRenderingContext2D): void {
        const spikes = 5;
        const outerRadius = this.radius;
        const innerRadius = this.radius * 0.5;

        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();

        // Gradient fill
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, outerRadius);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(1, '#0066aa');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    private renderEnhancer(ctx: CanvasRenderingContext2D): void {
        const r = this.radius;

        // Clock circle
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, this.color);
        gradient.addColorStop(1, '#00aa66');
        ctx.fillStyle = gradient;
        ctx.fill();

        // Border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Clock face center
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Clock hands
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -r * 0.6); // Hour hand
        ctx.moveTo(0, 0);
        ctx.lineTo(r * 0.4, 0); // Minute hand
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    private renderReducer(ctx: CanvasRenderingContext2D): void {
        const r = this.radius;
        const w = r * 0.7;
        const h = r * 0.9;

        // Hourglass body
        ctx.beginPath();
        ctx.moveTo(-w, -h);
        ctx.lineTo(w, -h);
        ctx.lineTo(-w, h);
        ctx.lineTo(w, h);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, -h, 0, h);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, '#ffffff');
        gradient.addColorStop(1, this.color);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Sand
        ctx.beginPath();
        ctx.moveTo(-w * 0.6, -h * 0.8);
        ctx.lineTo(w * 0.6, -h * 0.8);
        ctx.lineTo(0, 0);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-w * 0.8, h * 0.8);
        ctx.lineTo(w * 0.8, h * 0.8);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();

        // Frames
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-w, -h); ctx.lineTo(w, -h);
        ctx.moveTo(-w, h); ctx.lineTo(w, h);
        ctx.stroke();
    }

    public isOffScreen(): boolean {
        return this.y > GAME_CONFIG.CANVAS_HEIGHT + this.radius;
    }
}
