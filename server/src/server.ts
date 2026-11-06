import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const app = createApp();

// Only bind a local TCP port when running outside Vercel Serverless
if (!process.env.VERCEL) {
  const startServer = async () => {
    console.log('[Stockora] Initializing Server...');
    await connectDB();

    const port = parseInt(env.PORT, 10);

    app.listen(port, () => {
      console.log(`[Stockora] Backend API running at http://localhost:${port}`);
      console.log(`[Stockora] Environment: ${env.NODE_ENV}`);
      console.log(
        `[Stockora] Smart Order service initialized (${env.GEMINI_API_KEY ? 'Configured' : 'Unconfigured'})`
      );
    });
  };

  startServer().catch((err) => {
    console.error('[Stockora] Failed to start server:', err);
    process.exit(1);
  });
}

export default app;
