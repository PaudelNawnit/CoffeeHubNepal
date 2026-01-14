import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { Captcha } from '@/components/common/Captcha';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/i18n';
import logoImage from '@/assets/images/logo/coffeelogo.webp';

interface LoginProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export const Login = ({ onBack, onSuccess }: LoginProps) => {
  const { navigate, setUserRole, setSubPage, language } = useApp();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Debug: Log error changes
  useEffect(() => {
    if (error) {
      console.log('Error state updated:', error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setSuccess(false);

    // Require CAPTCHA token before submitting
    if (!captchaToken) {
      setError('Please complete the CAPTCHA verification.');
      setIsLoading(false);
      return;
    }

    try {
      await login({ email, password }, captchaToken);

      // Show success message
      setSuccess(true);
      setError('');

      // Clear CAPTCHA token (component will handle its own cleanup on unmount)
      setCaptchaToken(null);

      // Wait a moment to show success animation
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Try to update user role from stored user, but don't block navigation if it fails
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user?.role) {
            setUserRole(user.role || 'farmer');
          }
        }
      } catch (parseErr) {
        console.error('Failed to parse stored user after login:', parseErr);
      }

      // Navigate to home page and clear subPage to show main app
      navigate('home');
      setSubPage(null);
      onSuccess?.();
    } catch (err: any) {
      console.error('Login error:', err);
      // Ensure error message is set and displayed
      const errorMessage = err?.message || 'Login failed. Please check your credentials and try again.';
      console.log('Setting error message:', errorMessage);
      
      // Set loading to false and error at the same time
      setIsLoading(false);
      setError(errorMessage);
      setSuccess(false);
      
      // Scroll to top to show error after a brief delay
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <>
      <LoadingOverlay
        isVisible={isLoading}
        message="Signing you in..."
        success={success}
        successMessage="Welcome back!"
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
          <h1 className="text-3xl font-black text-[#6F4E37] mb-2">Welcome Back</h1>
          <p className="text-sm text-gray-600">Sign in to your CoffeeHubNepal account</p>
        </div>

        <Card className="p-8">
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-in fade-in">
              <CheckCircle className="text-green-600" size={20} fill="currentColor" />
              <p className="text-sm text-green-700 font-bold">Logged in successfully! Redirecting...</p>
            </div>
          )}
          {error ? (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm" role="alert">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm text-red-700 font-bold">{error}</p>
                {(error.toLowerCase().includes('invalid') || error.toLowerCase().includes('email') || error.toLowerCase().includes('password')) && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-red-600 font-semibold">
                      • Check if the email address is correct
                    </p>
                    <p className="text-xs text-red-600 font-semibold">
                      • Verify your password is correct
                    </p>
                    <p className="text-xs text-red-600 font-semibold">
                      • Make sure you have an account. If not, please{' '}
                      <button 
                        type="button"
                        onClick={() => navigate('register')} 
                        className="underline font-bold hover:text-red-700"
                      >
                        register first
                      </button>
                    </p>
                  </div>
                )}
                {error.toLowerCase().includes('locked') && (
                  <p className="text-xs text-red-600 mt-1 font-semibold">
                    Your account is temporarily locked. Please wait before trying again.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              label={t(language, 'auth.emailAddress')}
              placeholder="farmer@coffeehubnepal.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
                setSuccess(false);
              }}
              autoComplete="email"
              required
            />

            <Input
              type="password"
              label={t(language, 'auth.password')}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
                setSuccess(false);
              }}
              autoComplete="current-password"
              required
            />

            {/* CAPTCHA */}
            <div className="space-y-2">
              <Captcha
                onVerify={(token) => {
                  setCaptchaToken(token);
                  setError('');
                }}
                onError={() => {
                  setCaptchaToken(null);
                  setError('CAPTCHA verification failed. Please try again.');
                }}
                onExpire={() => {
                  setCaptchaToken(null);
                  setError('CAPTCHA expired. Please verify again.');
                }}
              />
              {error && error.includes('CAPTCHA') && (
                <p className="text-xs text-red-600">{error}</p>
              )}
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full py-4"
              disabled={isLoading || !captchaToken}
            >
              {isLoading ? t(language, 'auth.signingIn') : t(language, 'auth.signIn')}
            </Button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setSubPage('forgot-password')}
                className="text-sm text-[#6F4E37] font-bold hover:underline"
              >
                {t(language, 'auth.forgotPassword')}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-[#EBE3D5] text-center">
            <p className="text-xs text-gray-500">
              {t(language, 'auth.noAccount')}{' '}
              <button 
                type="button"
                onClick={() => navigate('register')}
                className="font-black text-[#6F4E37] hover:underline"
              >
                {t(language, 'auth.signUp')}
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
    </>
  );
};

