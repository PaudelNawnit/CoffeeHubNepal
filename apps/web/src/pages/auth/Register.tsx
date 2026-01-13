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
type RegistrationStep = 'email' | 'otp' | 'details';

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
  
  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // OTP timer countdown
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 'otp') {
      setCanResend(true);
    }
  }, [otpTimer, step]);

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

  // Handle sending OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail()) return;
    
    setIsLoading(true);
    setSubmitError('');
    
    try {
      const result = await authService.sendOTP(formData.email, captchaToken || undefined);
      setStep('otp');
      setOtpTimer(result.expiresIn || 600); // 10 minutes default
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only keep last digit
    setOtp(newOtp);
    
    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
  };

  // Handle OTP key down for backspace
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setSubmitError('Please enter the complete 6-digit code');
      return;
    }
    
    setIsLoading(true);
    setSubmitError('');
    
    try {
      await authService.verifyOTP(formData.email, otpString);
      setStep('details');
      // Reset captcha token when moving to details step - user will need to verify again
      setCaptchaToken(null);
    } catch (err: any) {
      setSubmitError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    setSubmitError('');
    
    try {
      const result = await authService.resendOTP(formData.email, captchaToken || undefined);
      setOtpTimer(result.expiresIn || 600);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setSubmitError('');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle final registration
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateDetails()) return;

    setIsLoading(true);
    setSubmitError('');

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        password: formData.password,
        role: formData.role
      }, captchaToken || undefined);
      
      setSuccess(true);
      setSubmitError('');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setUserRole(user.role || formData.role);
      }
      navigate('home');
      setSubPage(null);
      onSuccess?.();
    } catch (err: any) {
      console.error('Registration error:', err);
      setSubmitError(err?.message || 'Registration failed. Please try again.');
      setSuccess(false);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back button
  const handleBack = () => {
    if (step === 'otp') {
      setStep('email');
      setOtp(['', '', '', '', '', '']);
      setSubmitError('');
      // Reset captcha token when going back to email step
      setCaptchaToken(null);
    } else if (step === 'details') {
      setStep('otp');
      setSubmitError('');
      // Reset captcha token when going back to OTP step
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
        message={step === 'email' ? 'Sending verification code...' : step === 'otp' ? 'Verifying code...' : 'Creating your account...'}
        success={success}
        successMessage="Account created successfully!"
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
              {step === 'otp' && 'Verify Your Email'}
              {step === 'details' && 'Complete Your Profile'}
            </h1>
            <p className="text-sm text-gray-600">
              {step === 'email' && 'Enter your email to get started'}
              {step === 'otp' && `Enter the 6-digit code sent to ${formData.email}`}
              {step === 'details' && 'Fill in your details to complete registration'}
            </p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {['email', 'otp', 'details'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === s ? 'bg-[#6F4E37] text-white' : 
                  ['email', 'otp', 'details'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {['email', 'otp', 'details'].indexOf(step) > i ? <CheckCircle size={16} /> : i + 1}
                </div>
                {i < 2 && <div className={`w-8 h-1 ${['email', 'otp', 'details'].indexOf(step) > i ? 'bg-green-500' : 'bg-gray-200'}`} />}
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
              <form onSubmit={handleSendOTP} className="space-y-5">
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
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
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

            {/* Step 2: OTP Verification */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <Mail className="text-blue-600" size={24} />
                  </div>
                </div>

                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={handleOtpPaste}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-[#EBE3D5] rounded-xl focus:border-[#6F4E37] focus:ring-2 ring-[#6F4E37]/10 outline-none"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                <div className="text-center">
                  {otpTimer > 0 ? (
                    <p className="text-sm text-gray-600">
                      Code expires in <span className="font-bold text-[#6F4E37]">{formatTimer(otpTimer)}</span>
                    </p>
                  ) : (
                    <p className="text-sm text-red-600 font-bold">Code expired</p>
                  )}
                </div>

                <Button type="submit" variant="primary" className="w-full py-4" disabled={isLoading || otp.join('').length !== 6}>
                  {isLoading ? 'Verifying...' : 'Verify Code'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={!canResend || isLoading}
                    className={`text-sm font-bold inline-flex items-center gap-2 ${
                      canResend ? 'text-[#6F4E37] hover:underline' : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <RefreshCw size={14} />
                    Resend Code
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Details */}
            {step === 'details' && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 mb-4">
                  <CheckCircle className="text-green-600" size={18} />
                  <p className="text-sm text-green-700 font-bold">Email verified: {formData.email}</p>
                </div>

                <Input
                  type="text"
                  label="Full Name"
                  placeholder="Ram Thapa"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  error={errors.name}
                  required
                />

                <Input
                  type="tel"
                  label="Phone Number"
                  placeholder="9800000000"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, phone: value });
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  error={errors.phone}
                  required
                />

                <Input
                  type="text"
                  label="Location"
                  placeholder="Kaski, Nepal"
                  value={formData.location}
                  onChange={(e) => {
                    setFormData({ ...formData, location: e.target.value });
                    if (errors.location) setErrors({ ...errors, location: '' });
                  }}
                  error={errors.location}
                  required
                />

                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-black text-gray-600 mb-3 uppercase tracking-tight">
                    I am a
                  </label>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {(Object.keys(ROLE_INFO) as UserRole[]).map(role => {
                      const info = ROLE_INFO[role];
                      const isSelected = formData.role === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setFormData({ ...formData, role })}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-[#6F4E37] bg-[#F5EFE6] shadow-sm'
                              : 'border-[#EBE3D5] bg-white hover:border-[#6F4E37]/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl">{info.icon}</span>
                            <span className={`font-black text-xs uppercase ${isSelected ? 'text-[#6F4E37]' : 'text-gray-500'}`}>
                              {info.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1">{info.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-black text-gray-600 mb-2 uppercase tracking-tight">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: '' });
                      }}
                      autoComplete="new-password"
                      className={`w-full bg-white border rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 ring-[#6F4E37]/10 text-sm ${
                        errors.password ? 'border-red-300' : 'border-[#EBE3D5]'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formData.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full ${
                              level <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs font-bold ${passwordStrength.strength >= 2 ? 'text-green-600' : 'text-gray-500'}`}>
                        {passwordStrength.label}
                      </p>
                    </div>
                  )}
                  {errors.password && <p className="mt-1 text-xs text-red-600 font-bold">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-black text-gray-600 mb-2 uppercase tracking-tight">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                      }}
                      autoComplete="new-password"
                      className={`w-full bg-white border rounded-xl px-4 py-3 pr-12 outline-none focus:ring-2 ring-[#6F4E37]/10 text-sm ${
                        errors.confirmPassword ? 'border-red-300' : 'border-[#EBE3D5]'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <div className="mt-2 flex items-center gap-2 text-green-600">
                      <CheckCircle size={14} />
                      <p className="text-xs font-bold">Passwords match</p>
                    </div>
                  )}
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-600 font-bold">{errors.confirmPassword}</p>}
                </div>

                {/* Terms and Conditions */}
                <div>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={(e) => {
                        setFormData({ ...formData, acceptTerms: e.target.checked });
                        if (errors.acceptTerms) setErrors({ ...errors, acceptTerms: '' });
                      }}
                      className="mt-1 w-4 h-4 rounded border-[#EBE3D5] text-[#6F4E37] focus:ring-[#6F4E37]"
                    />
                    <div className="flex-1">
                      <p className="text-xs text-gray-700">
                        I agree to the{' '}
                        <button type="button" onClick={() => navigate('terms')} className="font-black text-[#6F4E37] underline">
                          Terms of Service
                        </button>
                        {' '}and{' '}
                        <button type="button" onClick={() => navigate('privacy')} className="font-black text-[#6F4E37] underline">
                          Privacy Policy
                        </button>
                      </p>
                      {errors.acceptTerms && (
                        <p className="mt-1 text-xs text-red-600 font-bold flex items-center gap-1">
                          <AlertCircle size={12} />
                          {errors.acceptTerms}
                        </p>
                      )}
                    </div>
                  </label>
                </div>

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

                <Button type="submit" variant="primary" className="w-full py-4 mt-6" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </>
  );
};
