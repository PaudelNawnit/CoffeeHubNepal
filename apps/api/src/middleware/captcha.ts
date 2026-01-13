import { NextFunction, Request, Response } from 'express';
import { appendFileSync } from 'fs';
import { env } from '../config/env.js';

/**
 * CAPTCHA verification middleware
 * Verifies Google reCAPTCHA v2/v3 tokens
 */
export const captchaCheck = async (req: Request, res: Response, next: NextFunction) => {
  // #region agent log
  try{appendFileSync('c:\\Users\\suraj\\OneDrive - Yuva Samaj Sewa Rautahat\\Desktop\\CHN Updated\\.cursor\\debug.log',JSON.stringify({location:'captcha.ts:8',message:'captchaCheck entry',data:{hasSecret:!!env.captchaSecret,path:req.path},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');}catch(e){}
  // #endregion
  // Skip CAPTCHA check if secret is not configured
  if (!env.captchaSecret) {
    // #region agent log
    try{appendFileSync('c:\\Users\\suraj\\OneDrive - Yuva Samaj Sewa Rautahat\\Desktop\\CHN Updated\\.cursor\\debug.log',JSON.stringify({location:'captcha.ts:11',message:'captchaCheck skip - no secret',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})+'\n');}catch(e){}
    // #endregion
    return next();
  }

  // Get token from headers (handle both string and array formats)
  const tokenHeader = req.headers['x-captcha-token'];
  const token = Array.isArray(tokenHeader) ? tokenHeader[0] : tokenHeader;
  // #region agent log
  try{appendFileSync('c:\\Users\\suraj\\OneDrive - Yuva Samaj Sewa Rautahat\\Desktop\\CHN Updated\\.cursor\\debug.log',JSON.stringify({location:'captcha.ts:16',message:'token extracted',data:{hasToken:!!token,tokenType:typeof token,tokenLength:token?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');}catch(e){}
  // #endregion
  
  if (!token || typeof token !== 'string') {
    console.error('[CAPTCHA] Missing or invalid token header:', { token, headers: req.headers });
    // #region agent log
    try{appendFileSync('c:\\Users\\suraj\\OneDrive - Yuva Samaj Sewa Rautahat\\Desktop\\CHN Updated\\.cursor\\debug.log',JSON.stringify({location:'captcha.ts:19',message:'captcha token missing',data:{tokenType:typeof token},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');}catch(e){}
    // #endregion
    return res.status(400).json({ error: 'CAPTCHA_REQUIRED', code: 'CAPTCHA_REQUIRED' });
  }

  // Allow 'captcha-disabled' token (for development or when CAPTCHA is optional)
  if (token === 'captcha-disabled') {
    // #region agent log
    try{appendFileSync('c:\\Users\\suraj\\OneDrive - Yuva Samaj Sewa Rautahat\\Desktop\\CHN Updated\\.cursor\\debug.log',JSON.stringify({location:'captcha.ts:24',message:'captcha disabled token',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');}catch(e){}
    // #endregion
    return next();
  }

  try {
    // #region agent log
    try{appendFileSync('c:\\Users\\suraj\\OneDrive - Yuva Samaj Sewa Rautahat\\Desktop\\CHN Updated\\.cursor\\debug.log',JSON.stringify({location:'captcha.ts:28',message:'starting captcha verification',data:{tokenLength:token.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');}catch(e){}
    // #endregion
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
    // #region agent log
    try{appendFileSync('c:\\Users\\suraj\\OneDrive - Yuva Samaj Sewa Rautahat\\Desktop\\CHN Updated\\.cursor\\debug.log',JSON.stringify({location:'captcha.ts:45',message:'captcha fetch response',data:{status:response.status,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');}catch(e){}
    // #endregion

    if (!response.ok) {
      console.error('CAPTCHA verification request failed:', response.status, response.statusText);
      // #region agent log
      try{appendFileSync('c:\\Users\\suraj\\OneDrive - Yuva Samaj Sewa Rautahat\\Desktop\\CHN Updated\\.cursor\\debug.log',JSON.stringify({location:'captcha.ts:48',message:'captcha response not ok',data:{status:response.status,statusText:response.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');}catch(e){}
      // #endregion
      return res.status(500).json({
        error: 'CAPTCHA_VERIFICATION_FAILED',
        code: 'CAPTCHA_VERIFICATION_FAILED',
        message: 'Failed to verify CAPTCHA. Please try again.'
      });
    }

    let data: any;
    try {
      const responseText = await response.text();
      if (!responseText) {
        throw new Error('Empty response from CAPTCHA service');
      }
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('CAPTCHA response parsing error:', parseError);
      return res.status(500).json({
        error: 'CAPTCHA_VERIFICATION_FAILED',
        code: 'CAPTCHA_VERIFICATION_FAILED',
        message: 'Failed to verify CAPTCHA. Please try again.'
      });
    }

    if (!data || typeof data !== 'object') {
      console.error('CAPTCHA verification returned invalid data:', data);
      return res.status(500).json({
        error: 'CAPTCHA_VERIFICATION_FAILED',
        code: 'CAPTCHA_VERIFICATION_FAILED',
        message: 'Failed to verify CAPTCHA. Please try again.'
      });
    }

    if (!data.success) {
      const errorCodes = data['error-codes'] || [];
      console.error('CAPTCHA verification failed:', errorCodes);
      console.error('CAPTCHA response data:', JSON.stringify(data, null, 2));
      // #region agent log
      try{appendFileSync('c:\\Users\\suraj\\OneDrive - Yuva Samaj Sewa Rautahat\\Desktop\\CHN Updated\\.cursor\\debug.log',JSON.stringify({location:'captcha.ts:81',message:'captcha verification failed',data:{errorCodes:errorCodes,fullResponse:data,hasSecret:!!env.captchaSecret},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');}catch(e){}
      // #endregion
      
      // Provide more specific error messages based on error codes
      let errorMessage = 'CAPTCHA verification failed. Please try again.';
      if (Array.isArray(errorCodes) && errorCodes.length > 0) {
        if (errorCodes.includes('invalid-input-secret')) {
          errorMessage = 'CAPTCHA configuration error. Please contact support.';
        } else if (errorCodes.includes('timeout-or-duplicate')) {
          errorMessage = 'CAPTCHA token expired or already used. Please verify again.';
        } else if (errorCodes.includes('bad-request')) {
          errorMessage = 'Invalid CAPTCHA request. Please try again.';
        }
      }
      
      return res.status(400).json({
        error: 'CAPTCHA_INVALID',
        code: 'CAPTCHA_INVALID',
        message: errorMessage
      });
    }

    // CAPTCHA verified successfully
    // #region agent log
    try{appendFileSync('c:\\Users\\suraj\\OneDrive - Yuva Samaj Sewa Rautahat\\Desktop\\CHN Updated\\.cursor\\debug.log',JSON.stringify({location:'captcha.ts:90',message:'captcha verified successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');}catch(e){}
    // #endregion
    return next();
  } catch (error) {
    console.error('CAPTCHA verification error:', error);
    // #region agent log
    try{appendFileSync('c:\\Users\\suraj\\OneDrive - Yuva Samaj Sewa Rautahat\\Desktop\\CHN Updated\\.cursor\\debug.log',JSON.stringify({location:'captcha.ts:93',message:'captcha catch block',data:{errorMessage:error instanceof Error?error.message:String(error),errorName:error instanceof Error?error.name:'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');}catch(e){}
    // #endregion
    // Ensure we don't send response if headers already sent
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'CAPTCHA_VERIFICATION_FAILED',
        code: 'CAPTCHA_VERIFICATION_FAILED',
        message: 'Failed to verify CAPTCHA. Please try again.'
      });
    }
    // If headers already sent, pass error to next error handler
    return next(error instanceof Error ? error : new Error(String(error)));
  }
};

