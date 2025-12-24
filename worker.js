// Cloudflare Worker - serves static assets and handles scoreboard API

// Durable Object for storing scores
export class Scoreboard {
    constructor(state, env) {
        this.state = state;
        this.env = env;
    }

    async fetch(request) {
        const url = new URL(request.url);

        // GET /scores - List top scores
        if (request.method === "GET" && url.pathname.endsWith("/scores")) {
            const scores = (await this.state.storage.get("scores")) || [];
            return new Response(JSON.stringify(scores), {
                headers: { "Content-Type": "application/json" }
            });
        }

        // POST /users/register - Register a name
        if (request.method === "POST" && url.pathname.endsWith("/users/register")) {
            try {
                const data = await request.json();
                let requestedName = data.name;

                if (!requestedName) {
                    return new Response("Name required", { status: 400 });
                }

                // Sanitize name
                requestedName = requestedName.trim().slice(0, 20);

                // Load users map: name -> lastActiveTimestamp
                let users = (await this.state.storage.get("users")) || {};

                // Check if name exists and append number if needed
                let finalName = requestedName;
                let counter = 1;
                while (users[finalName]) {
                    // Check if existing user is expired (cleanup opportunity)
                    const lastActive = users[finalName];
                    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
                    if (Date.now() - lastActive > sevenDaysMs) {
                        // Name is free! (We will clean up the old user data below)
                        break;
                    }

                    finalName = `${requestedName}${counter}`;
                    counter++;
                    // Safety break to prevent infinite loops if something goes wrong
                    if (counter > 1000) return new Response("Name too popular, try another", { status: 409 });
                }

                // Register user
                users[finalName] = Date.now();
                await this.state.storage.put("users", users);

                // Run cleanup lazily
                this.cleanup(users);

                return new Response(JSON.stringify({ name: finalName }), {
                    headers: { "Content-Type": "application/json" }
                });

            } catch (err) {
                return new Response("Error registering user: " + err.message, { status: 500 });
            }
        }

        // POST /scores - Submit a score
        if (request.method === "POST" && url.pathname.endsWith("/scores")) {
            try {
                const data = await request.json();

                // Validate input
                if (!data.playerName || typeof data.score !== "number") {
                    return new Response("Invalid data", { status: 400 });
                }

                // Update user activity
                let users = (await this.state.storage.get("users")) || {};
                if (users[data.playerName]) {
                    users[data.playerName] = Date.now();
                    await this.state.storage.put("users", users);
                }

                // Get current scores
                let scores = (await this.state.storage.get("scores")) || [];

                // Add new score
                scores.push({
                    playerName: data.playerName,
                    score: data.score,
                    date: new Date().toISOString()
                });

                // Sort by score descending and keep top 15
                scores.sort((a, b) => b.score - a.score);
                scores = scores.slice(0, 15);

                // Save back to storage
                await this.state.storage.put("scores", scores);

                return new Response(JSON.stringify(scores), {
                    headers: { "Content-Type": "application/json" }
                });
            } catch (err) {
                return new Response("Error processing score: " + err.message, { status: 500 });
            }
        }

        return new Response("Method not allowed", { status: 405 });
    }

    async cleanup(users) {
        // Remove inactive users > 7 days
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        const now = Date.now();
        let changed = false;
        const expiredNames = new Set();

        for (const [name, lastActive] of Object.entries(users)) {
            if (now - lastActive > sevenDaysMs) {
                delete users[name];
                expiredNames.add(name);
                changed = true;
            }
        }

        if (changed) {
            await this.state.storage.put("users", users);

            // Anonymize scores for expired users
            if (expiredNames.size > 0) {
                let scores = (await this.state.storage.get("scores")) || [];
                let scoresChanged = false;

                scores = scores.map(score => {
                    if (expiredNames.has(score.playerName)) {
                        scoresChanged = true;
                        return {
                            ...score,
                            playerName: `User-${Math.floor(Math.random() * 10000)}` // Anonymize
                        };
                    }
                    return score;
                });

                if (scoresChanged) {
                    await this.state.storage.put("scores", scores);
                }
            }
        }
    }
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // API routes
        if (url.pathname.startsWith('/api/scores') || url.pathname.startsWith('/api/users')) {
            // Get the unique ID for the global scoreboard (singleton pattern)
            const id = env.SCOREBOARD.idFromName("global-scoreboard");
            const obj = env.SCOREBOARD.get(id);
            return obj.fetch(request);
        }

        // Serve static assets from the assets binding
        return env.ASSETS.fetch(request);
    },
};
