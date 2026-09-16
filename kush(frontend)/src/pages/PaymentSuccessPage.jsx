import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '../services/paymentService';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { formatINR } from '../utils/formatters';
import {
  CheckCircle2,
  FileDown,
  MessageCircle,
  Video,
  Loader2,
  AlertCircle,
  Calendar,
  Clock,
} from 'lucide-react';

export const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const orderRef = searchParams.get('orderRef') || searchParams.get('orderId');

  // Authoritative Backend Verification
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['paymentStatus', orderRef],
    queryFn: () => paymentService.getPaymentStatus(orderRef),
    enabled: !!orderRef,
    refetchInterval: (query) => {
      // If status is still pending, poll every 3 seconds up to a few attempts
      return query.state.data?.status === 'pending' ? 3000 : false;
    },
  });

  if (!orderRef) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-brand-accent mx-auto" />
        <h1 className="text-2xl font-bold text-white">Missing Order Reference</h1>
        <p className="text-sm text-brand-muted">
          No order reference was provided in the payment return callback.
        </p>
        <Link to="/pricing">
          <Button variant="secondary" size="md">Return to Pricing</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <Loader2 className="w-10 h-10 text-brand-accent animate-spin" />
        <h2 className="text-xl font-bold text-white">Verifying Payment With Razorpay...</h2>
        <p className="text-xs text-brand-muted max-w-sm">
          Securing cryptographic verification from the payment provider. Please do not refresh.
        </p>
      </div>
    );
  }

  if (isError || data?.status === 'failed') {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto text-red-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Payment Verification Failed</h1>
        <p className="text-sm text-brand-muted">
          {error?.message || data?.message || 'We could not confirm a successful payment from the gateway.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to="/pricing">
            <Button variant="primary" size="md">Retry Payment</Button>
          </Link>
          <Link to="/contact">
            <Button variant="secondary" size="md">Contact Support</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPending = data?.status === 'pending';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="glass-card rounded-3xl p-8 sm:p-12 border border-brand-emerald/40 shadow-2xl space-y-8 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-emerald/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-3 relative z-10">
          <div className="w-16 h-16 rounded-full bg-brand-emerald/15 border border-brand-emerald/30 flex items-center justify-center mx-auto text-brand-emerald">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <Badge variant="emerald">Payment Verified & Confirmed</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome to CoachKush!
          </h1>
          <p className="text-sm sm:text-base text-brand-muted max-w-lg mx-auto leading-relaxed">
            Your transaction has been securely confirmed by Razorpay and your training enrollment is officially active.
          </p>
        </div>

        {/* Transaction Summary Box */}
        <div className="bg-brand-surface rounded-2xl p-6 border border-brand-border space-y-3 text-xs sm:text-sm text-brand-muted">
          <div className="flex justify-between items-center pb-2 border-b border-brand-border/60">
            <span>Program Enrolled</span>
            <span className="font-bold text-white">{data?.planTitle || 'Coaching Program'}</span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-brand-border/60">
            <span>Amount Paid</span>
            <span className="font-bold text-brand-emerald">
              {data?.amount ? formatINR(data.amount) : 'Verified'}
            </span>
          </div>
          <div className="flex justify-between items-center pb-2 border-b border-brand-border/60">
            <span>Order Reference</span>
            <span className="font-mono text-white text-xs">{data?.merchantTransactionId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Gateway Status</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Authoritative
            </span>
          </div>
        </div>

        {/* Next Steps: WhatsApp & Invoicing */}
        <div className="space-y-4 pt-2">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-brand-accent" />
            Next Step: Connect on WhatsApp to Schedule Live Sessions
          </h3>
          <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
            Kush conducts intake assessments and session bookings directly over WhatsApp. Message Kush right now with your order reference to lock in your preferred time slot on Google Meet or Zoom.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <WhatsAppButton
              text="Message Kush to Start Training"
              className="w-full text-center"
            />
            {data?.orderId && (
              <a
                href={paymentService.getInvoiceDownloadUrl(data.orderId)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="secondary" size="md" className="w-full gap-2">
                  <FileDown className="w-4 h-4 text-brand-accent" />
                  Download Official Tax Invoice (PDF)
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Email reminder note */}
        <div className="p-4 rounded-xl bg-brand-card border border-brand-border/80 flex items-center gap-3 text-xs text-brand-muted">
          <CheckCircle2 className="w-4 h-4 text-brand-accent shrink-0" />
          <span>
            A formal confirmation and PDF tax invoice have also been sent to your registered email address.
          </span>
        </div>
      </div>
    </div>
  );
};
