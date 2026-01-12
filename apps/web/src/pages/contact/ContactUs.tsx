import { ArrowLeft, Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle, Facebook, Instagram } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Captcha } from '@/components/common/Captcha';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/i18n';
import { useState } from 'react';
import { contactService } from '@/services/contact.service';

export const ContactUs = () => {
  const { setCurrentPage, setSubPage, navigate, language } = useApp();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const handleBack = () => {
    if (isAuthenticated) {
      setCurrentPage('home');
    } else {
      setSubPage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCaptchaError(null);
    
    // Validate CAPTCHA
    if (!captchaToken) {
      setCaptchaError(t(language, 'contact.captchaRequired') || 'Please complete the CAPTCHA verification');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await contactService.submitContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject,
        message: formData.message
      }, captchaToken);
      
      setSubmitSuccess(true);
      setFormData({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', subject: '', message: '' });
      setCaptchaToken(null);
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32 lg:pb-8">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 lg:px-8 py-4 flex items-center gap-4">
        <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37] flex-1">{t(language, 'contact.title')}</h2>
      </div>

      <div className="p-6 lg:p-8 lg:max-w-5xl lg:mx-auto space-y-8">
        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Phone className="text-blue-600" size={24} />
            </div>
            <h4 className="font-black mb-2">{t(language, 'contact.phoneTitle')}</h4>
            <p className="text-sm text-gray-600">+977 9800000000</p>
            <p className="text-sm text-gray-600">+977 9800000001</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="text-green-600" size={24} />
            </div>
            <h4 className="font-black mb-2">{t(language, 'contact.emailTitle')}</h4>
            <a href="mailto:coffeehubnepal@gmail.com" className="text-sm text-gray-600 hover:text-[#6F4E37] transition-colors block">
              coffeehubnepal@gmail.com
            </a>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="text-amber-600" size={24} />
            </div>
            <h4 className="font-black mb-2">{t(language, 'contact.addressTitle')}</h4>
            <p className="text-sm text-gray-600">Kathmandu, Nepal</p>
            <p className="text-sm text-gray-600">New Baneshwor</p>
          </Card>
        </div>

        {/* Office Hours */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-[#6F4E37]" size={24} />
            <h3 className="text-xl font-black">{t(language, 'contact.officeHoursTitle')}</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-black text-sm mb-1">{t(language, 'contact.mondayFriday')}</p>
              <p className="text-sm text-gray-600">9:00 AM - 6:00 PM</p>
            </div>
            <div>
              <p className="font-black text-sm mb-1">{t(language, 'contact.saturday')}</p>
              <p className="text-sm text-gray-600">10:00 AM - 4:00 PM</p>
            </div>
            <div>
              <p className="font-black text-sm mb-1">{t(language, 'contact.sunday')}</p>
              <p className="text-sm text-gray-600">{t(language, 'contact.closed')}</p>
            </div>
            <div>
              <p className="font-black text-sm mb-1">{t(language, 'contact.emergencySupport')}</p>
              <p className="text-sm text-gray-600">{t(language, 'contact.emergencyText')}</p>
            </div>
          </div>
        </Card>

        {/* Contact Form */}
        <Card className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="text-[#6F4E37]" size={28} />
            <h3 className="text-2xl font-black">{t(language, 'contact.sendMessageTitle')}</h3>
          </div>

          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h4 className="text-xl font-black text-green-700 mb-2">{t(language, 'contact.messageSent')}</h4>
              <p className="text-gray-600 mb-6">{t(language, 'contact.thankYou')}</p>
              <Button 
                variant="outline" 
                onClick={() => setSubmitSuccess(false)}
              >
                {t(language, 'contact.sendAnother')}
              </Button>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <Input
                type="text"
                label={t(language, 'contact.yourName')}
                placeholder={t(language, 'contact.namePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                type="email"
                label={t(language, 'contact.emailAddress')}
                placeholder={t(language, 'contact.emailPlaceholder')}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <Input
                type="tel"
                label={t(language, 'contact.phoneNumber')}
                placeholder={t(language, 'contact.phonePlaceholder')}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                type="text"
                label={t(language, 'contact.subject')}
                placeholder={t(language, 'contact.subjectPlaceholder')}
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-600 mb-2 uppercase tracking-tight">
                {t(language, 'contact.message')}
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder={t(language, 'contact.messagePlaceholder')}
                className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-3 outline-none focus:ring-2 ring-[#6F4E37]/10 text-sm min-h-[150px]"
                required
              />
            </div>

            {/* CAPTCHA */}
            <div className="space-y-2">
              <Captcha
                onVerify={(token) => {
                  setCaptchaToken(token);
                  setCaptchaError(null);
                }}
                onError={() => {
                  setCaptchaToken(null);
                  setCaptchaError(t(language, 'contact.captchaError') || 'CAPTCHA verification failed. Please try again.');
                }}
                onExpire={() => {
                  setCaptchaToken(null);
                  setCaptchaError(t(language, 'contact.captchaExpired') || 'CAPTCHA expired. Please verify again.');
                }}
              />
              {captchaError && (
                <p className="text-xs text-red-600 font-bold text-center">{captchaError}</p>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              variant="primary" 
              className="w-full py-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                t(language, 'contact.sending')
              ) : (
                <>
                  <Send size={18} /> {t(language, 'contact.sendMessage')}
                </>
              )}
            </Button>
          </form>
          )}
        </Card>

        {/* Social Media / Quick Links */}
        <Card className="p-6 bg-gradient-to-br from-[#6F4E37] to-[#4E3626] text-white border-none">
          <h3 className="text-xl font-black mb-4">{t(language, 'contact.connectWithUs')}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-white/80 mb-2">{t(language, 'contact.followUs')}</p>
              <div className="flex gap-3">
                <a 
                  href="https://www.facebook.com/share/1DMMTypgRK/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#1877F2] transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a>
                <a 
                  href="https://www.instagram.com/coffeehubnepal" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={20} />
                </a>
                <a 
                  href="https://www.tiktok.com/@coffeehubnepal" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-black transition-colors"
                  aria-label="TikTok"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <p className="text-sm text-white/80 mb-2">{t(language, 'contact.quickLinks')}</p>
              <div className="space-y-1">
                <button 
                  onClick={() => navigate('faq')}
                  className="text-sm text-white/90 hover:text-white underline"
                >
                  {t(language, 'nav.faq')}
                </button>
                <span className="text-white/50 mx-2">•</span>
                <button 
                  onClick={() => navigate('privacy')}
                  className="text-sm text-white/90 hover:text-white underline"
                >
                  {t(language, 'nav.privacy')}
                </button>
                <span className="text-white/50 mx-2">•</span>
                <button 
                  onClick={() => navigate('terms')}
                  className="text-sm text-white/90 hover:text-white underline"
                >
                  {t(language, 'nav.terms')}
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

