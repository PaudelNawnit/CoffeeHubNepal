import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

export const PrivacyPolicy = () => {
  const { setCurrentPage, setSubPage, navigate } = useApp();
  const { isAuthenticated } = useAuth();

  const handleBack = () => {
    if (isAuthenticated) {
      setCurrentPage('home');
    } else {
      setSubPage(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32 lg:pb-8">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 lg:px-8 py-4 flex items-center gap-4">
        <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37] flex-1">Privacy Policy</h2>
      </div>

      <div className="p-6 lg:p-8 lg:max-w-4xl lg:mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="text-green-600" size={32} />
          </div>
          <h1 className="text-3xl font-black mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: January 2024</p>
        </div>

        {/* Introduction */}
        <Card className="p-6">
          <p className="text-gray-700 leading-relaxed">
            At CoffeeHubNepal, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
        </Card>

        {/* Information We Collect */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="text-[#6F4E37]" size={24} />
            <h3 className="text-xl font-black">1. Information We Collect</h3>
          </div>
          <div className="space-y-4 text-gray-700">
            <div>
              <h4 className="font-black mb-2">Personal Information</h4>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Name, email address, phone number</li>
                <li>Location and address information</li>
                <li>Profile photo and verification documents</li>
                <li>Payment and transaction information</li>
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-2">Usage Information</h4>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Device information and IP address</li>
                <li>Browser type and version</li>
                <li>Pages visited and features used</li>
                <li>Search queries and interactions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-2">Content Information</h4>
              <ul className="list-disc list-inside space-y-1 text-sm ml-4">
                <li>Listings, posts, questions, and answers</li>
                <li>Messages and communications</li>
                <li>Photos and documents you upload</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* How We Use Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="text-[#6F4E37]" size={24} />
            <h3 className="text-xl font-black">2. How We Use Your Information</h3>
          </div>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>We use your information to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and facilitate marketplace interactions</li>
              <li>Verify user identities and prevent fraud</li>
              <li>Send you important updates, notifications, and marketing communications</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Comply with legal obligations and enforce our terms</li>
            </ul>
          </div>
        </Card>

        {/* Information Sharing */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="text-[#6F4E37]" size={24} />
            <h3 className="text-xl font-black">3. Information Sharing and Disclosure</h3>
          </div>
          <div className="space-y-4 text-gray-700 text-sm">
            <p>We do not sell your personal information. We may share your information only in the following circumstances:</p>
            <div>
              <h4 className="font-black mb-2">With Other Users</h4>
              <p className="mb-2">Your profile information, listings, and public posts are visible to other users on the platform.</p>
            </div>
            <div>
              <h4 className="font-black mb-2">Service Providers</h4>
              <p className="mb-2">We may share information with trusted third-party service providers who assist in operating our platform.</p>
            </div>
            <div>
              <h4 className="font-black mb-2">Legal Requirements</h4>
              <p className="mb-2">We may disclose information if required by law or to protect our rights and safety.</p>
            </div>
            <div>
              <h4 className="font-black mb-2">Business Transfers</h4>
              <p className="mb-2">In the event of a merger or acquisition, your information may be transferred to the new entity.</p>
            </div>
          </div>
        </Card>

        {/* Data Security */}
        <Card className="p-6">
          <h3 className="text-xl font-black mb-4">4. Data Security</h3>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>
              We implement industry-standard security measures to protect your information, including encryption, secure servers, 
              and access controls. However, no method of transmission over the internet is 100% secure, and we cannot guarantee 
              absolute security.
            </p>
            <p>
              We recommend using strong passwords, enabling two-factor authentication, and being cautious about sharing personal 
              information in public posts.
            </p>
          </div>
        </Card>

        {/* Your Rights */}
        <Card className="p-6">
          <h3 className="text-xl font-black mb-4">5. Your Rights and Choices</h3>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Access and review your personal information</li>
              <li>Update or correct your information through your profile settings</li>
              <li>Delete your account and request data deletion</li>
              <li>Opt-out of marketing communications</li>
              <li>Request a copy of your data</li>
              <li>Object to certain data processing activities</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us through the Contact Us page or email us at privacy@coffeehubnepal.com
            </p>
          </div>
        </Card>

        {/* Cookies */}
        <Card className="p-6">
          <h3 className="text-xl font-black mb-4">6. Cookies and Tracking</h3>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>
              We use cookies and similar tracking technologies to enhance your experience, analyze usage, and personalize content. 
              You can control cookie preferences through your browser settings.
            </p>
          </div>
        </Card>

        {/* Children's Privacy */}
        <Card className="p-6">
          <h3 className="text-xl font-black mb-4">7. Children's Privacy</h3>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>
              Our platform is not intended for users under the age of 18. We do not knowingly collect personal information from 
              children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </div>
        </Card>

        {/* Changes to Policy */}
        <Card className="p-6">
          <h3 className="text-xl font-black mb-4">8. Changes to This Policy</h3>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the 
              new policy on this page and updating the "Last updated" date. Your continued use of the platform after changes 
              constitutes acceptance of the updated policy.
            </p>
          </div>
        </Card>

        {/* Contact */}
        <Card className="p-6 bg-gradient-to-br from-[#6F4E37] to-[#4E3626] text-white border-none">
          <h3 className="text-xl font-black mb-2">Questions About Privacy?</h3>
          <p className="text-white/80 mb-4 text-sm">
            If you have any questions or concerns about this Privacy Policy, please contact us.
          </p>
          <button
            onClick={() => navigate('contact')}
            className="px-6 py-3 bg-white text-[#6F4E37] rounded-xl font-black text-sm hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </button>
        </Card>
      </div>
    </div>
  );
};

