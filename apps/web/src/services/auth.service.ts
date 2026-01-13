import { API_BASE_URL } from '@/utils/constants';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  location: string;
  password: string;
  role: 'farmer' | 'roaster' | 'trader' | 'exporter' | 'expert';
}

interface ApiError {
  error: string;
  code?: string;
  message?: string;
  details?: any;
  remainingAttempts?: number;
  unlocksInMs?: number;
  waitTime?: number;
}

interface OTPResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
  waitTime?: number;
  remainingAttempts?: number;
}

export const authService = {
  async login(credentials: LoginCredentials, captchaToken?: string) {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add CAPTCHA token to headers if provided
      if (captchaToken) {
        headers['x-captcha-token'] = captchaToken;
      }

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = data;
        console.error('Login API error:', error);
        console.error('Response status:', response.status);
        console.error('Error object:', JSON.stringify(error, null, 2));
        
        if (error.code === 'ACCOUNT_LOCKED') {
          const minutes = error.unlocksInMs ? Math.ceil(error.unlocksInMs / 60000) : 15;
          if (minutes > 0) {
            throw new Error(`Your account has been temporarily locked due to multiple failed login attempts. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`);
          } else {
            throw new Error('Your account has been temporarily locked due to multiple failed login attempts. Please try again in a few minutes.');
          }
        }
        if (error.code === 'CAPTCHA_REQUIRED') {
          throw new Error('CAPTCHA verification is required. Please complete the CAPTCHA.');
        }
        if (error.code === 'CAPTCHA_INVALID' || error.code === 'CAPTCHA_VERIFICATION_FAILED') {
          throw new Error('CAPTCHA verification failed. Please try again.');
        }
        if (error.code === 'INVALID_CREDENTIALS' || response.status === 401) {
          const attempts = error.remainingAttempts !== undefined ? error.remainingAttempts : 0;
          if (attempts > 0) {
            throw new Error(`Invalid email or password. ${attempts} attempt${attempts > 1 ? 's' : ''} remaining before account lockout.`);
          } else {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          }
        }
        // Handle other error codes
        if (error.error) {
          throw new Error(error.error);
        }
        // Fallback for any 401/403 errors
        if (response.status === 401 || response.status === 403) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        throw new Error('Login failed. Please check your credentials and try again.');
      }

      // Store token and user
      // Backend returns full user data including role, name, etc.
      // MongoDB ID is a string, convert to number for frontend compatibility
      // Also store original MongoDB ID as string for backend comparisons
      const mongoId = typeof data.user.id === 'string' ? data.user.id : data.user.id?.toString();
      const userId = typeof data.user.id === 'string' ? parseInt(data.user.id, 16) || Date.now() : data.user.id;
      const userWithDefaults = {
        id: userId,
        mongoId: mongoId,
        email: data.user.email,
        name: data.user.name || data.user.email.split('@')[0] || 'User',
        role: (data.user.role || 'farmer') as 'farmer' | 'roaster' | 'trader' | 'exporter' | 'expert' | 'admin' | 'moderator',
        phone: data.user.phone || '',
        location: data.user.location || '',
        avatar: data.user.avatar || '',
        verified: data.user.verified || false,
        memberSince: new Date().getFullYear().toString()
      };
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userWithDefaults));

      return {
        token: data.token,
        user: userWithDefaults,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check if the API server is running.');
    }
  },

  // Send OTP for email verification during signup
  async sendOTP(email: string, _captchaToken?: string): Promise<OTPResponse> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // TEMPORARILY DISABLED: Always send captcha-disabled for debugging
      headers['x-captcha-token'] = 'captcha-disabled';
      // if (captchaToken) {
      //   headers['x-captcha-token'] = captchaToken;
      // } else {
      //   headers['x-captcha-token'] = 'captcha-disabled';
      // }

      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = data;
        if (error.code === 'EMAIL_IN_USE') {
          throw new Error('This email is already registered. Please log in instead.');
        }
        if (error.code === 'TOO_MANY_REQUESTS') {
          throw new Error(error.message || `Please wait before requesting another code.`);
        }
        if (error.code === 'FAILED_TO_SEND_OTP') {
          throw new Error('Failed to send verification code. Please try again.');
        }
        throw new Error(error.message || 'Failed to send verification code.');
      }

      return data as OTPResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  // Verify OTP
  async verifyOTP(email: string, otp: string): Promise<OTPResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = data;
        if (error.code === 'OTP_NOT_FOUND') {
          throw new Error('No verification code found. Please request a new one.');
        }
        if (error.code === 'OTP_EXPIRED') {
          throw new Error('Verification code has expired. Please request a new one.');
        }
        if (error.code === 'MAX_ATTEMPTS_EXCEEDED') {
          throw new Error('Too many incorrect attempts. Please request a new code.');
        }
        if (error.code === 'INVALID_OTP') {
          throw new Error(error.message || 'Invalid verification code.');
        }
        throw new Error(error.message || 'Verification failed.');
      }

      return data as OTPResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  // Resend OTP
  async resendOTP(email: string, _captchaToken?: string): Promise<OTPResponse> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // TEMPORARILY DISABLED: Always send captcha-disabled for debugging
      headers['x-captcha-token'] = 'captcha-disabled';
      // if (captchaToken) {
      //   headers['x-captcha-token'] = captchaToken;
      // } else {
      //   headers['x-captcha-token'] = 'captcha-disabled';
      // }

      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = data;
        if (error.code === 'TOO_MANY_REQUESTS') {
          throw new Error(error.message || `Please wait before requesting another code.`);
        }
        throw new Error(error.message || 'Failed to resend verification code.');
      }

      return data as OTPResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  async register(data: RegisterData, _captchaToken?: string) {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // TEMPORARILY DISABLED: Always send captcha-disabled for debugging
      headers['x-captcha-token'] = 'captcha-disabled';
      // if (captchaToken) {
      //   headers['x-captcha-token'] = captchaToken;
      // } else {
      //   headers['x-captcha-token'] = 'captcha-disabled';
      // }

      const requestBody = {
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        location: data.location,
        role: data.role,
      };

      console.log('[Auth Service] Registering user:', { email: data.email, role: data.role });
      console.log('[Auth Service] API URL:', `${API_BASE_URL}/auth/signup`);

      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log('[Auth Service] Response status:', response.status, response.statusText);
      console.log('[Auth Service] Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      let result: any;
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        const text = await response.text();
        console.error('[Auth Service] Non-JSON response:', text);
        throw new Error(`Server returned an invalid response. Please try again later. (Status: ${response.status})`);
      }

      console.log('[Auth Service] Response data:', result);

      if (!response.ok) {
        const error: ApiError = result;
        console.error('[Auth Service] Registration error:', error);
        
        if (error.code === 'EMAIL_IN_USE') {
          throw new Error('This email is already registered. Please use a different email or try logging in instead.');
        }
        if (error.code === 'WEAK_PASSWORD') {
          throw new Error('Password must be at least 8 characters long and include uppercase letters, lowercase letters, and numbers.');
        }
        if (error.code === 'VALIDATION_ERROR') {
          const details = error.details ? ` Details: ${JSON.stringify(error.details)}` : '';
          throw new Error(`Please check your information and try again. Make sure your email is valid and password meets the requirements.${details}`);
        }
        if (error.code === 'CAPTCHA_REQUIRED') {
          throw new Error('CAPTCHA verification is required. Please complete the CAPTCHA.');
        }
        if (error.code === 'CAPTCHA_INVALID' || error.code === 'CAPTCHA_VERIFICATION_FAILED') {
          throw new Error('CAPTCHA verification failed. Please try again.');
        }
        if (error.code === 'ACCOUNT_RATE_LIMITED') {
          throw new Error('Too many registration attempts. Please wait a moment and try again.');
        }
        throw new Error(error.error || error.message || 'Registration failed. Please try again.');
      }

      // Store token and user
      // Backend returns full user data including role, name, etc.
      // MongoDB ID is a string, convert to number for frontend compatibility
      // Also store original MongoDB ID as string for backend comparisons
      const mongoId = typeof result.user.id === 'string' ? result.user.id : result.user.id?.toString();
      const userId = typeof result.user.id === 'string' ? parseInt(result.user.id, 16) || Date.now() : result.user.id;
      const userWithDefaults = {
        id: userId,
        mongoId: mongoId,
        email: result.user.email,
        name: result.user.name || data.name || result.user.email.split('@')[0] || 'User', // Use name from backend or registration
        phone: result.user.phone || data.phone || '',
        location: result.user.location || data.location || '',
        avatar: result.user.avatar || '',
        role: (result.user.role || data.role || 'farmer') as 'farmer' | 'roaster' | 'trader' | 'exporter' | 'expert' | 'admin' | 'moderator', // Use role from backend or registration
        verified: result.user.verified || false,
        memberSince: new Date().getFullYear().toString()
      };
      
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(userWithDefaults));

      console.log('[Auth Service] Registration successful:', { email: userWithDefaults.email, role: userWithDefaults.role });
      
      return {
        token: result.token,
        user: userWithDefaults,
      };
    } catch (error) {
      console.error('[Auth Service] Registration catch error:', error);
      
      if (error instanceof Error) {
        // Re-throw with the original error message
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      throw new Error('Registration failed. Please try again later.');
    }
  },

  async logout() {
    // TODO: Replace with actual API call
    localStorage.removeItem('token');
  },

  getCurrentUser() {
    // TODO: Replace with actual API call
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    // In a real app, decode JWT or fetch user from API
    // For now, return user from localStorage if available
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    
    return null;
  },

  async forgotPassword(email: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        }
        throw new Error(data.message || data.error || 'Failed to send password reset email');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check if the API server is running.');
    }
  },

  async resetPassword(token: string, newPassword: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, password: newPassword })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(data.message || data.error || 'Invalid or expired reset link');
        }
        if (response.status === 429) {
          throw new Error('Too many requests. Please try again later.');
        }
        throw new Error(data.message || data.error || 'Failed to reset password');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check if the API server is running.');
    }
  },

  async updateProfile(data: { name?: string; phone?: string; location?: string; avatar?: string }) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(result.message || result.error || 'You cannot update this field after verification');
        }
        if (response.status === 401) {
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(result.message || result.error || 'Failed to update profile');
      }

      // Update localStorage with new user data
      const mongoId = typeof result.user.id === 'string' ? result.user.id : result.user.id?.toString();
      const userId = typeof result.user.id === 'string' ? parseInt(result.user.id, 16) || Date.now() : result.user.id;
      const userWithDefaults = {
        id: userId,
        mongoId: mongoId,
        email: result.user.email,
        name: result.user.name || result.user.email.split('@')[0] || 'User',
        role: (result.user.role || 'farmer') as 'farmer' | 'roaster' | 'trader' | 'exporter' | 'expert' | 'admin' | 'moderator',
        phone: result.user.phone || '',
        location: result.user.location || '',
        avatar: result.user.avatar || '',
        verified: result.user.verified || false,
        memberSince: new Date().getFullYear().toString()
      };
      
      localStorage.setItem('user', JSON.stringify(userWithDefaults));

      return {
        user: userWithDefaults
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check if the API server is running.');
    }
  }
};

