import { ArrowLeft, HelpCircle, ChevronDown } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/i18n';
import { useState } from 'react';

// Question keys for each category
const FAQ_STRUCTURE = [
  {
    categoryKey: 'gettingStarted',
    questionKeys: ['createAccount', 'verifyFarmer', 'isFree']
  },
  {
    categoryKey: 'marketplace',
    questionKeys: ['listCoffee', 'payments', 'editListing', 'dispute']
  },
  {
    categoryKey: 'priceBoard',
    questionKeys: ['pricesDetermined', 'pricesUpdated', 'priceTrends']
  },
  {
    categoryKey: 'community',
    questionKeys: ['askQuestion', 'useAI', 'becomeExpert']
  },
  {
    categoryKey: 'jobs',
    questionKeys: ['postJob', 'applyJob', 'jobsVerified']
  },
  {
    categoryKey: 'account',
    questionKeys: ['changeProfile', 'changePassword', 'deleteAccount', 'manageNotifications']
  }
];

export const FAQ = () => {
  const { setCurrentPage, setSubPage, navigate, language } = useApp();
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
        <h2 className="text-lg font-black text-[#6F4E37] flex-1">{t(language, 'faq.title')}</h2>
      </div>

      <div className="p-6 lg:p-8 lg:max-w-4xl lg:mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="text-blue-600" size={32} />
          </div>
          <h1 className="text-3xl font-black mb-2">{t(language, 'faq.headerTitle')}</h1>
          <p className="text-gray-600">{t(language, 'faq.headerSubtitle')}</p>
        </div>

        {/* FAQ Categories */}
        {FAQ_STRUCTURE.map((category, categoryIndex) => (
          <Card key={categoryIndex} className="p-6">
            <h3 className="text-xl font-black mb-4 text-[#6F4E37]">
              {t(language, `faq.categories.${category.categoryKey}`)}
            </h3>
            <div className="space-y-3">
              {category.questionKeys.map((questionKey, questionIndex) => {
                const globalIndex = FAQ_STRUCTURE.slice(0, categoryIndex)
                  .reduce((acc, cat) => acc + cat.questionKeys.length, 0) + questionIndex;
                const isOpen = openIndex === globalIndex;

                return (
                  <div key={questionIndex} className="border border-[#EBE3D5] rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleQuestion(globalIndex)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-black text-sm flex-1 pr-4">
                        {t(language, `faq.questions.${questionKey}.q`)}
                      </span>
                      <ChevronDown
                        className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        size={20}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-2 border-t border-[#EBE3D5] bg-gray-50">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {t(language, `faq.questions.${questionKey}.a`)}
                        </p>
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
          <h3 className="text-xl font-black mb-2">{t(language, 'faq.stillHaveQuestions')}</h3>
          <p className="text-white/80 mb-4 text-sm">
            {t(language, 'faq.stillHaveQuestionsText')}
          </p>
          <button
            onClick={() => navigate('contact')}
            className="px-6 py-3 bg-white text-[#6F4E37] rounded-xl font-black text-sm hover:bg-gray-100 transition-colors"
          >
            {t(language, 'faq.contactSupport')}
          </button>
        </Card>
      </div>
    </div>
  );
};

