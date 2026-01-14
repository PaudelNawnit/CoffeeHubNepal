import { useState, useEffect } from 'react';
import { ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
// TEMPORARILY DISABLED: CAPTCHA for debugging OTP flow
// import { Captcha } from '@/components/common/Captcha';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/auth.service';
import logoImage from '@/assets/images/logo/coffeelogo.png';

interface RegisterProps {
  onBack?: () => void;
  onSuccess?: () => void;
}

type UserRole = 'farmer' | 'roaster' | 'trader' | 'exporter' | 'expert';
type RegistrationStep = 'email' | 'check-email';

const ROLE_INFO: { [key in UserRole]: { label: string; icon: string; description: string } } = {
  farmer: { label: 'Farmer', icon: '🌱', description: 'Grow and sell coffee' },
  roaster: { label: 'Roaster', icon: '🔥', description: 'Roast and process beans' },
  trader: { label: 'Trader', icon: '💼', description: 'Buy and sell coffee' },
  exporter: { label: 'Exporter', icon: '✈️', description: 'Export coffee internationally' },
  expert: { label: 'Expert', icon: '🎓', description: 'Share knowledge and advice' }
};

export const Register = ({ onBack, onSuccess }: RegisterProps) => {
  const { navigate, setUserRole, setSubPage } = useApp();
  const { register } = useAuth();
  
  // Registration step
  const [step, setStep] = useState<RegistrationStep>('email');
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: '',
    role: 'farmer' as UserRole,
    acceptTerms: false
  });
  
  // Verification link state
  const [linkTimer, setLinkTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Resend timer countdown
  useEffect(() => {
    if (linkTimer > 0) {
      const timer = setTimeout(() => setLinkTimer(linkTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 'check-email') {
      setCanResend(true);
    }
  }, [linkTimer, step]);

  // Validate email step
  const validateEmail = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    // TEMPORARILY DISABLED: CAPTCHA validation for debugging
    // if (!captchaToken) {
    //   newErrors.captcha = 'Please complete the CAPTCHA verification';
    // }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate details step
  const validateDetails = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
    }

    // TEMPORARILY DISABLED: CAPTCHA validation for debugging
    // Validate captcha for final registration
    // if (!captchaToken) {
    //   newErrors.captcha = 'Please complete the CAPTCHA verification';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
    if (password.length < 8) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { strength: 3, label: 'Strong', color: 'bg-green-500' };
    }
    return { strength: 2, label: 'Fair', color: 'bg-yellow-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Handle sending verification link
  const handleSendVerificationLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    setIsLoading(true);
    setSubmitError('');
    
    try {
      const result = await authService.requestSignupLink(formData.email, captchaToken || undefined);
      setStep('check-email');
      setLinkTimer(result.expiresIn || 1800); // 30 minutes default
      setCanResend(false);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to send verification link');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend verification link
  const handleResendLink = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    setSubmitError('');
    
    try {
      const result = await authService.requestSignupLink(formData.email, captchaToken || undefined);
      setLinkTimer(result.expiresIn || 1800);
      setCanResend(false);
      setSubmitError('');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to resend verification link');
    } finally {
      setIsLoading(false);
    }
  };


  // Handle back button
  const handleBack = () => {
    if (step === 'check-email') {
      setStep('email');
      setSubmitError('');
      // Reset captcha token when going back to email step
      setCaptchaToken(null);
    } else if (onBack) {
      onBack();
    }
  };

  // Format timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <LoadingOverlay 
        isVisible={isLoading} 
        message={step === 'email' ? 'Sending verification link...' : 'Processing...'}
        success={success}
        successMessage="Verification link sent!"
      />
      <div className="min-h-screen bg-[#F8F5F2] p-6 pb-32 lg:pb-8">
        <button onClick={handleBack} className="mb-6 flex items-center gap-2 text-gray-600 hover:text-[#6F4E37] transition-colors">
          <ArrowLeft size={20} />
          <span className="text-sm font-bold">Back</span>
        </button>

        <div className="max-w-lg mx-auto mt-4 lg:mt-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden bg-white p-2">
              <img 
                src={logoImage} 
                alt="CoffeeHubNepal Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-[#6F4E37] mb-2">
              {step === 'email' && 'Join CoffeeHubNepal'}
              {step === 'check-email' && 'Check Your Email'}
            </h1>
            <p className="text-sm text-gray-600">
              {step === 'email' && 'Enter your email to get started'}
              {step === 'check-email' && `We've sent a verification link to ${formData.email}`}
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {['email', 'check-email'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === s ? 'bg-[#6F4E37] text-white' : 
                  ['email', 'check-email'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {['email', 'check-email'].indexOf(step) > i ? <CheckCircle size={16} /> : i + 1}
                </div>
                {i < 1 && <div className={`w-8 h-1 ${['email', 'check-email'].indexOf(step) > i ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>

          <Card className="p-6 lg:p-8">
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-in fade-in">
                <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-sm text-red-700 font-bold">{submitError}</p>
              </div>
            )}

            {/* Step 1: Email */}
            {step === 'email' && (
              <form onSubmit={handleSendVerificationLink} className="space-y-5">
                <Input
                  type="email"
                  label="Email Address"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  autoComplete="email"
                  error={errors.email}
                  required
                />

                {/* TEMPORARILY DISABLED: CAPTCHA for debugging OTP flow */}
                {/* <div className="space-y-2">
                  <Captcha
                    onVerify={(token) => {
                      setCaptchaToken(token);
                      if (errors.captcha) setErrors({ ...errors, captcha: '' });
                    }}
                    onError={() => {
                      setCaptchaToken(null);
                      setErrors({ ...errors, captcha: 'CAPTCHA verification failed.' });
                    }}
                    onExpire={() => {
                      setCaptchaToken(null);
                      setErrors({ ...errors, captcha: 'CAPTCHA expired.' });
                    }}
                  />
                  {errors.captcha && (
                    <p className="text-xs text-red-600 font-bold text-center">{errors.captcha}</p>
                  )}
                </div> */}

                <Button type="submit" variant="primary" className="w-full py-4" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Verification Link'}
                </Button>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    Already have an account?{' '}
                    <button type="button" onClick={() => navigate('login')} className="font-black text-[#6F4E37] hover:underline">
                      Sign In
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* Step 2: Check Email */}
            {step === 'check-email' && (
              <div className="space-y-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                    <Mail className="text-blue-600" size={32} />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-black text-[#6F4E37]">Check your email</h3>
                  <p className="text-sm text-gray-600">
                    We've sent a verification link to <span className="font-bold text-[#6F4E37]">{formData.email}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Click the link in the email to complete your registration. The link will expire in 30 minutes.
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-4">
                    Didn't receive the email? Check your spam folder or
                  </p>
                  <button
                    type="button"
                    onClick={handleResendLink}
                    disabled={!canResend || isLoading}
                    className={`text-sm font-bold inline-flex items-center gap-2 ${
                      canResend ? 'text-[#6F4E37] hover:underline' : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    {canResend ? 'Resend verification link' : `Resend in ${formatTimer(linkTimer)}`}
                  </button>
                </div>

                <div className="text-center pt-4">
                  <p className="text-xs text-gray-500">
                    Already have an account?{' '}
                    <button type="button" onClick={() => navigate('login')} className="font-black text-[#6F4E37] hover:underline">
                      Sign In
                    </button>
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};
