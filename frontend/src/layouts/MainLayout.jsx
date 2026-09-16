import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { ToastContainer } from '../components/common/Toast';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg text-brand-text">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
      <ToastContainer />
    </div>
  );
};
