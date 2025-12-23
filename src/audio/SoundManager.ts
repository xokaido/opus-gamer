// Sound Manager using Web Audio API for synthetic sounds
import { STORAGE_KEYS } from '../utils/constants';

class SoundManager {
    private audioContext: AudioContext | null = null;
    private enabled: boolean = true;
    private masterVolume: number = 0.3;

    constructor() {
        this.enabled = localStorage.getItem(STORAGE_KEYS.SOUND) !== 'false';
    }

    private getContext(): AudioContext {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return this.audioContext;
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    public toggle(): boolean {
        this.enabled = !this.enabled;
        localStorage.setItem(STORAGE_KEYS.SOUND, this.enabled.toString());
        return this.enabled;
    }

    public setEnabled(enabled: boolean): void {
        this.enabled = enabled;
        localStorage.setItem(STORAGE_KEYS.SOUND, enabled.toString());
    }

    private playTone(
        frequency: number,
        duration: number,
        type: OscillatorType = 'sine',
        volume: number = 1
    ): void {
        if (!this.enabled) return;

        try {
            const ctx = this.getContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

            // Volume envelope
            const vol = this.masterVolume * volume;
            gainNode.gain.setValueAtTime(vol, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
        } catch (e) {
            // Ignore audio errors silently
        }
    }

    // Coin collection - cheerful ascending beep
    public playCoinCollect(): void {
        if (!this.enabled) return;

        try {
            const ctx = this.getContext();
            const now = ctx.currentTime;

            // Quick ascending notes
            [523, 659, 784].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, now + i * 0.05);

                gain.gain.setValueAtTime(this.masterVolume * 0.3, now + i * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.1);

                osc.start(now + i * 0.05);
                osc.stop(now + i * 0.05 + 0.1);
            });
        } catch (e) { }
    }

    // Gem collection - magical sparkle sound
    public playGemCollect(): void {
        if (!this.enabled) return;

        try {
            const ctx = this.getContext();
            const now = ctx.currentTime;

            // Shimmer effect with multiple frequencies
            [880, 1100, 1320, 1540].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.03);

                gain.gain.setValueAtTime(this.masterVolume * 0.25, now + i * 0.03);
                gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.03 + 0.15);

                osc.start(now + i * 0.03);
                osc.stop(now + i * 0.03 + 0.15);
            });
        } catch (e) { }
    }

    // Star collection - bright twinkle
    public playStarCollect(): void {
        if (!this.enabled) return;

        try {
            const ctx = this.getContext();
            const now = ctx.currentTime;

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);

            gain.gain.setValueAtTime(this.masterVolume * 0.35, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

            osc.start(now);
            osc.stop(now + 0.2);
        } catch (e) { }
    }

    // Hit obstacle - impact/explosion sound
    public playHit(): void {
        if (!this.enabled) return;

        try {
            const ctx = this.getContext();
            const now = ctx.currentTime;

            // Noise burst for explosion
            const bufferSize = ctx.sampleRate * 0.2;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
            }

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(500, now);
            filter.frequency.exponentialRampToValueAtTime(100, now + 0.2);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(this.masterVolume * 0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            noise.start(now);
            noise.stop(now + 0.2);

            // Low frequency thump
            const osc = ctx.createOscillator();
            const oscGain = ctx.createGain();
            osc.connect(oscGain);
            oscGain.connect(ctx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.15);

            oscGain.gain.setValueAtTime(this.masterVolume * 0.4, now);
            oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

            osc.start(now);
            osc.stop(now + 0.15);
        } catch (e) { }
    }

    // Game start - ready beep sequence
    public playGameStart(): void {
        if (!this.enabled) return;

        try {
            const ctx = this.getContext();
            const now = ctx.currentTime;

            // Ascending sequence
            [330, 440, 550, 660, 880].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, now + i * 0.1);

                gain.gain.setValueAtTime(this.masterVolume * 0.25, now + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.08);

                osc.start(now + i * 0.1);
                osc.stop(now + i * 0.1 + 0.1);
            });
        } catch (e) { }
    }

    // Game over - descending sad tone
    public playGameOver(): void {
        if (!this.enabled) return;

        try {
            const ctx = this.getContext();
            const now = ctx.currentTime;

            // Descending notes
            [440, 370, 311, 262].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, now + i * 0.2);

                gain.gain.setValueAtTime(this.masterVolume * 0.2, now + i * 0.2);
                gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.18);

                osc.start(now + i * 0.2);
                osc.stop(now + i * 0.2 + 0.2);
            });
        } catch (e) { }
    }

    // Button click
    public playClick(): void {
        this.playTone(600, 0.05, 'square', 0.2);
    }

    // New high score celebration!
    public playHighScore(): void {
        if (!this.enabled) return;

        try {
            const ctx = this.getContext();
            const now = ctx.currentTime;

            // Fanfare-like sequence
            const notes = [523, 659, 784, 1047, 784, 1047];
            const durations = [0.1, 0.1, 0.1, 0.3, 0.1, 0.4];

            let time = 0;
            notes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);

                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, now + time);

                gain.gain.setValueAtTime(this.masterVolume * 0.3, now + time);
                gain.gain.exponentialRampToValueAtTime(0.01, now + time + durations[i]);

                osc.start(now + time);
                osc.stop(now + time + durations[i] + 0.05);

                time += durations[i];
            });
        } catch (e) { }
    }

    // Time warning beep (last 10 seconds)
    public playTimeWarning(): void {
        this.playTone(440, 0.1, 'square', 0.2);
    }
}

// Singleton instance
export const soundManager = new SoundManager();
