
import React, { useState, useEffect } from 'react';
import { User, Donation, AppState, UserRole, DonationStatus } from './types';
import { storageService } from './services/storageService';
import { Layout } from './components/Layout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DonorDashboard } from './pages/DonorDashboard';
import { ReceiverDashboard } from './pages/ReceiverDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { PostDonationPage } from './pages/PostDonationPage';
import { BrowseDonationsPage } from './pages/BrowseDonationsPage';
import { AiAssistantPage } from './pages/AiAssistantPage';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(storageService.loadData());
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    storageService.saveData(appState);
  }, [appState]);

  const handleLogin = (email: string) => {
    const user = appState.users.find(u => u.email === email);
    if (user) {
      setAppState(prev => ({ ...prev, currentUser: user }));
      setCurrentPage('dashboard');
      setAuthError(null);
    } else {
      setAuthError('User not found. Please register.');
    }
  };

  const handleSignup = (userData: Omit<User, 'id' | 'createdAt'>) => {
    if (appState.users.some(u => u.email === userData.email)) {
      setAuthError('Email already registered.');
      return;
    }
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    setAppState(prev => ({
      ...prev,
      users: [...prev.users, newUser],
      currentUser: newUser
    }));
    setCurrentPage('dashboard');
    setAuthError(null);
  };

  const handleLogout = () => {
    setAppState(prev => ({ ...prev, currentUser: null }));
    setCurrentPage('home');
  };

  const handlePostDonation = (donationData: any) => {
    if (!appState.currentUser) return;
    const newDonation: Donation = {
      ...donationData,
      id: Math.random().toString(36).substr(2, 9),
      donorId: appState.currentUser.id,
      donorName: appState.currentUser.name,
      status: DonationStatus.AVAILABLE,
      createdAt: new Date().toISOString()
    };
    setAppState(prev => ({
      ...prev,
      donations: [newDonation, ...prev.donations]
    }));
    setCurrentPage('dashboard');
  };

  const handleRequestDonation = (donationId: string) => {
    if (!appState.currentUser || appState.currentUser.role !== UserRole.RECEIVER) return;
    setAppState(prev => ({
      ...prev,
      donations: prev.donations.map(d => 
        d.id === donationId 
          ? { 
              ...d, 
              status: DonationStatus.REQUESTED, 
              receiverId: appState.currentUser!.id, 
              receiverName: appState.currentUser!.name 
            } 
          : d
      )
    }));
  };

  const handleApproveRejectDonation = (donationId: string, status: DonationStatus) => {
    if (appState.currentUser?.role !== UserRole.ADMIN) return;
    setAppState(prev => ({
      ...prev,
      donations: prev.donations.map(d => d.id === donationId ? { ...d, status } : d)
    }));
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage onNavigate={setCurrentPage} />;
      case 'login':
        return <LoginPage onLogin={handleLogin} error={authError} onNavigate={setCurrentPage} />;
      case 'signup':
        return <SignupPage onSignup={handleSignup} error={authError} onNavigate={setCurrentPage} />;
      case 'post-donation':
        return <PostDonationPage onPost={handlePostDonation} onCancel={() => setCurrentPage('dashboard')} />;
      case 'browse':
        return <BrowseDonationsPage 
          donations={appState.donations.filter(d => d.status === DonationStatus.AVAILABLE)} 
          onRequest={handleRequestDonation}
          user={appState.currentUser}
          onNavigate={setCurrentPage}
        />;
      case 'ai-assistant':
        return <AiAssistantPage />;
      case 'dashboard':
        if (!appState.currentUser) return <LoginPage onLogin={handleLogin} error={null} onNavigate={setCurrentPage} />;
        if (appState.currentUser.role === UserRole.DONOR) {
          return <DonorDashboard 
            donations={appState.donations.filter(d => d.donorId === appState.currentUser!.id)} 
            user={appState.currentUser}
            onPost={() => setCurrentPage('post-donation')}
          />;
        }
        if (appState.currentUser.role === UserRole.RECEIVER) {
          return <ReceiverDashboard 
            requests={appState.donations.filter(d => d.receiverId === appState.currentUser!.id)} 
            user={appState.currentUser}
            onBrowse={() => setCurrentPage('browse')}
          />;
        }
        if (appState.currentUser.role === UserRole.ADMIN) {
          return <AdminDashboard 
            allDonations={appState.donations}
            allUsers={appState.users}
            onUpdateStatus={handleApproveRejectDonation}
          />;
        }
        return null;
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout 
      user={appState.currentUser} 
      onLogout={handleLogout} 
      onNavigate={setCurrentPage} 
      currentPage={currentPage}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;
