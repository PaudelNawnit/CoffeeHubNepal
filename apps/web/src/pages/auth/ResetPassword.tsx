import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { useApp } from '@/context/AppContext';
import { authService } from '@/services/auth.service';
import logoImage from '@/assets/images/logo/coffeelogo.png';

interface ResetPasswordProps {
  onBack?: () => void;
}

export const ResetPassword = ({ onBack }: ResetPasswordProps) => {
  const { setSubPage } = useApp();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Get token from URL query parameter or sessionStorage
  useEffect(() => {
    // First try to get from URL (if accessed directly from email link)
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('token');
    
    // If not in URL, check sessionStorage (set by App.tsx)
    const tokenFromStorage = sessionStorage.getItem('resetPasswordToken');
    
    if (tokenParam) {
      setToken(tokenParam);
      // Clear URL parameter to keep URL clean
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else if (tokenFromStorage) {
      setToken(tokenFromStorage);
      // Clear from sessionStorage after using
      sessionStorage.removeItem('resetPasswordToken');
    } else {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, []);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/\d/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    // Validate password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    setIsLoading(true);

    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      setError('');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        setSubPage('login');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to reset password. Please try again.';
      
      if (errorMessage.includes('expired') || errorMessage.includes('TOKEN_EXPIRED')) {
        setError('This password reset link has expired. Please request a new one.');
      } else if (errorMessage.includes('invalid') || errorMessage.includes('INVALID_TOKEN')) {
        setError('Invalid or expired password reset link. Please request a new one.');
      } else if (errorMessage.includes('weak') || errorMessage.includes('WEAK_PASSWORD')) {
        setError('Password must be at least 8 characters and contain uppercase, lowercase, and a number.');
      } else {
        setError(errorMessage);
      }
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] p-6 pb-32 flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 border-4 border-[#6F4E37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <LoadingOverlay 
        isVisible={isLoading} 
        message="Resetting password..."
        success={success}
        successMessage="Password reset successful!"
      />
      <div className="min-h-screen bg-[#F8F5F2] p-6 pb-32">
        {onBack && (
          <button onClick={onBack} className="mb-6 flex items-center gap-2 text-gray-600">
            <ArrowLeft size={20} />
            <span className="text-sm font-bold">Back</span>
          </button>
        )}

        <div className="max-w-md mx-auto mt-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden">
              <img 
                src={logoImage} 
                alt="CoffeeHubNepal Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl font-black text-[#6F4E37] mb-2">Reset Password</h1>
            <p className="text-sm text-gray-600">Enter your new password below</p>
          </div>

          <Card className="p-8">
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-in fade-in">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} fill="currentColor" />
                <div className="flex-1">
                  <p className="text-sm text-green-700 font-bold mb-1">Password reset successful!</p>
                  <p className="text-xs text-green-600">
                    Your password has been updated. Redirecting to login...
                  </p>
                </div>
              </div>
            )}

            {error && !success && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm" role="alert">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-red-700 font-bold">{error}</p>
                  {error.includes('expired') || error.includes('invalid') ? (
                    <button
                      onClick={() => setSubPage('forgot-password')}
                      className="mt-2 text-xs text-red-600 font-bold hover:underline"
                    >
                      Request a new reset link
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    label="New Password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p className="font-bold">Password requirements:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li>At least 8 characters</li>
                    <li>One uppercase letter</li>
                    <li>One lowercase letter</li>
                    <li>One number</li>
                  </ul>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3"
                  disabled={isLoading || !password || !confirmPassword}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}

            {!success && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setSubPage('forgot-password')}
                  className="text-sm text-[#6F4E37] font-bold hover:underline"
                >
                  Need a new reset link?
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

