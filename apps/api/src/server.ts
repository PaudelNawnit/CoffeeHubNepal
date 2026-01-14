import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
// Import models to ensure they're registered
import './models/OTP.js';
import './models/EmailVerificationToken.js';

const start = async () => {
  await connectDb();
  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});

