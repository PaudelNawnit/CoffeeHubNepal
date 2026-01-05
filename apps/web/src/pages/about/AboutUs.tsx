import { ArrowLeft, Users, Target, Heart, Award, Coffee } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { useApp } from '@/context/AppContext';
import logoImage from '@/assets/images/logo.png';

const TEAM_MEMBERS = [
  { name: "Suraj Nepal", role: "Team Member", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=SurajNepal" },
  { name: "Sarthak Bhattarai", role: "Strategist", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=SarthakBhattarai" },
  { name: "Siddhant Giri", role: "Front End Developer", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=SiddhantGiri" },
  { name: "Krrish Nyopane", role: "UI/UX Designer", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=KrrishNyopane" },
  { name: "Sachin Jha", role: "Graphic Designer", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=SachinJha" },
  { name: "Mukesh Pandey", role: "Graphic Designer", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=MukeshPandey" },
  { name: "Nawnit Poudel", role: "Tester", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=NawnitPoudel" },
  { name: "Supriya Khadka", role: "App Developer", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=SupriyaKhadka" },
  { name: "Rajdip Joshi", role: "App Developer", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=RajdipJoshi" },
  { name: "Aastha Gaire", role: "Backend Developer", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=AasthaGaire" },
  { name: "Pradip Khanal", role: "Researcher", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=PradipKhanal" }
];

export const AboutUs = () => {
  const { setCurrentPage } = useApp();

  return (
    <div className="min-h-screen bg-[#F8F5F2] pb-32 lg:pb-8">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#EBE3D5] px-6 lg:px-8 py-4 flex items-center gap-4">
        <button onClick={() => setCurrentPage('home')} className="p-2 hover:bg-gray-100 rounded-xl">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-black text-[#6F4E37] flex-1">About Us</h2>
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
                Empowering Nepal's coffee community through technology, knowledge sharing, and trusted connections.
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
              <h3 className="text-xl font-black">Our Mission</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To create a unified platform that connects coffee farmers, roasters, traders, and enthusiasts across Nepal, 
              fostering knowledge exchange, fair trade, and sustainable growth in the coffee industry.
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                <Heart className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-black">Our Vision</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              To become Nepal's leading digital ecosystem for coffee, where every farmer has access to markets, 
              knowledge, and opportunities to thrive in the global coffee industry.
            </p>
          </Card>
        </div>

        {/* What We Do */}
        <Card className="p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Coffee className="text-[#6F4E37]" size={28} />
            <h3 className="text-2xl font-black">What We Do</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#6F4E37] rounded-full mt-2"></div>
              <p className="text-gray-700">Connect farmers with buyers and exporters</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#6F4E37] rounded-full mt-2"></div>
              <p className="text-gray-700">Provide real-time market prices and trends</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#6F4E37] rounded-full mt-2"></div>
              <p className="text-gray-700">Facilitate knowledge sharing through Q&A forums</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#6F4E37] rounded-full mt-2"></div>
              <p className="text-gray-700">Verify farmers to build trust in the community</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#6F4E37] rounded-full mt-2"></div>
              <p className="text-gray-700">Share government notices and opportunities</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-[#6F4E37] rounded-full mt-2"></div>
              <p className="text-gray-700">Create job opportunities in the coffee sector</p>
            </div>
          </div>
        </Card>

        {/* Team Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <Users className="text-[#6F4E37]" size={28} />
            <h3 className="text-2xl font-black">Our Team</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {TEAM_MEMBERS.map((member, idx) => (
              <Card key={idx} className="p-4 text-center group hover:shadow-lg transition-all">
                <div className="w-20 h-20 mx-auto mb-3 rounded-2xl overflow-hidden border-2 border-[#EBE3D5] group-hover:border-[#6F4E37] transition-colors">
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="font-black text-sm mb-1">{member.name}</h4>
                <p className="text-xs text-gray-600">{member.role}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Values */}
        <Card className="p-6 lg:p-8 bg-gradient-to-br from-[#F5EFE6] to-white">
          <div className="flex items-center gap-3 mb-6">
            <Award className="text-[#6F4E37]" size={28} />
            <h3 className="text-2xl font-black">Our Values</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-black text-lg mb-2">Transparency</h4>
              <p className="text-sm text-gray-600">Open and honest communication in all our dealings</p>
            </div>
            <div>
              <h4 className="font-black text-lg mb-2">Community First</h4>
              <p className="text-sm text-gray-600">Putting the needs of our coffee community at the center</p>
            </div>
            <div>
              <h4 className="font-black text-lg mb-2">Innovation</h4>
              <p className="text-sm text-gray-600">Using technology to solve real-world problems</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

