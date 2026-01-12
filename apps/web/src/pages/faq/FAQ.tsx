import { ArrowLeft, HelpCircle, ChevronDown } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

const FAQ_CATEGORIES = [
  {
    title: 'Getting Started',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Click on the Register button in the app, fill in your details including name, email, phone number, and location. You\'ll receive a verification email to activate your account.'
      },
      {
        q: 'How do I verify as a farmer?',
        a: 'Go to Profile → Farmer Verification and submit your documents including land ownership certificate, national ID, and photos of your coffee farm. Our team will review and verify within 3-5 business days.'
      },
      {
        q: 'Is the platform free to use?',
        a: 'Yes! CoffeeHubNepal is completely free for farmers. There are no subscription fees or hidden charges. We only charge a small commission on successful marketplace transactions.'
      }
    ]
  },
  {
    title: 'Marketplace',
    questions: [
      {
        q: 'How do I list my coffee for sale?',
        a: 'Click the "+" button in the bottom navigation, select "Sell Harvest", fill in the details including variety, quantity, price, and upload photos. Your listing will be visible to buyers immediately.'
      },
      {
        q: 'How are payments processed?',
        a: 'Currently, payments are handled directly between buyer and seller. We recommend using secure payment methods and meeting in person for verification. We\'re working on integrated payment solutions.'
      },
      {
        q: 'Can I edit or delete my listing?',
        a: 'Yes! Go to Profile → My Listings, find your listing, and click Edit or Delete. You can update prices, quantities, or remove listings that are no longer available.'
      },
      {
        q: 'What if I have a dispute with a buyer?',
        a: 'Contact our support team immediately. We have a dispute resolution process and can mediate between parties. Always document your transactions and communications.'
      }
    ]
  },
  {
    title: 'Price Board & Analytics',
    questions: [
      {
        q: 'How are prices determined?',
        a: 'Prices are based on real-time market data from various cooperatives, exporters, and trading platforms across Nepal. We aggregate this data to provide accurate market rates.'
      },
      {
        q: 'How often are prices updated?',
        a: 'Prices are updated daily during market hours. Historical data and trends are available in the Analytics section to help you make informed decisions.'
      },
      {
        q: 'Can I see price trends?',
        a: 'Yes! The Price Board shows daily changes and trends. You can view historical data and price charts to understand market patterns over time.'
      }
    ]
  },
  {
    title: 'Community & Q&A',
    questions: [
      {
        q: 'How do I ask a question?',
        a: 'Click the "+" button and select "Write Blog" to share your knowledge and experiences with the community. You can also browse existing blog posts to learn from others.'
      },
      {
        q: 'Can I use AI to get instant answers?',
        a: 'Yes! Our AI Agronomist feature provides instant answers to common questions about coffee farming, diseases, soil management, and more. Look for the sparkle icon on questions.'
      },
      {
        q: 'How do I become a verified expert?',
        a: 'Go to Profile → Expert Certifications and submit your credentials, certifications, or proof of expertise. Our team reviews applications and grants expert status to qualified members.'
      }
    ]
  },
  {
    title: 'Jobs & Opportunities',
    questions: [
      {
        q: 'How do I post a job?',
        a: 'Click the "+" button, select "Post Job", fill in job details including title, description, location, pay, and requirements. Your job posting will be visible to all users.'
      },
      {
        q: 'How do I apply for a job?',
        a: 'Browse the Job Board, click on a job that interests you, and click "Apply Now". You can contact the employer directly through the provided contact information.'
      },
      {
        q: 'Are job postings verified?',
        a: 'We verify all job postings from registered businesses and cooperatives. Always verify job details directly with the employer before making any commitments.'
      }
    ]
  },
  {
    title: 'Account & Settings',
    questions: [
      {
        q: 'How do I change my profile information?',
        a: 'Go to Profile → App Settings → Profile Information. You can update your name, email, phone number, and location at any time.'
      },
      {
        q: 'How do I change my password?',
        a: 'Go to Profile → App Settings → Privacy & Security → Change Password. You\'ll need to enter your current password and set a new one.'
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes, but this action is permanent. Go to Profile → App Settings → Danger Zone → Delete Account. All your data, listings, and posts will be permanently removed.'
      },
      {
        q: 'How do I manage notifications?',
        a: 'Go to Profile → App Settings → Notifications. You can toggle push notifications, email alerts, and customize which types of notifications you receive.'
      }
    ]
  }
];

export const FAQ = () => {
  const { setCurrentPage, setSubPage, navigate } = useApp();
  const { isAuthenticated } = useAuth();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleBack = () => {
    if (isAuthenticated) {
      setCurrentPage('home');
    } else {
      setSubPage(null);
    }
  };

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32 lg:pb-8">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 lg:px-8 py-4 flex items-center gap-4">
        <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37] flex-1">Frequently Asked Questions</h2>
      </div>

      <div className="p-6 lg:p-8 lg:max-w-4xl lg:mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="text-blue-600" size={32} />
          </div>
          <h1 className="text-3xl font-black mb-2">How can we help you?</h1>
          <p className="text-gray-600">Find answers to common questions about CoffeeHubNepal</p>
        </div>

        {/* FAQ Categories */}
        {FAQ_CATEGORIES.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="p-6">
            <h3 className="text-xl font-black mb-4 text-[#6F4E37]">{category.title}</h3>
            <div className="space-y-3">
              {category.questions.map((faq, questionIndex) => {
                const globalIndex = FAQ_CATEGORIES.slice(0, categoryIndex)
                  .reduce((acc, cat) => acc + cat.questions.length, 0) + questionIndex;
                const isOpen = openIndex === globalIndex;

                return (
                  <div key={questionIndex} className="border border-[#EBE3D5] rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleQuestion(globalIndex)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-black text-sm flex-1 pr-4">{faq.q}</span>
                      <ChevronDown
                        className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        size={20}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-2 border-t border-[#EBE3D5] bg-gray-50">
                        <p className="text-sm text-gray-700 leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))}

        {/* Still have questions */}
        <Card className="p-6 bg-gradient-to-br from-[#6F4E37] to-[#4E3626] text-white border-none">
          <h3 className="text-xl font-black mb-2">Still have questions?</h3>
          <p className="text-white/80 mb-4 text-sm">
            Can't find the answer you're looking for? Please reach out to our friendly support team.
          </p>
          <button
            onClick={() => navigate('contact')}
            className="px-6 py-3 bg-white text-[#6F4E37] rounded-xl font-black text-sm hover:bg-gray-100 transition-colors"
          >
            Contact Support
          </button>
        </Card>
      </div>
    </div>
  );
};

