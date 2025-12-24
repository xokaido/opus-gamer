import type { ScoreEntry } from '../storage/ScoreStorage';

const API_BASE_URL = ''; // Relative path for same-origin requests

export async function submitScore(playerName: string, score: number): Promise<ScoreEntry[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/scores`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ playerName, score }),
        });

        if (!response.ok) {
            throw new Error(`Failed to submit score: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error submitting score:', error);
        throw error;
    }
}

export async function getLeaderboard(): Promise<ScoreEntry[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/scores`);

        if (!response.ok) {
            throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
        }

        return await response.json();
        return await response.json();
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return []; // Return empty array on error to prevent UI crash
    }
}

export async function registerName(name: string): Promise<string> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        });

        if (!response.ok) {
            throw new Error(`Failed to register name: ${response.statusText}`);
        }

        const data = await response.json();
        return data.name;
    } catch (error) {
        console.error('Error registering name:', error);
        return name; // Fallback to requested name on error (offline mode support conceptually)
    }
}
