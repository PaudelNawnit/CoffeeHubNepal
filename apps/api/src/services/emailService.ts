import nodemailer from 'nodemailer';
import { EmailClient } from '@azure/communication-email';
import { env } from '../config/env.js';

// Check if using Azure Communication Services
const isAzureEmail = env.smtpHost === 'smtp.azurecomm.net' || env.smtpUser?.includes('azurecomm.net') || env.smtpUser?.includes('communication.azure.com');

// Log Azure detection on module load
console.log('[Email Service] Initializing email service...');
console.log('[Email Service] SMTP_HOST:', env.smtpHost);
console.log('[Email Service] SMTP_USER:', env.smtpUser ? env.smtpUser.substring(0, 50) + '...' : 'not set');
console.log('[Email Service] Is Azure Email:', isAzureEmail);

// Create Azure Email Client if using Azure
const createAzureEmailClient = (): EmailClient | null => {
  if (!isAzureEmail) {
    return null;
  }

  // Build connection string from SMTP_USER and SMTP_PASS
  // Format: endpoint=SMTP_USER;accesskey=SMTP_PASS
  if (!env.smtpUser || !env.smtpPass) {
    console.warn('[Email Service] Azure email credentials not configured.');
    return null;
  }

  // If SMTP_USER already contains the full connection string format, use it
  let connectionString = env.smtpUser;
  if (connectionString.includes('endpoint=') && connectionString.includes('accesskey=')) {
    // Already a connection string
  } else if (connectionString.includes('https://')) {
    // Extract just the base endpoint URL (remove any path/query parameters that might be mixed in)
    try {
      const url = new URL(connectionString);
      // Get just the origin (protocol + hostname + port if any)
      const baseEndpoint = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}/`;
      // Build connection string from clean endpoint URL and access key
      connectionString = `endpoint=${baseEndpoint};accesskey=${env.smtpPass}`;
      console.log('[Email Service] Extracted base endpoint:', baseEndpoint);
    } catch (e) {
      // If URL parsing fails, try to extract manually
      // Remove anything after the domain (like /path or query params)
      const match = connectionString.match(/^(https?:\/\/[^\/]+)/);
      if (match) {
        const baseEndpoint = match[1] + '/';
        connectionString = `endpoint=${baseEndpoint};accesskey=${env.smtpPass}`;
        console.log('[Email Service] Extracted base endpoint (fallback):', baseEndpoint);
      } else {
        // Fallback: use as-is but log warning
        console.warn('[Email Service] Could not parse endpoint URL, using as-is');
        connectionString = `endpoint=${env.smtpUser};accesskey=${env.smtpPass}`;
      }
    }
  } else {
    // Assume it's just the endpoint, build full connection string
    connectionString = `endpoint=https://${env.smtpUser};accesskey=${env.smtpPass}`;
  }

  console.log('[Email Service] Creating Azure Email Client');
  return new EmailClient(connectionString);
};

// Create reusable SMTP transporter (for non-Azure providers)
const createSMTPTransporter = () => {
  // If no SMTP credentials, return null (email sending disabled)
  if (!env.smtpUser || !env.smtpPass) {
    console.warn('[Email Service] SMTP credentials not configured. Email sending disabled.');
    return null;
  }

  // Don't create SMTP transporter if using Azure
  if (isAzureEmail) {
    return null;
  }

  // For Azure Communication Services, extract username from endpoint if it's a full URL
  let smtpUsername = env.smtpUser;
  if (env.smtpHost === 'smtp.azurecomm.net' && env.smtpUser.includes('https://')) {
    // Extract just the hostname from the endpoint URL
    try {
      const url = new URL(env.smtpUser);
      smtpUsername = url.hostname;
      console.log('[Email Service] Extracted Azure SMTP username from endpoint:', smtpUsername);
    } catch (e) {
      // If URL parsing fails, use as-is
      console.warn('[Email Service] Could not parse SMTP_USER as URL, using as-is');
    }
  }

  console.log('[Email Service] Creating SMTP transporter:', {
    host: env.smtpHost,
    port: env.smtpPort,
    user: smtpUsername.substring(0, 30) + '...', // Log partial user for debugging
    from: env.smtpFrom
  });

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465, // true for 465, false for other ports
    auth: {
      user: smtpUsername,
      pass: env.smtpPass
    },
    // Add TLS options for better compatibility
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates (useful for development)
    }
  });
};

/**
 * Send OTP verification email
 */
export const sendOTPEmail = async (email: string, otp: string, expiryMinutes: number): Promise<void> => {
  console.log(`[Email Service] sendOTPEmail called for: ${email}`);
  
  // Try Azure Email SDK first
  if (isAzureEmail) {
    console.log('[Email Service] Using Azure Email SDK for OTP');
    const azureClient = createAzureEmailClient();
    
    if (azureClient) {
      try {
        const senderAddress = (env.smtpFrom || '').trim();
        
        const emailMessage = {
          senderAddress: senderAddress,
          content: {
            subject: 'CoffeeHubNepal - Email Verification Code',
            plainText: `
Your verification code is: ${otp}

This code will expire in ${expiryMinutes} minutes.

If you didn't request this code, please ignore this email.
            `,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #6F4E37 0%, #4E3626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">CoffeeHubNepal</h1>
                  </div>
                  <div style="background: #f8f5f2; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #6F4E37; margin-top: 0;">Email Verification</h2>
                    <p>Your verification code is:</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <div style="background: #6F4E37; color: white; padding: 20px 40px; display: inline-block; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</div>
                    </div>
                    <p style="font-size: 14px; color: #666; margin-top: 30px;">
                      <strong>This code will expire in ${expiryMinutes} minutes.</strong>
                    </p>
                    <p style="font-size: 14px; color: #666;">
                      If you didn't request this code, please ignore this email.
                    </p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">
                      This is an automated message. Please do not reply to this email.
                    </p>
                  </div>
                </body>
              </html>
            `
          },
          recipients: {
            to: [{ address: email }]
          }
        };

        const poller = await azureClient.beginSend(emailMessage);
        const result = await poller.pollUntilDone();
        
        console.log(`[Email Service] OTP email sent successfully via Azure to ${email}`);
        console.log(`[Email Service] Message ID: ${result.id}`);
        return;
      } catch (error: any) {
        console.error('[Email Service] Failed to send OTP email via Azure:', error.message);
        throw new Error('FAILED_TO_SEND_EMAIL');
      }
    }
  }

  // Fallback to SMTP
  const transporter = createSMTPTransporter();
  
  if (!transporter) {
    // In development, log the OTP instead of sending email
    console.log('\n=== OTP VERIFICATION CODE (Development Mode) ===');
    console.log(`Email: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log(`Expires in: ${expiryMinutes} minutes`);
    console.log('=================================================\n');
    return;
  }

  const mailOptions = {
    from: `"CoffeeHubNepal" <${env.smtpFrom}>`,
    to: email,
    subject: 'CoffeeHubNepal - Email Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6F4E37 0%, #4E3626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">CoffeeHubNepal</h1>
          </div>
          <div style="background: #f8f5f2; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #6F4E37; margin-top: 0;">Email Verification</h2>
            <p>Your verification code is:</p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #6F4E37; color: white; padding: 20px 40px; display: inline-block; border-radius: 10px; font-size: 32px; font-weight: bold; letter-spacing: 8px;">${otp}</div>
            </div>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              <strong>This code will expire in ${expiryMinutes} minutes.</strong>
            </p>
            <p style="font-size: 14px; color: #666;">
              If you didn't request this code, please ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `Your verification code is: ${otp}\n\nThis code will expire in ${expiryMinutes} minutes.\n\nIf you didn't request this code, please ignore this email.`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] OTP email sent successfully to ${email}`);
    console.log(`[Email Service] Message ID: ${info.messageId}`);
  } catch (error: any) {
    console.error('[Email Service] Failed to send OTP email:', error.message);
    throw new Error('FAILED_TO_SEND_EMAIL');
  }
};

export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<void> => {
  console.log(`[Email Service] sendPasswordResetEmail called for: ${email}`);
  console.log(`[Email Service] Is Azure Email: ${isAzureEmail}`);
  console.log(`[Email Service] SMTP_HOST: ${env.smtpHost}`);
  console.log(`[Email Service] SMTP_USER set: ${!!env.smtpUser}`);
  console.log(`[Email Service] SMTP_PASS set: ${!!env.smtpPass}`);
  console.log(`[Email Service] SMTP_FROM: ${env.smtpFrom}`);
  
  const resetUrl = `${env.clientOrigin}/reset-password?token=${resetToken}`;

  // Try Azure Email SDK first
  if (isAzureEmail) {
    console.log('[Email Service] Using Azure Email SDK');
    const azureClient = createAzureEmailClient();
    
    if (azureClient) {
      try {
        // Trim and validate sender address
        const senderAddress = (env.smtpFrom || '').trim();
        
        console.log(`[Email Service] Attempting to send password reset email via Azure to ${email}`);
        console.log(`[Email Service] Raw SMTP_FROM value: "${env.smtpFrom}"`);
        console.log(`[Email Service] Trimmed sender address: "${senderAddress}"`);
        console.log(`[Email Service] Sender address length: ${senderAddress.length}`);
        
        const emailMessage = {
          senderAddress: senderAddress,
          content: {
            subject: 'Reset Your CoffeeHubNepal Password',
            plainText: `
Password Reset Request

We received a request to reset your password. Click the link below to create a new password:

${resetUrl}

This link will expire in ${env.resetTokenExpiryHours} hour(s).

If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            `,
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="background: linear-gradient(135deg, #6F4E37 0%, #4E3626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">CoffeeHubNepal</h1>
                  </div>
                  <div style="background: #f8f5f2; padding: 30px; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #6F4E37; margin-top: 0;">Password Reset Request</h2>
                    <p>We received a request to reset your password. Click the button below to create a new password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                      <a href="${resetUrl}" style="background: #6F4E37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Reset Password</a>
                    </div>
                    <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
                    <p style="font-size: 12px; color: #999; word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">${resetUrl}</p>
                    <p style="font-size: 14px; color: #666; margin-top: 30px;">
                      <strong>This link will expire in ${env.resetTokenExpiryHours} hour(s).</strong>
                    </p>
                    <p style="font-size: 14px; color: #666;">
                      If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
                    </p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="font-size: 12px; color: #999; text-align: center;">
                      This is an automated message. Please do not reply to this email.
                    </p>
                  </div>
                </body>
              </html>
            `
          },
          recipients: {
            to: [{ address: email }]
          }
        };

        console.log(`[Email Service] Starting Azure email send operation...`);
        console.log(`[Email Service] Final senderAddress: "${emailMessage.senderAddress}"`);
        console.log(`[Email Service] Recipient: "${emailMessage.recipients.to[0].address}"`);
        const poller = await azureClient.beginSend(emailMessage);
        console.log(`[Email Service] Polling for email send completion...`);
        const result = await poller.pollUntilDone();
        
        console.log(`[Email Service] Password reset email sent successfully via Azure to ${email}`);
        console.log(`[Email Service] Message ID: ${result.id}`);
        if (result.status) {
          console.log(`[Email Service] Email status: ${result.status}`);
        }
        return;
      } catch (error: any) {
        console.error('[Email Service] Failed to send password reset email via Azure');
        console.error('[Email Service] Error details:', {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode,
          details: error.details
        });
        throw new Error('FAILED_TO_SEND_EMAIL');
      }
    }
  }

  // Fallback to SMTP (for Gmail, SendGrid, etc.)
  console.log('[Email Service] Falling back to SMTP transport');
  const transporter = createSMTPTransporter();
  
  if (!transporter) {
    // In development, log the reset link instead of sending email
    console.log('\n=== PASSWORD RESET LINK (Development Mode) ===');
    console.log(`Email: ${email}`);
    console.log(`Reset Link: ${resetUrl}`);
    console.log('===============================================\n');
    return;
  }
  
  console.log('[Email Service] SMTP transporter created successfully');

  const mailOptions = {
    from: `"CoffeeHubNepal" <${env.smtpFrom}>`,
    to: email,
    subject: 'Reset Your CoffeeHubNepal Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #6F4E37 0%, #4E3626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">CoffeeHubNepal</h1>
          </div>
          <div style="background: #f8f5f2; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #6F4E37; margin-top: 0;">Password Reset Request</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #6F4E37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Reset Password</a>
            </div>
            <p style="font-size: 14px; color: #666;">Or copy and paste this link into your browser:</p>
            <p style="font-size: 12px; color: #999; word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">${resetUrl}</p>
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              <strong>This link will expire in ${env.resetTokenExpiryHours} hour(s).</strong>
            </p>
            <p style="font-size: 14px; color: #666;">
              If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
              This is an automated message. Please do not reply to this email.
            </p>
          </div>
        </body>
      </html>
    `,
    text: `
      Password Reset Request
      
      We received a request to reset your password. Click the link below to create a new password:
      
      ${resetUrl}
      
      This link will expire in ${env.resetTokenExpiryHours} hour(s).
      
      If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
    `
  };

  try {
    console.log(`[Email Service] Attempting to send password reset email via SMTP to ${email}`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Password reset email sent successfully to ${email}`);
    console.log(`[Email Service] Message ID: ${info.messageId}`);
    if (info.response) {
      console.log(`[Email Service] Server response: ${info.response}`);
    }
  } catch (error: any) {
    console.error('[Email Service] Failed to send password reset email');
    console.error('[Email Service] Error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode
    });
    
    // Log more details if available
    if (error.response) {
      console.error('[Email Service] SMTP Response:', error.response);
    }
    
    throw new Error('FAILED_TO_SEND_EMAIL');
  }
};
