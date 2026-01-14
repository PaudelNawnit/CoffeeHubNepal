import { useState } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { useApp } from '@/context/AppContext';
import { authService } from '@/services/auth.service';
import logoImage from '@/assets/images/logo/coffeelogo.png';

interface ForgotPasswordProps {
  onBack?: () => void;
}

export const ForgotPassword = ({ onBack }: ForgotPasswordProps) => {
  const { setSubPage } = useApp();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
      setSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay 
        isVisible={isLoading} 
        message="Sending reset link..."
        success={success}
        successMessage="Reset link sent!"
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
            <h1 className="text-3xl font-black text-[#6F4E37] mb-2">Forgot Password?</h1>
            <p className="text-sm text-gray-600">Enter your email and we'll send you a reset link</p>
          </div>

          <Card className="p-8">
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-in fade-in">
                <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} fill="currentColor" />
                <div className="flex-1">
                  <p className="text-sm text-green-700 font-bold mb-1">Reset link sent!</p>
                  <p className="text-xs text-green-600">
                    If an account with that email exists, we've sent a password reset link. Please check your email and follow the instructions.
                  </p>
                </div>
              </div>
            )}

            {error && !success && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm" role="alert">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-red-700 font-bold">{error}</p>
                </div>
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  required
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full py-3"
                  disabled={isLoading || !email.trim()}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            )}

            {success && (
              <Button
                variant="outline"
                className="w-full py-3 mt-4"
                onClick={() => {
                  setSubPage('login');
                }}
              >
                Back to Login
              </Button>
            )}

            {!success && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    if (onBack) {
                      onBack();
                    } else {
                      setSubPage('login');
                    }
                  }}
                  className="text-sm text-[#6F4E37] font-bold hover:underline"
                >
                  Remember your password? Sign in
                </button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};

