import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const startServer = async () => {
  console.log('[Stockora] Initializing Server...');
  await connectDB();

  const app = createApp();
  const port = parseInt(env.PORT, 10);

  app.listen(port, () => {
    console.log(`[Stockora] Backend API running at http://localhost:${port}`);
    console.log(`[Stockora] Environment: ${env.NODE_ENV}`);
    console.log(`[Stockora] Smart Order service initialized (${env.GEMINI_API_KEY ? 'Configured' : 'Local Matcher Only'})`);
  });
};

startServer().catch((err) => {
  console.error('[Stockora] Failed to start server:', err);
  process.exit(1);
});

