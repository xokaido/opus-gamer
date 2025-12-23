// Score storage system using localStorage
import { STORAGE_KEYS } from '../utils/constants';

export interface ScoreEntry {
    id: string;
    playerName: string;
    score: number;
    coins: number;
    gems: number;
    stars: number;
    date: string;
}

const MAX_SCORES = 10;

export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getScores(): ScoreEntry[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.SCORES);
        if (!stored) return [];
        return JSON.parse(stored) as ScoreEntry[];
    } catch {
        return [];
    }
}

export function saveScore(entry: Omit<ScoreEntry, 'id' | 'date'>): ScoreEntry {
    const newEntry: ScoreEntry = {
        ...entry,
        id: generateId(),
        date: new Date().toISOString(),
    };

    const scores = getScores();
    scores.push(newEntry);

    // Sort by score descending and keep top scores
    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, MAX_SCORES);

    localStorage.setItem(STORAGE_KEYS.SCORES, JSON.stringify(topScores));

    return newEntry;
}

export function getHighScore(): number {
    const scores = getScores();
    if (scores.length === 0) return 0;
    return scores[0].score;
}

export function isHighScore(score: number): boolean {
    const scores = getScores();
    if (scores.length < MAX_SCORES) return true;
    return score > scores[scores.length - 1].score;
}

export function getPlayerName(): string {
    return localStorage.getItem(STORAGE_KEYS.PLAYER_NAME) || 'Player';
}

export function setPlayerName(name: string): void {
    localStorage.setItem(STORAGE_KEYS.PLAYER_NAME, name.slice(0, 20));
}

export function clearScores(): void {
    localStorage.removeItem(STORAGE_KEYS.SCORES);
}
