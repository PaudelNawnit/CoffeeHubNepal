import { ArrowRight, Users, TrendingUp, Shield, Store, Briefcase, CheckCircle, Coffee, Facebook, Instagram, Mail } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useCountUp } from '@/hooks/useCountUp';
import logoImage from '@/assets/images/logo/coffeelogo.webp';
import coffeeImage from '@/assets/images/coffee.webp';
import farmersHandshakeImage from '@/assets/images/landing/farmers-handshake.webp';

export const LandingPage = () => {
  const { navigate } = useApp();
  const { isAuthenticated } = useAuth();
  
  // Animated counters for stats
  const { count: usersCount } = useCountUp(500, { duration: 2000 });
  const { count: listingsCount } = useCountUp(1200, { duration: 2000 });
  const { count: farmsCount } = useCountUp(50, { duration: 2000 });

  const features = [
    {
      icon: Store,
      title: 'Marketplace',
      description: 'Buy and sell coffee directly with verified farmers and traders',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: TrendingUp,
      title: 'Live Prices',
      description: 'Real-time market prices and analytics for informed decisions',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Shield,
      title: 'Verified Farmers',
      description: 'Trusted verification system for farmers and traders',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      icon: Briefcase,
      title: 'Job Board',
      description: 'Find opportunities in Nepal\'s coffee industry',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      icon: Users,
      title: 'Networking',
      description: 'Connect with farmers, roasters, and exporters',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    }
  ];

  const benefits = [
    'Connect directly with coffee farmers and buyers',
    'Access real-time market prices and trends',
    'Get expert advice from certified agronomists',
    'Verify your identity and build trust',
    'Find job opportunities in the coffee sector',
    'Stay updated with government notices and schemes'
  ];

  return (
    <div className="min-h-screen bg-coffee-beige">
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/20 backdrop-blur-md border-b border-coffee-dark/20 shadow-sm px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 sm:gap-3"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md border border-coffee-dark/20 flex items-center justify-center overflow-hidden">
              <img 
                src={logoImage} 
                alt="CoffeeHubNepal Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-heading font-bold text-coffee-dark text-base sm:text-lg leading-none">CoffeeHubNepal</h1>
              <p className="text-[9px] font-body font-semibold text-[#3A7D44] uppercase tracking-widest">Nepal Platform</p>
            </div>
          </button>

          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <a href="#features" className="text-sm font-body font-medium text-coffee-dark hover:text-coffee-dark/80 transition-colors">Features</a>
            <a href="#benefits" className="text-sm font-body font-medium text-coffee-dark hover:text-coffee-dark/80 transition-colors">Benefits</a>
            <a href="#about" className="text-sm font-body font-medium text-coffee-dark hover:text-coffee-dark/80 transition-colors">About</a>
            <Button 
              variant="outline" 
              onClick={() => navigate('contact')}
              className="text-sm px-3"
            >
              Contact
            </Button>
            {isAuthenticated ? (
              <Button 
                variant="primary" 
                onClick={() => navigate('home')}
                className="text-sm px-4"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('login')}
                  className="text-sm px-3"
                >
                  Sign In
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => navigate('register')}
                  className="text-sm px-4"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {!isAuthenticated && (
              <Button 
                variant="outline" 
                onClick={() => navigate('login')}
                className="text-xs px-3 py-2"
              >
                Sign In
              </Button>
            )}
            {isAuthenticated ? (
              <Button 
                variant="primary" 
                onClick={() => navigate('home')}
                className="text-xs px-3 py-2"
              >
                Dashboard
              </Button>
            ) : (
              <Button 
                variant="primary" 
                onClick={() => navigate('register')}
                className="text-xs px-3 py-2"
              >
                Get Started
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-6 lg:pt-12 pb-8 lg:pb-16 px-4 lg:px-0">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <Badge variant="ai" className="mb-4 inline-block">
                <Coffee size={12} className="inline mr-1" /> Nepal's Coffee Community
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-heading font-bold text-coffee-dark mb-3 lg:mb-4 leading-tight">
                Connect, Trade, and Grow with{' '}
                <span className="text-[#3A7D44]">CoffeeHubNepal</span>
              </h1>
              <p className="text-base sm:text-lg lg:text-xl font-body text-coffee-dark/80 mb-4 lg:mb-6 leading-relaxed">
                Join Nepal's premier platform for coffee farmers, roasters, traders, and enthusiasts. 
                Access real-time prices, connect with buyers, share knowledge, and grow your coffee business.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {!isAuthenticated && (
                  <>
                    <Button 
                      variant="primary" 
                      className="text-base px-8 py-4"
                      onClick={() => navigate('register')}
                    >
                      Get Started Free
                      <ArrowRight size={20} className="ml-2" />
                    </Button>
                    <Button 
                      variant="outline" 
                      className="text-base px-8 py-4"
                      onClick={() => navigate('login')}
                    >
                      Sign In
                    </Button>
                  </>
                )}
                {isAuthenticated && (
                  <Button 
                    variant="primary" 
                    className="text-base px-8 py-4"
                    onClick={() => navigate('home')}
                  >
                    Go to Dashboard
                    <ArrowRight size={20} className="ml-2" />
                  </Button>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 lg:gap-6 mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-coffee-dark/20">
                <div>
                  <p className="text-2xl lg:text-3xl font-heading font-bold text-coffee-dark">
                    {usersCount.toLocaleString()}+
                  </p>
                  <p className="text-[10px] lg:text-xs font-body font-medium text-coffee-dark/70 uppercase mt-1">Active Users</p>
                </div>
                <div>
                  <p className="text-2xl lg:text-3xl font-heading font-bold text-coffee-dark">
                    {listingsCount.toLocaleString()}+
                  </p>
                  <p className="text-[10px] lg:text-xs font-body font-medium text-coffee-dark/70 uppercase mt-1">Listings</p>
                </div>
                <div>
                  <p className="text-2xl lg:text-3xl font-heading font-bold text-coffee-dark">
                    {farmsCount.toLocaleString()}+
                  </p>
                  <p className="text-[10px] lg:text-xs font-body font-medium text-coffee-dark/70 uppercase mt-1">Verified Farms</p>
                </div>
              </div>
            </div>

            {/* Hero Image/Illustration */}
            <div className="relative order-1 lg:order-2 mb-8 lg:mb-0">
              <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden">
                <img 
                  src={coffeeImage} 
                  alt="Coffee Bean" 
                  className="w-full h-auto object-contain coffee-float"
                />
                <style>{`
                  @keyframes float {
                    0%, 100% {
                      transform: translateY(0px) rotate(0deg);
                      opacity: 1;
                    }
                    25% {
                      transform: translateY(-8px) rotate(1deg);
                      opacity: 0.95;
                    }
                    50% {
                      transform: translateY(-15px) rotate(0deg);
                      opacity: 0.9;
                    }
                    75% {
                      transform: translateY(-8px) rotate(-1deg);
                      opacity: 0.95;
                    }
                  }
                  .coffee-float {
                    animation: float 4s ease-in-out infinite;
                  }
                `}</style>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-8 lg:py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-8 lg:mb-12">
            <Badge variant="primary" className="mb-4">Features</Badge>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-coffee-dark mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-sm sm:text-base font-body text-coffee-dark/70 max-w-2xl mx-auto px-4">
              Powerful tools and features designed for Nepal's coffee community
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:border-coffee-dark/40 transition-all group">
                <div className={`w-12 h-12 ${feature.bgColor} rounded-md border border-coffee-dark/10 flex items-center justify-center mb-4`}>
                  <feature.icon className={feature.color} size={24} />
                </div>
                <h3 className="text-xl font-heading font-semibold mb-2 text-coffee-dark">{feature.title}</h3>
                <p className="text-sm font-body text-coffee-dark/70">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-8 lg:py-16 bg-coffee-beige">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            <div>
              <Badge variant="success" className="mb-4">Why Choose Us</Badge>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-coffee-dark mb-3 lg:mb-4">
                Built for Nepal's Coffee Community
              </h2>
              <p className="text-sm sm:text-base font-body text-coffee-dark/80 mb-4 lg:mb-6 leading-relaxed">
                CoffeeHubNepal is designed specifically for the Nepali coffee industry, 
                understanding local needs, challenges, and opportunities.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="text-[#3A7D44] mt-0.5" size={20} />
                    <p className="text-coffee-dark/80 font-body font-medium">{benefit}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl border-2 border-coffee-dark/10">
              <img 
                src={farmersHandshakeImage} 
                alt="Coffee farmers connecting and trading" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 lg:py-16 bg-coffee-beige">
        <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-heading font-bold mb-3 lg:mb-4 text-coffee-dark">
            Ready to Grow Your Coffee Business?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl font-body text-coffee-dark/80 mb-4 lg:mb-6 max-w-2xl mx-auto px-4">
            Join hundreds of farmers, roasters, and traders already using CoffeeHubNepal 
            to connect, trade, and grow.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="primary" 
                className="bg-coffee-dark text-white hover:bg-coffee-dark/90 text-base px-8 py-4"
                onClick={() => navigate('register')}
              >
                Get Started Free
                <ArrowRight size={20} className="ml-2" />
              </Button>
              <Button 
                variant="outline" 
                className="border-coffee-dark text-coffee-dark hover:bg-coffee-dark/10 text-base px-8 py-4"
                onClick={() => navigate('login')}
              >
                Sign In
              </Button>
            </div>
          )}
          {isAuthenticated && (
            <Button 
              variant="primary" 
              className="bg-coffee-dark text-white hover:bg-coffee-dark/90 text-base px-8 py-4"
              onClick={() => navigate('home')}
            >
              Go to Dashboard
              <ArrowRight size={20} className="ml-2" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-coffee-beige/50 py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-4 lg:mb-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-md border border-coffee-dark/20 flex items-center justify-center overflow-hidden bg-coffee-beige/20 p-1">
                  <img 
                    src={logoImage} 
                    alt="CoffeeHubNepal Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-coffee-dark text-sm">CoffeeHubNepal</h3>
                </div>
              </div>
              <p className="text-xs font-body text-coffee-dark/70 mb-4">
                Nepal's premier platform for coffee farmers, roasters, and traders.
              </p>
              <div className="flex items-center gap-3 mb-3">
                <a 
                  href="https://www.facebook.com/share/1DMMTypgRK/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-coffee-dark/10 rounded-lg flex items-center justify-center hover:bg-[#1877F2] hover:text-white text-coffee-dark/70 transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
                <a 
                  href="https://www.instagram.com/coffeehubnepal" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-coffee-dark/10 rounded-lg flex items-center justify-center hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] hover:text-white text-coffee-dark/70 transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
                <a 
                  href="https://www.tiktok.com/@coffeehubnepal" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-coffee-dark/10 rounded-lg flex items-center justify-center hover:bg-black hover:text-white text-coffee-dark/70 transition-colors"
                  aria-label="TikTok"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              </div>
              <a 
                href="mailto:coffeehubnepal@gmail.com" 
                className="flex items-center gap-2 text-xs font-body text-coffee-dark/70 hover:text-coffee-dark transition-colors"
              >
                <Mail size={14} />
                coffeehubnepal@gmail.com
              </a>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm mb-4 text-coffee-dark">Platform</h4>
              <ul className="space-y-2 text-xs font-body text-coffee-dark/70">
                <li><button onClick={() => navigate('market')} className="hover:text-coffee-dark transition-colors">Marketplace</button></li>
                <li><button onClick={() => navigate('blog')} className="hover:text-coffee-dark transition-colors">Blog</button></li>
                <li><button onClick={() => navigate('jobs')} className="hover:text-coffee-dark transition-colors">Job Board</button></li>
                <li><button onClick={() => navigate('prices')} className="hover:text-coffee-dark transition-colors">Price Board</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm mb-4 text-coffee-dark">Company</h4>
              <ul className="space-y-2 text-xs font-body text-coffee-dark/70">
                <li><button onClick={() => navigate('about')} className="hover:text-coffee-dark transition-colors">About Us</button></li>
                <li><button onClick={() => navigate('contact')} className="hover:text-coffee-dark transition-colors">Contact</button></li>
                <li><button onClick={() => navigate('faq')} className="hover:text-coffee-dark transition-colors">FAQ</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold text-sm mb-4 text-coffee-dark">Legal</h4>
              <ul className="space-y-2 text-xs font-body text-coffee-dark/70">
                <li><button onClick={() => navigate('privacy')} className="hover:text-coffee-dark transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => navigate('terms')} className="hover:text-coffee-dark transition-colors">Terms of Service</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t-2 border-coffee-beige/60 text-center">
            <p className="text-xs font-body text-coffee-dark/60">
              © {new Date().getFullYear()} CoffeeHubNepal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

