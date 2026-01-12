import { ArrowLeft, Users, Target, Heart, Award, Coffee } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { t } from '@/i18n';
import logoImage from '@/assets/images/logo/coffeelogo.png';
import surajNepalImage from '@/assets/images/team/SurajNepal.png';
import SarthakBhattaraiImage from '@/assets/images/team/SarthakBhattarai.png';
import SiddhantGiriImage from '@/assets/images/team/SiddhantGiri.jpeg';
import KrrishNyopaneImage from '@/assets/images/team/KrrishNyoupane.png';
import SachinJhaImage from '@/assets/images/team/SachinJha.png';
import MukeshPandeyImage from '@/assets/images/team/MukeshPandey.png';
import NawnitPoudelImage from '@/assets/images/team/NawnitPaudel.png';
import SupriyaKhadkaImage from '@/assets/images/team/SupriyaKhadka.png';
import RajdipJoshiImage from '@/assets/images/team/RajdipJoshi.png';
import AasthaGaireImage from '@/assets/images/team/AasthaGaire.png';
import PradipKhanalImage from '@/assets/images/team/PradipKhanal.png';
import AdityaManShresthaImage from '@/assets/images/team/AdityaManShrestha.png';

const TEAM_MEMBERS = [
  { name: "Suraj Nepal", role: "Backend Developer", image: surajNepalImage },
  { name: "Sarthak Bhattarai", role: "Social Media Manager", image: SarthakBhattaraiImage },
  { name: "Siddhant Giri", role: "Frontend Developer", image: SiddhantGiriImage },
  { name: "Krrish Nyopane", role: "UI/UX Designer", image: KrrishNyopaneImage },
  { name: "Sachin Jha", role: "Graphic Designer", image: SachinJhaImage },
  { name: "Mukesh Pandey", role: "Graphic Designer", image: MukeshPandeyImage },
  { name: "Nawnit Paudel", role: "Security Expert", image: NawnitPoudelImage },
  { name: "Supriya Khadka", role: "App Developer", image: SupriyaKhadkaImage },
  { name: "Rajdip Joshi", role: "App Developer", image: RajdipJoshiImage },
  { name: "Aastha Gaire", role: "Frontend Developer", image: AasthaGaireImage },
  { name: "Pradip Khanal", role: "Researcher", image: PradipKhanalImage },
  { name: "Aditya Man Shrestha", role: "Content Writer", image: AdityaManShresthaImage }

  
];

export const AboutUs = () => {
  const { setCurrentPage, setSubPage, language } = useApp();
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
        <h2 className="text-lg font-black text-[#6F4E37] flex-1">{t(language, 'about.title')}</h2>
      </div>

      <div className="p-6 lg:p-8 lg:max-w-5xl lg:mx-auto space-y-8">
        {/* Hero Section */}
        <Card className="p-8 lg:p-12 bg-gradient-to-br from-[#6F4E37] to-[#4E3626] text-white border-none">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-32 h-32 rounded-3xl bg-white/10 backdrop-blur-sm p-4 flex items-center justify-center border-4 border-white/20">
              <img src={logoImage} alt="CoffeeHubNepal Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl font-black mb-4">CoffeeHubNepal</h1>
              <p className="text-lg text-white/90 leading-relaxed">
                {t(language, 'about.tagline')}
              </p>
            </div>
          </div>
        </Card>

        {/* Mission & Vision */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Target className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-black">{t(language, 'about.missionTitle')}</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {t(language, 'about.missionText')}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                <Heart className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-black">{t(language, 'about.visionTitle')}</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {t(language, 'about.visionText')}
            </p>
          </Card>
        </div>

        {/* What We Do */}
        <Card className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Coffee className="text-[#6F4E37]" size={28} />
            <h3 className="text-2xl font-black">{t(language, 'about.whatWeDoTitle')}</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#6F4E37] rounded-full mt-2"></div>
              <p className="text-gray-700">{t(language, 'about.whatWeDo1')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#6F4E37] rounded-full mt-2"></div>
              <p className="text-gray-700">{t(language, 'about.whatWeDo2')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#6F4E37] rounded-full mt-2"></div>
              <p className="text-gray-700">{t(language, 'about.whatWeDo3')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#6F4E37] rounded-full mt-2"></div>
              <p className="text-gray-700">{t(language, 'about.whatWeDo4')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#6F4E37] rounded-full mt-2"></div>
              <p className="text-gray-700">{t(language, 'about.whatWeDo5')}</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#6F4E37] rounded-full mt-2"></div>
              <p className="text-gray-700">{t(language, 'about.whatWeDo6')}</p>
            </div>
          </div>
        </Card>

        {/* Team Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-[#6F4E37]" size={28} />
            <h3 className="text-2xl font-black">{t(language, 'about.teamTitle')}</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {TEAM_MEMBERS.map((member, idx) => (
              <Card key={idx} className="p-4 lg:p-5 text-center group hover:shadow-lg transition-all">
                <div className="w-20 h-20 lg:w-24 lg:h-24 mx-auto mb-3 rounded-full overflow-hidden border-2 border-[#EBE3D5] group-hover:border-[#6F4E37] transition-colors">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-black text-sm lg:text-base mb-1">{member.name}</h4>
                <p className="text-xs lg:text-sm text-gray-600">{member.role}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Values */}
        <Card className="p-6 lg:p-8 bg-gradient-to-br from-[#F5EFE6] to-white">
          <div className="flex items-center gap-3 mb-6">
            <Award className="text-[#6F4E37]" size={28} />
            <h3 className="text-2xl font-black">{t(language, 'about.valuesTitle')}</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-black text-lg mb-2">{t(language, 'about.transparencyTitle')}</h4>
              <p className="text-sm text-gray-600">{t(language, 'about.transparencyText')}</p>
            </div>
            <div>
              <h4 className="font-black text-lg mb-2">{t(language, 'about.communityFirstTitle')}</h4>
              <p className="text-sm text-gray-600">{t(language, 'about.communityFirstText')}</p>
            </div>
            <div>
              <h4 className="font-black text-lg mb-2">{t(language, 'about.innovationTitle')}</h4>
              <p className="text-sm text-gray-600">{t(language, 'about.innovationText')}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};