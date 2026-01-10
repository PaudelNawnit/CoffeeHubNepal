import { ArrowLeft, Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { contactService } from '@/services/contact.service';

export const ContactUs = () => {
  const { setCurrentPage } = useApp();
  const { user } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await contactService.submitContact({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        subject: formData.subject,
        message: formData.message
      });
      
      setSubmitSuccess(true);
      setFormData({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '', subject: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32 lg:pb-8">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 lg:px-8 py-4 flex items-center gap-4">
        <button onClick={() => setCurrentPage('home')} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37] flex-1">Contact Us</h2>
      </div>

      <div className="p-6 lg:p-8 lg:max-w-5xl lg:mx-auto space-y-8">
        {/* Contact Info Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-6 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Phone className="text-blue-600" size={24} />
            </div>
            <h4 className="font-black mb-2">Phone</h4>
            <p className="text-sm text-gray-600">+977 9800000000</p>
            <p className="text-sm text-gray-600">+977 9800000001</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="text-green-600" size={24} />
            </div>
            <h4 className="font-black mb-2">Email</h4>
            <p className="text-sm text-gray-600">info@coffeehubnepal.com</p>
            <p className="text-sm text-gray-600">support@coffeehubnepal.com</p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin className="text-amber-600" size={24} />
            </div>
            <h4 className="font-black mb-2">Address</h4>
            <p className="text-sm text-gray-600">Kathmandu, Nepal</p>
            <p className="text-sm text-gray-600">New Baneshwor</p>
          </Card>
        </div>

        {/* Office Hours */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="text-[#6F4E37]" size={24} />
            <h3 className="text-xl font-black">Office Hours</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="font-black text-sm mb-1">Monday - Friday</p>
              <p className="text-sm text-gray-600">9:00 AM - 6:00 PM</p>
            </div>
            <div>
              <p className="font-black text-sm mb-1">Saturday</p>
              <p className="text-sm text-gray-600">10:00 AM - 4:00 PM</p>
            </div>
            <div>
              <p className="font-black text-sm mb-1">Sunday</p>
              <p className="text-sm text-gray-600">Closed</p>
            </div>
            <div>
              <p className="font-black text-sm mb-1">Emergency Support</p>
              <p className="text-sm text-gray-600">24/7 via email</p>
            </div>
          </div>
        </Card>

        {/* Contact Form */}
        <Card className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageCircle className="text-[#6F4E37]" size={28} />
            <h3 className="text-2xl font-black">Send us a Message</h3>
          </div>

          {submitSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h4 className="text-xl font-black text-green-700 mb-2">Message Sent!</h4>
              <p className="text-gray-600 mb-6">Thank you for contacting us. We will get back to you soon.</p>
              <Button 
                variant="outline" 
                onClick={() => setSubmitSuccess(false)}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <Input
                type="text"
                label="Your Name"
                placeholder="Ram Thapa"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                type="email"
                label="Email Address"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <Input
                type="tel"
                label="Phone Number"
                placeholder="+977 9800000000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                type="text"
                label="Subject"
                placeholder="How can we help?"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-600 mb-2 uppercase tracking-tight">
                Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us more about your inquiry..."
                className="w-full bg-white border border-[#EBE3D5] rounded-xl px-4 py-3 outline-none focus:ring-2 ring-[#6F4E37]/10 text-sm min-h-[150px]"
                required
              />
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
                'Sending...'
              ) : (
                <>
                  <Send size={18} /> Send Message
                </>
              )}
            </Button>
          </form>
          )}
        </Card>

        {/* Social Media / Quick Links */}
        <Card className="p-6 bg-gradient-to-br from-[#6F4E37] to-[#4E3626] text-white border-none">
          <h3 className="text-xl font-black mb-4">Connect With Us</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-white/80 mb-2">Follow us on social media for updates and news</p>
              <div className="flex gap-3">
                <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
                  <span className="text-xs font-black">FB</span>
                </button>
                <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
                  <span className="text-xs font-black">IG</span>
                </button>
                <button className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors">
                  <span className="text-xs font-black">TW</span>
                </button>
              </div>
            </div>
            <div>
              <p className="text-sm text-white/80 mb-2">Quick Links</p>
              <div className="space-y-1">
                <button 
                  onClick={() => setCurrentPage('faq')}
                  className="text-sm text-white/90 hover:text-white underline"
                >
                  FAQ
                </button>
                <span className="text-white/50 mx-2">•</span>
                <button 
                  onClick={() => setCurrentPage('privacy')}
                  className="text-sm text-white/90 hover:text-white underline"
                >
                  Privacy Policy
                </button>
                <span className="text-white/50 mx-2">•</span>
                <button 
                  onClick={() => setCurrentPage('terms')}
                  className="text-sm text-white/90 hover:text-white underline"
                >
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

