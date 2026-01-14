import dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
console.log('[Env Config] Loading .env from:', envPath);
console.log('[Env Config] Current working directory:', process.cwd());
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('[Env Config] Error loading .env file:', result.error);
} else {
  console.log('[Env Config] .env file loaded successfully');
  console.log('[Env Config] MONGO_URI is set:', !!process.env.MONGO_URI);
  if (process.env.MONGO_URI) {
    console.log('[Env Config] MONGO_URI length:', process.env.MONGO_URI.length);
    console.log('[Env Config] MONGO_URI starts with:', process.env.MONGO_URI.substring(0, 30));
  }
}

const toNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

// Validate required environment variables
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret && process.env.NODE_ENV === 'production') {
  throw new Error('FATAL: JWT_SECRET environment variable is required in production. Set a strong, random secret.');
}

export const env = {
  port: toNumber(process.env.PORT, 4000),
  mongoUri: process.env.MONGO_URI ?? '',
  jwtSecret: jwtSecret || 'dev-only-secret-change-in-production',
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  rateLimitPerMinute: toNumber(process.env.RATE_LIMIT_PER_MINUTE, 60),
  lockoutThreshold: toNumber(process.env.LOCKOUT_THRESHOLD, 5),
  lockoutWindowMinutes: toNumber(process.env.LOCKOUT_WINDOW_MINUTES, 15),
  captchaSecret: process.env.CAPTCHA_SECRET,
  // Email configuration
  smtpHost: process.env.SMTP_HOST ?? 'smtp.gmail.com',
  smtpPort: toNumber(process.env.SMTP_PORT, 587),
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPass: process.env.SMTP_PASS ?? '',
  smtpFrom: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'noreply@example.com',
  resetTokenExpiryHours: toNumber(process.env.RESET_TOKEN_EXPIRY_HOURS, 1)
};

