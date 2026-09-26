import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { ToastContainer } from '../components/common/Toast';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { syncDomainMetadata } from '../utils/domain';

export const MainLayout = () => {
  const location = useLocation();

  useEffect(() => {
    syncDomainMetadata(location.pathname);
  }, [location.pathname]);
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text">
      <Navbar />
      <main className="flex-grow">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
      <ToastContainer />
    </div>
  );
};
