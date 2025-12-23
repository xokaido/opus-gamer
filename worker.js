// Cloudflare Worker - serves static assets and can be extended with API routes
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // Future: Add API routes here
        // if (url.pathname.startsWith('/api/')) {
        //   return handleApi(request, env);
        // }

        // Serve static assets from the assets binding
        return env.ASSETS.fetch(request);
    },
};
