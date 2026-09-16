import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { XCircle, RefreshCw, Mail, ArrowLeft } from 'lucide-react';

export const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams();
  const orderRef = searchParams.get('orderRef') || searchParams.get('orderId');

  return (
    <div className="max-w-xl mx-auto px-4 py-16 sm:py-24 text-center">
      <div className="glass-card rounded-3xl p-8 sm:p-12 border border-red-500/30 shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <XCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white">Payment Unsuccessful</h1>
          <p className="text-sm text-brand-muted leading-relaxed">
            The transaction could not be completed by Razorpay or was canceled by the bank. No charges were made to your account.
          </p>
          {orderRef && (
            <p className="text-xs text-brand-darkMuted font-mono">
              Reference: {orderRef}
            </p>
          )}
        </div>

        <div className="p-4 rounded-xl bg-brand-surface border border-brand-border text-xs text-brand-muted text-left space-y-1.5">
          <p className="font-semibold text-white">Common reasons for failure:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Bank UPI server timeout or daily transaction limit reached</li>
            <li>Insufficient funds in chosen payment instrument</li>
            <li>Session timeout or tab closed during UPI confirmation</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to="/pricing">
            <Button variant="primary" size="md" className="w-full sm:w-auto gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry Checkout
            </Button>
          </Link>
          <Link to="/contact">
            <Button variant="secondary" size="md" className="w-full sm:w-auto gap-2">
              <Mail className="w-4 h-4" />
              Contact Support
            </Button>
          </Link>
        </div>

        <div className="pt-4 border-t border-brand-border/60">
          <p className="text-xs text-brand-muted mb-3">
            Need urgent assistance or want to pay via direct bank transfer?
          </p>
          <WhatsAppButton text="Chat with Kush on WhatsApp" />
        </div>
      </div>
    </div>
  );
};
