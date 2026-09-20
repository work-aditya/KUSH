import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { WhatsAppButton } from '../components/common/WhatsAppButton';
import { formatINR } from '../utils/formatters';
import { CheckoutModal } from '../components/checkout/CheckoutModal';
import { FAQSection } from '../components/common/FAQSection';
import {
  CheckCircle,
  Video,
  ShieldCheck,
  Zap,
  Users,
  User,
  ArrowRight,
  Loader2,
  Calendar,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { addToast } from '../store/slices/uiSlice';

export const PricingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filter, setFilter] = useState('all'); // 'all', 'single', 'couple'
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);

  // Fetch active plans from Supabase PostgreSQL
  const { data: plans = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['pricing', 'active'],
    queryFn: productService.getActivePlans,
  });

  const handleCheckout = (plan) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: '/pricing' } });
      return;
    }
    setSelectedPlanForCheckout(plan);
  };

  const filteredPlans = plans.filter((p) => {
    if (filter === 'single') return p.planType === 'single';
    if (filter === 'couple') return p.planType === 'couple';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="accent">Official Coaching Memberships</Badge>
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
          Invest in Real Transformation
        </h1>
        <p className="text-base sm:text-lg text-brand-muted leading-relaxed">
          Select the program that fits your goals. Every membership includes 100% live Google Meet / Zoom coaching, custom programming, and direct access to Kush.
        </p>

        {/* Filter Tabs */}
        <div className="pt-6 flex justify-center">
          <div className="inline-flex p-1.5 rounded-xl bg-brand-card border border-brand-border gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                filter === 'all'
                  ? 'bg-brand-accent text-black shadow-md'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              All Programs ({plans.length})
            </button>
            <button
              onClick={() => setFilter('single')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                filter === 'single'
                  ? 'bg-brand-accent text-black shadow-md'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              1-on-1 Single
            </button>
            <button
              onClick={() => setFilter('couple')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                filter === 'couple'
                  ? 'bg-brand-emerald text-black shadow-md'
                  : 'text-brand-muted hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Couple / Partner
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      {isLoading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
          <p className="text-sm text-brand-muted">Fetching live plans from server...</p>
        </div>
      ) : isError ? (
        <div className="glass-card rounded-2xl p-10 text-center max-w-md mx-auto space-y-4">
          <p className="text-red-400 font-medium">Failed to retrieve pricing packages</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredPlans.map((plan) => {
            const isCouple = plan.planType === 'couple';
            const isProcessing = activeProcessingId === plan._id && checkoutMutation.isPending;

            return (
              <div
                key={plan.id || plan._id}
                className={`glass-card rounded-3xl p-7 flex flex-col justify-between border transition-all duration-300 relative ${
                  isCouple
                    ? 'border-brand-emerald/40 hover:border-brand-emerald shadow-xl shadow-brand-emerald/5'
                    : 'border-brand-border hover:border-brand-accent/60 shadow-xl'
                }`}
              >
                {/* Plan Badge */}
                <div className="flex justify-between items-start mb-4">
                  <Badge variant={isCouple ? 'emerald' : 'accent'}>
                    {isCouple ? 'Couple / Partner' : '1-on-1 Single'}
                  </Badge>
                  <span className="text-xs font-semibold text-brand-muted flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {plan.duration}
                  </span>
                </div>

                {/* Plan Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-extrabold text-white">{plan.title}</h3>
                    <p className="text-xs font-medium text-brand-accent mt-0.5">
                      {plan.sessions} Live Interactive Sessions
                    </p>
                  </div>

                  <div className="pt-2">
                    <span className="text-3xl sm:text-4xl font-black text-white">
                      {formatINR(plan.price)}
                    </span>
                    <span className="text-xs text-brand-darkMuted ml-2">all inclusive</span>
                  </div>

                  <p className="text-xs text-brand-muted leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>

                  {/* Features List */}
                  <div className="pt-4 border-t border-brand-border/60 space-y-2.5">
                    <p className="text-[11px] font-bold text-white uppercase tracking-wider">
                      Included in this program:
                    </p>
                    <ul className="space-y-2 text-xs text-brand-muted">
                      {plan.features?.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <CheckCircle
                            className={`w-4 h-4 shrink-0 mt-0.5 ${
                              isCouple ? 'text-brand-emerald' : 'text-brand-accent'
                            }`}
                          />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Buy Action */}
                <div className="pt-8 mt-auto">
                  <Button
                    variant={isCouple ? 'emerald' : 'primary'}
                    size="lg"
                    className="w-full text-sm font-bold uppercase tracking-wider gap-2 shadow-xl"
                    onClick={() => handleCheckout(plan)}
                  >
                    {isAuthenticated ? 'Enroll / Buy Now' : 'Login to Enroll'}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <p className="text-[10px] text-center text-brand-darkMuted mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-brand-emerald" />
                    Secured by Razorpay • Instant Tax Invoice
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Guarantee & Contact note */}
      <div className="glass-card rounded-2xl p-8 border border-brand-border flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-lg font-bold text-white flex items-center justify-center md:justify-start gap-2">
            <Video className="w-5 h-5 text-brand-accent" />
            Have questions about equipment, schedule, or setup?
          </h3>
          <p className="text-xs text-brand-muted">
            Kush is available directly on WhatsApp to review your goals before you enroll.
          </p>
        </div>
        <WhatsAppButton text="Chat with Kush on WhatsApp" />
      </div>

      {/* Interactive FAQ Section */}
      <FAQSection className="pt-8 border-t border-brand-border/60" />

      {/* Checkout Modal with Coupon Support and Razorpay */}
      <CheckoutModal
        isOpen={Boolean(selectedPlanForCheckout)}
        onClose={() => setSelectedPlanForCheckout(null)}
        plan={selectedPlanForCheckout}
        user={user}
      />
    </div>
  );
};
