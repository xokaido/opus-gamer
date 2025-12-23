// Player spaceship with smooth movement and controls
import { GAME_CONFIG, COLORS } from '../utils/constants';
import { clamp, lerp } from '../utils/helpers';

export class Spaceship {
    public x: number;
    public y: number;
    public width: number = GAME_CONFIG.SHIP_WIDTH;
    public height: number = GAME_CONFIG.SHIP_HEIGHT;

    private targetX: number;
    private tilt: number = 0;
    private engineGlow: number = 0;
    private glowDirection: number = 1;

    constructor() {
        this.x = GAME_CONFIG.CANVAS_WIDTH / 2;
        this.y = GAME_CONFIG.CANVAS_HEIGHT - 120;
        this.targetX = this.x;
    }

    public setTargetX(x: number): void {
        this.targetX = clamp(
            x,
            this.width / 2 + 10,
            GAME_CONFIG.CANVAS_WIDTH - this.width / 2 - 10
        );
    }

    public moveLeft(): void {
        this.targetX = clamp(
            this.targetX - GAME_CONFIG.SHIP_SPEED * 5,
            this.width / 2 + 10,
            GAME_CONFIG.CANVAS_WIDTH - this.width / 2 - 10
        );
    }

    public moveRight(): void {
        this.targetX = clamp(
            this.targetX + GAME_CONFIG.SHIP_SPEED * 5,
            this.width / 2 + 10,
            GAME_CONFIG.CANVAS_WIDTH - this.width / 2 - 10
        );
    }

    public update(): void {
        // Smooth movement towards target
        const oldX = this.x;
        this.x = lerp(this.x, this.targetX, GAME_CONFIG.SHIP_SMOOTHING);

        // Calculate tilt based on movement direction
        const diff = this.x - oldX;
        this.tilt = lerp(this.tilt, clamp(diff * 3, -0.4, 0.4), 0.1);

        // Animate engine glow
        this.engineGlow += 0.1 * this.glowDirection;
        if (this.engineGlow > 1) {
            this.engineGlow = 1;
            this.glowDirection = -1;
        } else if (this.engineGlow < 0.5) {
            this.engineGlow = 0.5;
            this.glowDirection = 1;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.tilt);

        // Engine glow effect
        const glowGradient = ctx.createRadialGradient(
            0, this.height / 2 + 5, 0,
            0, this.height / 2 + 5, 25 * this.engineGlow
        );
        glowGradient.addColorStop(0, `rgba(0, 212, 255, ${0.8 * this.engineGlow})`);
        glowGradient.addColorStop(0.5, `rgba(255, 0, 255, ${0.4 * this.engineGlow})`);
        glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(0, this.height / 2 + 5, 25 * this.engineGlow, 0, Math.PI * 2);
        ctx.fillStyle = glowGradient;
        ctx.fill();

        // Engine flame
        ctx.beginPath();
        ctx.moveTo(-8, this.height / 2 - 5);
        ctx.lineTo(0, this.height / 2 + 15 + this.engineGlow * 10);
        ctx.lineTo(8, this.height / 2 - 5);
        ctx.closePath();

        const flameGradient = ctx.createLinearGradient(0, this.height / 2 - 5, 0, this.height / 2 + 20);
        flameGradient.addColorStop(0, COLORS.NEON_BLUE);
        flameGradient.addColorStop(0.5, COLORS.NEON_PURPLE);
        flameGradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
        ctx.fillStyle = flameGradient;
        ctx.fill();

        // Ship body - main hull
        ctx.beginPath();
        ctx.moveTo(0, -this.height / 2); // Nose
        ctx.lineTo(-this.width / 2, this.height / 2 - 10); // Left wing tip
        ctx.lineTo(-this.width / 4, this.height / 2 - 5); // Left inner
        ctx.lineTo(-this.width / 4, this.height / 2); // Left bottom
        ctx.lineTo(this.width / 4, this.height / 2); // Right bottom
        ctx.lineTo(this.width / 4, this.height / 2 - 5); // Right inner
        ctx.lineTo(this.width / 2, this.height / 2 - 10); // Right wing tip
        ctx.closePath();

        // Ship gradient
        const shipGradient = ctx.createLinearGradient(0, -this.height / 2, 0, this.height / 2);
        shipGradient.addColorStop(0, '#4a4a6a');
        shipGradient.addColorStop(0.5, '#2a2a4a');
        shipGradient.addColorStop(1, '#1a1a3a');
        ctx.fillStyle = shipGradient;
        ctx.fill();

        // Ship outline
        ctx.strokeStyle = COLORS.NEON_BLUE;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Cockpit glow
        ctx.beginPath();
        ctx.ellipse(0, -this.height / 6, 10, 15, 0, 0, Math.PI * 2);
        const cockpitGradient = ctx.createRadialGradient(0, -this.height / 6, 0, 0, -this.height / 6, 15);
        cockpitGradient.addColorStop(0, COLORS.NEON_BLUE);
        cockpitGradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.5)');
        cockpitGradient.addColorStop(1, 'rgba(0, 212, 255, 0.1)');
        ctx.fillStyle = cockpitGradient;
        ctx.fill();

        // Wing lights
        ctx.beginPath();
        ctx.arc(-this.width / 3, this.height / 4, 3, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.NEON_PINK;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.width / 3, this.height / 4, 3, 0, Math.PI * 2);
        ctx.fillStyle = COLORS.NEON_PINK;
        ctx.fill();

        ctx.restore();
    }

    public getCollisionRadius(): number {
        return this.width / 3;
    }

    public reset(): void {
        this.x = GAME_CONFIG.CANVAS_WIDTH / 2;
        this.y = GAME_CONFIG.CANVAS_HEIGHT - 120;
        this.targetX = this.x;
        this.tilt = 0;
    }
}
