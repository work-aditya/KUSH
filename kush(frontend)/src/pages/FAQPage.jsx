import React from 'react';
import { FAQSection } from '../components/common/FAQSection';
import { Badge } from '../components/common/Badge';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FAQPage = () => {
  return (
    <div className="py-12 sm:py-20 space-y-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-brand-muted hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
      </div>

      <FAQSection
        title="Knowledge Base & Frequently Asked Questions"
        subtitle="Find answers to all your questions about live virtual training, couple coaching packages, Razorpay payment security, and our refund & rescheduling guidelines."
      />
    </div>
  );
};
