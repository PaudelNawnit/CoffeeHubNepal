import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { t } from './i18n';
import { Header } from './components/layout/Header';
import { DesktopHeader } from './components/layout/DesktopHeader';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { CreateMenu } from './components/common/CreateMenu';
import { useMediaQuery } from './hooks/useMediaQuery';
import { Home } from './pages/home/Home';
import { Marketplace } from './pages/marketplace/Marketplace';
import { Jobs } from './pages/jobs/Jobs';
import { Profile } from './pages/profile/Profile';
import { Notices } from './pages/notices/Notices';
import { BlogList } from './pages/blog/BlogList';
import { BlogDetail } from './pages/blog/BlogDetail';
import { CreateBlog } from './pages/blog/CreateBlog';
import { EditBlog } from './pages/blog/EditBlog';
import { CreateListing } from './pages/marketplace/CreateListing';
import { NoticeDetail } from './pages/notices/NoticeDetail';
import { CreateNotice } from './pages/notices/CreateNotice';
import { JobDetail } from './pages/jobs/JobDetail';
import { CreateJob } from './pages/jobs/CreateJob';
import { PriceBoard } from './pages/prices/PriceBoard';
import { Events } from './pages/events/Events';
import { EventDetail } from './pages/events/EventDetail';
import { Groups } from './pages/groups/Groups';
import { GroupDetail } from './pages/groups/GroupDetail';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { FarmerVerification } from './pages/auth/FarmerVerification';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { Dashboard } from './pages/admin/Dashboard';
import { Verifications } from './pages/admin/Verifications';
import { Reports } from './pages/admin/Reports';
import { Users } from './pages/admin/Users';
import { Prices } from './pages/admin/Prices';
import { MyListings } from './pages/profile/MyListings';
import { MyJobs } from './pages/jobs/MyJobs';
import { Certifications } from './pages/profile/Certifications';
import { Settings } from './pages/profile/Settings';
import { AboutUs } from './pages/about/AboutUs';
import { ContactUs } from './pages/contact/ContactUs';
import { FAQ } from './pages/faq/FAQ';
import { PrivacyPolicy } from './pages/legal/PrivacyPolicy';
import { TermsOfService } from './pages/legal/TermsOfService';
import { LandingPage } from './pages/landing/LandingPage';

const AppContent = () => {
  const { currentPage, setCurrentPage, subPage, setSubPage, selectedId, setSelectedId, isMenuOpen, setIsMenuOpen, navigate, setUserRole, language } = useApp();
  const { user, isAuthenticated, isLoading } = useAuth();
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Sync user role from auth context
  useEffect(() => {
    if (user?.role) {
      setUserRole(user.role);
    }
  }, [user, setUserRole]);

  // Handle URL-based navigation for reset password (from email links)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    // Check if URL has reset-password path or token parameter
    if (token || window.location.pathname.includes('reset-password')) {
      setSubPage('reset-password');
      // Store token in sessionStorage so ResetPassword component can access it
      if (token) {
        sessionStorage.setItem('resetPasswordToken', token);
      }
    }
  }, [setSubPage]);

  const handleMenuSelect = (option: string) => {
    setIsMenuOpen(false);
    switch (option) {
      case 'sell':
        navigate('create-listing');
        break;
      case 'notice':
        navigate('create-notice');
        break;
      case 'job':
        navigate('create-job');
        break;
      case 'blog':
        navigate('create-blog');
        break;
    }
  };

  const handleBack = () => {
    // If we're on create-listing, ensure we return to marketplace
    if (subPage === 'create-listing') {
      setCurrentPage('market');
    }
    setSubPage(null);
    setSelectedId(null);
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#6F4E37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-bold">{t(language, 'common.loading')}</p>
        </div>
      </div>
    );
  }

  // Landing page (show when not authenticated and on home)
  if (currentPage === 'home' && !isAuthenticated && !subPage) {
    return <LandingPage />;
  }

  // Redirect authenticated users from landing to home content
  if (currentPage === 'home' && isAuthenticated && !subPage) {
    // Will fall through to render Home component below
  }

  // Auth pages (always full screen)
  if (subPage === 'login') {
    return <Login onBack={handleBack} onSuccess={() => setSubPage(null)} />;
  }
  if (subPage === 'register') {
    return <Register onBack={handleBack} onSuccess={() => setSubPage(null)} />;
  }
  if (subPage === 'verification') {
    return <FarmerVerification onBack={handleBack} onSuccess={() => setSubPage(null)} />;
  }
  if (subPage === 'forgot-password') {
    return <ForgotPassword onBack={handleBack} />;
  }
  if (subPage === 'reset-password') {
    return <ResetPassword onBack={handleBack} />;
  }

  // Admin pages - only accessible to admins and moderators
  if (currentPage === 'admin') {
    // Check if user is authenticated and has admin/moderator role
    if (!isAuthenticated) {
      setCurrentPage('home');
      setSubPage('login');
      return null;
    }
    
    const userRole = user?.role;
    if (userRole !== 'admin' && userRole !== 'moderator') {
      // Redirect non-admin/moderator users away from admin panel
      setCurrentPage('home');
      setSubPage(null);
      return null;
    }
    
    if (subPage === 'verifications') return <Verifications />;
    if (subPage === 'reports') return <Reports />;
    if (subPage === 'users') return <Users />;
    if (subPage === 'prices') return <Prices />;
    return <Dashboard />;
  }

  // Render sub-page content
  const renderSubPage = () => {
    if (subPage === 'blog-detail') {
      // Get postId from sessionStorage (blog posts use string IDs)
      const postId = sessionStorage.getItem('blogDetailId') || (selectedId ? selectedId.toString() : '');
      if (postId) {
        return <BlogDetail postId={postId} onBack={handleBack} />;
      }
    }
    if (subPage === 'create-blog') {
      return <CreateBlog />;
    }
    if (subPage === 'edit-blog') {
      // Get postId from sessionStorage (blog posts use string IDs)
      const postId = sessionStorage.getItem('blogEditId') || (selectedId ? selectedId.toString() : '');
      if (postId) {
        return <EditBlog postId={postId} onBack={handleBack} />;
      }
    }
    if (subPage === 'create-listing') {
      return <CreateListing onBack={handleBack} />;
    }
    if (subPage === 'notice-detail' && selectedId) {
      return <NoticeDetail noticeId={selectedId} onBack={handleBack} />;
    }
    if (subPage === 'create-notice') {
      return <CreateNotice onBack={handleBack} />;
    }
    if (subPage === 'job-detail') {
      // Get jobId from sessionStorage (jobs use string IDs)
      const jobId = sessionStorage.getItem('jobDetailId') || (selectedId ? selectedId.toString() : '');
      if (jobId) {
        return <JobDetail jobId={jobId} onBack={handleBack} />;
      }
    }
    if (subPage === 'create-job') {
      return <CreateJob onBack={handleBack} />;
    }
    if (subPage === 'event-detail' && selectedId) {
      return <EventDetail eventId={selectedId} onBack={handleBack} />;
    }
    if (subPage === 'group-detail' && selectedId) {
      return <GroupDetail groupId={selectedId} onBack={handleBack} />;
    }
    if (subPage === 'my-listings') {
      return <MyListings />;
    }
    if (subPage === 'my-jobs') {
      return <MyJobs />;
    }
    if (subPage === 'certifications') {
      return <Certifications />;
    }
    if (subPage === 'settings') {
      return <Settings />;
    }
    if (subPage === 'about') {
      return <AboutUs />;
    }
    if (subPage === 'contact') {
      return <ContactUs />;
    }
    if (subPage === 'faq') {
      return <FAQ />;
    }
    if (subPage === 'privacy') {
      return <PrivacyPolicy />;
    }
    if (subPage === 'terms') {
      return <TermsOfService />;
    }
    return null;
  };

  // Desktop Layout
  if (isDesktop) {
    // If sub-page exists, render it with sidebar
    if (subPage) {
      return (
        <div className="min-h-screen bg-coffee-beige font-body text-coffee-dark flex">
          <Sidebar onMenuOpen={() => setIsMenuOpen(true)} />
          <div className="flex-1 flex flex-col min-w-0">
            <DesktopHeader />
            <main className="flex-1 overflow-y-auto">
              {renderSubPage()}
            </main>
          </div>
          <CreateMenu 
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onSelect={handleMenuSelect}
          />
        </div>
      );
    }

    // Main pages with sidebar
    return (
      <div className="min-h-screen bg-[#F8F5F2] font-body text-[#2D241E] flex">
        <Sidebar onMenuOpen={() => setIsMenuOpen(true)} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <DesktopHeader />
          
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-7xl mx-auto px-8 py-6">
              {currentPage === 'home' && <Home onNavigate={(page) => {
                setCurrentPage(page);
              }} />}
              {currentPage === 'market' && <Marketplace />}
              {currentPage === 'jobs' && <Jobs />}
              {currentPage === 'profile' && <Profile />}
              {currentPage === 'notices' && <Notices />}
              {currentPage === 'blog' && <BlogList />}
              {currentPage === 'prices' && <PriceBoard />}
              {currentPage === 'events' && <Events />}
              {currentPage === 'groups' && <Groups />}
              {currentPage === 'about' && <AboutUs />}
              {currentPage === 'contact' && <ContactUs />}
              {currentPage === 'faq' && <FAQ />}
              {currentPage === 'privacy' && <PrivacyPolicy />}
              {currentPage === 'terms' && <TermsOfService />}
            </div>
          </main>
        </div>

        <CreateMenu 
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onSelect={handleMenuSelect}
        />
      </div>
    );
  }

  // Mobile Layout
  // If sub-page exists, render it (sub-pages have their own headers)
  if (subPage) {
    return (
      <div className="min-h-screen bg-coffee-beige font-body text-coffee-dark max-w-2xl mx-auto shadow-2xl relative">
        {renderSubPage()}
        <CreateMenu 
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onSelect={handleMenuSelect}
        />
      </div>
    );
  }

  // Main mobile pages
  return (
    <div className="min-h-screen bg-[#F8F5F2] font-body text-[#2D241E] max-w-2xl mx-auto shadow-2xl relative">
      <Header />
      
      <main className="min-h-screen">
        {currentPage === 'home' && <Home onNavigate={(page) => {
          setCurrentPage(page);
        }} />}
        {currentPage === 'market' && <Marketplace />}
        {currentPage === 'jobs' && <Jobs />}
        {currentPage === 'profile' && <Profile />}
        {currentPage === 'notices' && <Notices />}
        {currentPage === 'blog' && <BlogList />}
        {currentPage === 'prices' && <PriceBoard />}
        {currentPage === 'events' && <Events />}
        {currentPage === 'groups' && <Groups />}
        {currentPage === 'about' && <AboutUs />}
        {currentPage === 'contact' && <ContactUs />}
        {currentPage === 'faq' && <FAQ />}
        {currentPage === 'privacy' && <PrivacyPolicy />}
        {currentPage === 'terms' && <TermsOfService />}
      </main>

      <BottomNav 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        onMenuOpen={() => setIsMenuOpen(true)}
      />

      <CreateMenu 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelect={handleMenuSelect}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;

