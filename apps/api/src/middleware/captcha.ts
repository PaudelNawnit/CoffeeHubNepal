import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';

/**
 * CAPTCHA verification middleware
 * Verifies Google reCAPTCHA v2/v3 tokens
 */
export const captchaCheck = async (req: Request, res: Response, next: NextFunction) => {
  // Skip CAPTCHA check if secret is not configured
  if (!env.captchaSecret) {
    return next();
  }

  const token = req.headers['x-captcha-token'];
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ error: 'CAPTCHA_REQUIRED', code: 'CAPTCHA_REQUIRED' });
  }

  // Allow 'captcha-disabled' token (for development or when CAPTCHA is optional)
  if (token === 'captcha-disabled') {
    return next();
  }

  try {
    // Verify token with Google reCAPTCHA
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';

    const params = new URLSearchParams();
    params.append('secret', env.captchaSecret);
    params.append('response', token);
    if (req.ip || req.socket.remoteAddress) {
      params.append('remoteip', (req.ip || req.socket.remoteAddress) as string);
    }

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      console.error('CAPTCHA verification request failed:', response.status, response.statusText);
      return res.status(500).json({
        error: 'CAPTCHA_VERIFICATION_FAILED',
        code: 'CAPTCHA_VERIFICATION_FAILED',
        message: 'Failed to verify CAPTCHA. Please try again.'
      });
    }

    const data: any = await response.json();

    if (!data.success) {
      console.error('CAPTCHA verification failed:', data['error-codes']);
      return res.status(400).json({
        error: 'CAPTCHA_INVALID',
        code: 'CAPTCHA_INVALID',
        message: 'CAPTCHA verification failed. Please try again.'
      });
    }

    // CAPTCHA verified successfully
    return next();
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    return res.status(500).json({
      error: 'CAPTCHA_VERIFICATION_FAILED',
      code: 'CAPTCHA_VERIFICATION_FAILED',
      message: 'Failed to verify CAPTCHA. Please try again.'
    });
  }
};

