import { useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import logoImage from '@/assets/images/logo.png';

interface LoginProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

export const Login = ({ onBack, onSuccess }: LoginProps) => {
  const { navigate, setUserRole } = useApp();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      // Get user from auth context to set role
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
              <AlertCircle className="text-red-600" size={20} />
              <p className="text-sm text-red-700 font-bold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="email"
              label="Email Address"
              placeholder="farmer@coffeehubnepal.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              required
            />

            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl">
              <p className="font-black mb-1">Demo Credentials:</p>
              <p>Farmer: farmer@coffeehubnepal.com / farmer123</p>
              <p>Roaster: roaster@coffeehubnepal.com / roaster123</p>
            </div>

            <div className="flex justify-end">
              <button type="button" className="text-xs font-black text-[#6F4E37] uppercase">
                Forgot Password?
              </button>
            </div>

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full py-4"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#EBE3D5] text-center">
            <p className="text-xs text-gray-500">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => navigate('register')}
                className="font-black text-[#6F4E37] hover:underline"
              >
                Register
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

