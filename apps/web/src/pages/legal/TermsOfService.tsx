import { ArrowLeft, Scale, FileCheck, AlertTriangle, Gavel } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';

export const TermsOfService = () => {
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
        <h2 className="text-lg font-black text-[#6F4E37] flex-1">Terms of Service</h2>
      </div>

      <div className="p-6 lg:p-8 lg:max-w-4xl lg:mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Scale className="text-amber-600" size={32} />
          </div>
          <h1 className="text-3xl font-black mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: January 2024</p>
        </div>

        {/* Introduction */}
        <Card className="p-6">
          <p className="text-gray-700 leading-relaxed">
            Welcome to CoffeeHubNepal. These Terms of Service ("Terms") govern your access to and use of our platform, 
            services, and applications. By using CoffeeHubNepal, you agree to be bound by these Terms.
          </p>
        </Card>

        {/* Acceptance */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileCheck className="text-[#6F4E37]" size={24} />
            <h3 className="text-xl font-black">1. Acceptance of Terms</h3>
          </div>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>
              By creating an account, accessing, or using CoffeeHubNepal, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms and our Privacy Policy. If you do not agree, you may not use our services.
            </p>
            <p>
              You must be at least 18 years old to use this platform. By using our services, you represent that you meet 
              this age requirement.
            </p>
          </div>
        </Card>

        {/* Account Registration */}
        <Card className="p-6">
          <h3 className="text-xl font-black mb-4">2. Account Registration</h3>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>To use certain features, you must register for an account. You agree to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information as necessary</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized access</li>
            </ul>
            <p className="mt-4">
              We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.
            </p>
          </div>
        </Card>

        {/* User Conduct */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-[#6F4E37]" size={24} />
            <h3 className="text-xl font-black">3. User Conduct and Responsibilities</h3>
          </div>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Post false, misleading, or fraudulent information</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Spam, solicit, or send unsolicited communications</li>
              <li>Interfere with platform operations or security</li>
              <li>Use automated systems to access the platform</li>
              <li>Impersonate others or misrepresent your identity</li>
            </ul>
            <p className="mt-4">
              You are responsible for all content you post, including listings, questions, answers, and messages. 
              You grant us a license to use, display, and distribute your content on the platform.
            </p>
          </div>
        </Card>

        {/* Marketplace */}
        <Card className="p-6">
          <h3 className="text-xl font-black mb-4">4. Marketplace and Transactions</h3>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>
              CoffeeHubNepal provides a platform for users to buy and sell coffee products. We are not a party to transactions 
              between users. You acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>All transactions are between buyers and sellers directly</li>
              <li>We do not guarantee product quality, accuracy of listings, or seller reliability</li>
              <li>You are responsible for verifying product quality and seller credentials</li>
              <li>Disputes should be resolved directly between parties</li>
              <li>We may charge transaction fees as disclosed at the time of listing</li>
            </ul>
            <p className="mt-4">
              We recommend meeting in person for verification, using secure payment methods, and documenting all transactions.
            </p>
          </div>
        </Card>

        {/* Intellectual Property */}
        <Card className="p-6">
          <h3 className="text-xl font-black mb-4">5. Intellectual Property</h3>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>
              The CoffeeHubNepal platform, including its design, features, and content, is owned by us and protected by 
              intellectual property laws. You may not:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Copy, modify, or create derivative works</li>
              <li>Reverse engineer or attempt to extract source code</li>
              <li>Use our trademarks or logos without permission</li>
              <li>Remove copyright or proprietary notices</li>
            </ul>
            <p className="mt-4">
              You retain ownership of content you post but grant us a worldwide, non-exclusive license to use, display, 
              and distribute it on the platform.
            </p>
          </div>
        </Card>

        {/* Disclaimers */}
        <Card className="p-6">
          <h3 className="text-xl font-black mb-4">6. Disclaimers</h3>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>
              CoffeeHubNepal is provided "as is" and "as available" without warranties of any kind. We do not guarantee:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Uninterrupted or error-free service</li>
              <li>Accuracy of user-generated content</li>
              <li>Quality of products listed on the marketplace</li>
              <li>Reliability of other users</li>
              <li>Results from using our services</li>
            </ul>
            <p className="mt-4">
              You use the platform at your own risk. We are not liable for any losses or damages resulting from your use 
              of the platform or transactions with other users.
            </p>
          </div>
        </Card>

        {/* Limitation of Liability */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gavel className="text-[#6F4E37]" size={24} />
            <h3 className="text-xl font-black">7. Limitation of Liability</h3>
          </div>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>
              To the maximum extent permitted by law, CoffeeHubNepal and its affiliates shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, including loss of profits, data, or use, arising from 
              your use of the platform.
            </p>
            <p>
              Our total liability for any claims shall not exceed the amount you paid us in the 12 months preceding the claim, 
              or $100, whichever is greater.
            </p>
          </div>
        </Card>

        {/* Indemnification */}
        <Card className="p-6">
          <h3 className="text-xl font-black mb-4">8. Indemnification</h3>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>
              You agree to indemnify and hold CoffeeHubNepal harmless from any claims, damages, losses, liabilities, and expenses 
              (including legal fees) arising from:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Your use of the platform</li>
              <li>Your violation of these Terms</li>
              <li>Your violation of any rights of others</li>
              <li>Content you post or transmit</li>
            </ul>
          </div>
        </Card>

        {/* Termination */}
        <Card className="p-6">
          <h3 className="text-xl font-black mb-4">9. Termination</h3>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>
              We may suspend or terminate your account at any time, with or without notice, for violation of these Terms or 
              any other reason we deem necessary.
            </p>
            <p>
              You may terminate your account at any time through your profile settings. Upon termination, your right to use 
              the platform immediately ceases, and we may delete your account and data.
            </p>
          </div>
        </Card>

        {/* Changes to Terms */}
        <Card className="p-6">
          <h3 className="text-xl font-black mb-4">10. Changes to Terms</h3>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of significant changes by posting 
              the updated Terms on this page and updating the "Last updated" date.
            </p>
            <p>
              Your continued use of the platform after changes constitutes acceptance of the updated Terms. If you do not agree 
              to the changes, you must stop using the platform.
            </p>
          </div>
        </Card>

        {/* Governing Law */}
        <Card className="p-6">
          <h3 className="text-xl font-black mb-4">11. Governing Law</h3>
          <div className="space-y-3 text-gray-700 text-sm">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Nepal. Any disputes arising from 
              these Terms or your use of the platform shall be subject to the exclusive jurisdiction of the courts of Nepal.
            </p>
          </div>
        </Card>

        {/* Contact */}
        <Card className="p-6 bg-gradient-to-br from-[#6F4E37] to-[#4E3626] text-white border-none">
          <h3 className="text-xl font-black mb-2">Questions About Terms?</h3>
          <p className="text-white/80 mb-4 text-sm">
            If you have any questions about these Terms of Service, please contact us.
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

