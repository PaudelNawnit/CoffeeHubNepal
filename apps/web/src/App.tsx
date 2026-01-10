import { useEffect, lazy, Suspense } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { t } from './i18n';
import { Header } from './components/layout/Header';
import { DesktopHeader } from './components/layout/DesktopHeader';
import { Sidebar } from './components/layout/Sidebar';
import { BottomNav } from './components/layout/BottomNav';
import { CreateMenu } from './components/common/CreateMenu';
import { useMediaQuery } from './hooks/useMediaQuery';

// Core pages - loaded immediately
import { Home } from './pages/home/Home';
import { LandingPage } from './pages/landing/LandingPage';

// Lazy-loaded pages for better initial load time
const Marketplace = lazy(() => import('./pages/marketplace/Marketplace').then(m => ({ default: m.Marketplace })));
const Jobs = lazy(() => import('./pages/jobs/Jobs').then(m => ({ default: m.Jobs })));
const Profile = lazy(() => import('./pages/profile/Profile').then(m => ({ default: m.Profile })));
const Notices = lazy(() => import('./pages/notices/Notices').then(m => ({ default: m.Notices })));
const BlogList = lazy(() => import('./pages/blog/BlogList').then(m => ({ default: m.BlogList })));
const BlogDetail = lazy(() => import('./pages/blog/BlogDetail').then(m => ({ default: m.BlogDetail })));
const CreateBlog = lazy(() => import('./pages/blog/CreateBlog').then(m => ({ default: m.CreateBlog })));
const EditBlog = lazy(() => import('./pages/blog/EditBlog').then(m => ({ default: m.EditBlog })));
const CreateListing = lazy(() => import('./pages/marketplace/CreateListing').then(m => ({ default: m.CreateListing })));
const NoticeDetail = lazy(() => import('./pages/notices/NoticeDetail').then(m => ({ default: m.NoticeDetail })));
const CreateNotice = lazy(() => import('./pages/notices/CreateNotice').then(m => ({ default: m.CreateNotice })));
const JobDetail = lazy(() => import('./pages/jobs/JobDetail').then(m => ({ default: m.JobDetail })));
const CreateJob = lazy(() => import('./pages/jobs/CreateJob').then(m => ({ default: m.CreateJob })));
const PriceBoard = lazy(() => import('./pages/prices/PriceBoard').then(m => ({ default: m.PriceBoard })));
const Events = lazy(() => import('./pages/events/Events').then(m => ({ default: m.Events })));
const EventDetail = lazy(() => import('./pages/events/EventDetail').then(m => ({ default: m.EventDetail })));
const Groups = lazy(() => import('./pages/groups/Groups').then(m => ({ default: m.Groups })));
const GroupDetail = lazy(() => import('./pages/groups/GroupDetail').then(m => ({ default: m.GroupDetail })));
const Login = lazy(() => import('./pages/auth/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./pages/auth/Register').then(m => ({ default: m.Register })));
const FarmerVerification = lazy(() => import('./pages/auth/FarmerVerification').then(m => ({ default: m.FarmerVerification })));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword').then(m => ({ default: m.ResetPassword })));
const Dashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.Dashboard })));
const Verifications = lazy(() => import('./pages/admin/Verifications').then(m => ({ default: m.Verifications })));
const Reports = lazy(() => import('./pages/admin/Reports').then(m => ({ default: m.Reports })));
const Users = lazy(() => import('./pages/admin/Users').then(m => ({ default: m.Users })));
const Prices = lazy(() => import('./pages/admin/Prices').then(m => ({ default: m.Prices })));
const Contacts = lazy(() => import('./pages/admin/Contacts').then(m => ({ default: m.Contacts })));
const MyListings = lazy(() => import('./pages/profile/MyListings').then(m => ({ default: m.MyListings })));
const MyJobs = lazy(() => import('./pages/jobs/MyJobs').then(m => ({ default: m.MyJobs })));
const Certifications = lazy(() => import('./pages/profile/Certifications').then(m => ({ default: m.Certifications })));
const Settings = lazy(() => import('./pages/profile/Settings').then(m => ({ default: m.Settings })));
const AboutUs = lazy(() => import('./pages/about/AboutUs').then(m => ({ default: m.AboutUs })));
const ContactUs = lazy(() => import('./pages/contact/ContactUs').then(m => ({ default: m.ContactUs })));
const FAQ = lazy(() => import('./pages/faq/FAQ').then(m => ({ default: m.FAQ })));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsOfService = lazy(() => import('./pages/legal/TermsOfService').then(m => ({ default: m.TermsOfService })));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-[#F8F5F2] flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-[#6F4E37] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

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
    // Handle back navigation based on current subPage
    switch (subPage) {
      case 'create-listing':
      case 'listing-detail':
        setCurrentPage('market');
        break;
      case 'blog-detail':
      case 'create-blog':
      case 'edit-blog':
        setCurrentPage('blog');
        break;
      case 'job-detail':
      case 'create-job':
        setCurrentPage('jobs');
        break;
      case 'my-listings':
      case 'my-jobs':
      case 'settings':
      case 'certifications':
        setCurrentPage('profile');
        break;
      default:
        // For other pages, go back to home
        break;
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

  // Auth pages (always full screen) - wrapped in Suspense for lazy loading
  if (subPage === 'login') {
    return <Suspense fallback={<PageLoader />}><Login onBack={handleBack} onSuccess={() => setSubPage(null)} /></Suspense>;
  }
  if (subPage === 'register') {
    return <Suspense fallback={<PageLoader />}><Register onBack={handleBack} onSuccess={() => setSubPage(null)} /></Suspense>;
  }
  if (subPage === 'verification') {
    return <Suspense fallback={<PageLoader />}><FarmerVerification onBack={handleBack} onSuccess={() => setSubPage(null)} /></Suspense>;
  }
  if (subPage === 'forgot-password') {
    return <Suspense fallback={<PageLoader />}><ForgotPassword onBack={handleBack} /></Suspense>;
  }
  if (subPage === 'reset-password') {
    return <Suspense fallback={<PageLoader />}><ResetPassword onBack={handleBack} /></Suspense>;
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
    
    return (
      <Suspense fallback={<PageLoader />}>
        {subPage === 'verifications' && <Verifications />}
        {subPage === 'reports' && <Reports />}
        {subPage === 'users' && <Users />}
        {subPage === 'prices' && <Prices />}
        {subPage === 'contacts' && <Contacts />}
        {!subPage && <Dashboard />}
      </Suspense>
    );
  }

  // Render sub-page content - wrapped in Suspense for lazy loading
  const renderSubPage = () => {
    const content = (() => {
      if (subPage === 'blog-detail') {
        const postId = sessionStorage.getItem('blogDetailId') || (selectedId ? selectedId.toString() : '');
        if (postId) return <BlogDetail postId={postId} onBack={handleBack} />;
      }
      if (subPage === 'create-blog') return <CreateBlog />;
      if (subPage === 'edit-blog') {
        const postId = sessionStorage.getItem('blogEditId') || (selectedId ? selectedId.toString() : '');
        if (postId) return <EditBlog postId={postId} onBack={handleBack} />;
      }
      if (subPage === 'create-listing') return <CreateListing onBack={handleBack} />;
      if (subPage === 'notice-detail' && selectedId) return <NoticeDetail noticeId={selectedId} onBack={handleBack} />;
      if (subPage === 'create-notice') return <CreateNotice onBack={handleBack} />;
      if (subPage === 'job-detail') {
        const jobId = sessionStorage.getItem('jobDetailId') || (selectedId ? selectedId.toString() : '');
        if (jobId) return <JobDetail jobId={jobId} onBack={handleBack} />;
      }
      if (subPage === 'create-job') return <CreateJob onBack={handleBack} />;
      if (subPage === 'event-detail' && selectedId) return <EventDetail eventId={selectedId} onBack={handleBack} />;
      if (subPage === 'group-detail' && selectedId) return <GroupDetail groupId={selectedId} onBack={handleBack} />;
      if (subPage === 'my-listings') return <MyListings />;
      if (subPage === 'my-jobs') return <MyJobs />;
      if (subPage === 'certifications') return <Certifications />;
      if (subPage === 'settings') return <Settings />;
      if (subPage === 'about') return <AboutUs />;
      if (subPage === 'contact') return <ContactUs />;
      if (subPage === 'faq') return <FAQ />;
      if (subPage === 'privacy') return <PrivacyPolicy />;
      if (subPage === 'terms') return <TermsOfService />;
      return null;
    })();
    
    return content ? <Suspense fallback={<PageLoader />}>{content}</Suspense> : null;
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
              <Suspense fallback={<PageLoader />}>
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
              </Suspense>
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
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
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

