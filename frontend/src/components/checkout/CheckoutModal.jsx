import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatINR } from '../../utils/formatters';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import {
  ShieldCheck,
  Tag,
  CheckCircle,
  X,
  Lock,
  Loader2,
  Calendar,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export const CheckoutModal = ({ isOpen, onClose, plan, user }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  if (!isOpen || !plan) return null;

  const basePrice = plan.price;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  const handleApplyCoupon = async (e) => {
    e?.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const data = await orderService.validateCoupon({
        code: couponInput.trim().toUpperCase(),
        pricingId: plan.id || plan._id,
      });

      setAppliedCoupon(data);
      dispatch(
        addToast({
          type: 'success',
          message: `Coupon "${data.code}" applied! You saved ${formatINR(data.discountAmount)}`,
        })
      );
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Invalid coupon code';
      setCouponError(msg);
      setAppliedCoupon(null);
      dispatch(addToast({ type: 'error', message: msg }));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
  };

  const handleProceedPayment = async () => {
    setPaymentProcessing(true);

    try {
      // 1. Create authoritative order on backend
      const planIdentifier = plan.id || plan._id;
      const orderData = await orderService.createOrder({
        pricingId: planIdentifier,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
      });

      const orderRef = orderData.orderNumber || orderData.merchantTransactionId || orderData.orderId;

      // 2. Check if running in mock/simulated development mode
      const isSimulated =
        orderData.razorpayOrderId?.startsWith('order_sim_') ||
        orderData.keyId === 'rzp_test_placeholder' ||
        !window.Razorpay;

      if (isSimulated) {
        // Smooth sandbox/dev fallback verification
        await orderService.verifyPayment({
          orderId: orderData.orderId,
          razorpay_order_id: orderData.razorpayOrderId,
          razorpay_payment_id: `pay_sim_${Date.now()}`,
          razorpay_signature: 'simulated_signature',
        });

        dispatch(
          addToast({
            type: 'success',
            message: 'Payment confirmed successfully via Razorpay (Test Environment)',
          })
        );
        onClose();
        navigate(`/payment/success?orderRef=${orderRef}`);
        return;
      }

      // 3. Open official Razorpay modal popup
      const options = {
        key: orderData.keyId,
        amount: Math.round(orderData.amount * 100),
        currency: orderData.currency || 'INR',
        name: 'Coach Kush Fitness',
        description: `${plan.title || plan.name} - ${plan.sessions} Sessions Coaching`,
        image: '/assets/logo/logo.svg',
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          try {
            await orderService.verifyPayment({
              orderId: orderData.orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            dispatch(addToast({ type: 'success', message: 'Payment confirmed by Razorpay!' }));
            onClose();
            navigate(`/payment/success?orderRef=${orderRef}`);
          } catch (verifyErr) {
            dispatch(
              addToast({
                type: 'error',
                message: verifyErr.message || 'Signature verification failed',
              })
            );
            navigate('/payment/failed');
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        notes: {
          orderId: orderData.orderId,
          planTitle: plan.title,
        },
        theme: {
          color: '#F59E0B',
          backdrop_color: 'rgba(8, 11, 17, 0.9)',
        },
        modal: {
          ondismiss: function () {
            setPaymentProcessing(false);
          },
        },
      };

      const rzpInstance = new window.Razorpay(options);
      rzpInstance.on('payment.failed', function (response) {
        dispatch(
          addToast({
            type: 'error',
            message: response.error?.description || 'Payment was declined by bank',
          })
        );
        setPaymentProcessing(false);
        navigate('/payment/failed');
      });

      rzpInstance.open();
    } catch (err) {
      dispatch(
        addToast({
          type: 'error',
          message: err.response?.data?.error?.message || err.message || 'Failed to initiate checkout',
        })
      );
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="glass-card max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-brand-border shadow-2xl space-y-6 my-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={paymentProcessing}
          className="absolute top-5 right-5 p-2 rounded-xl text-brand-muted hover:text-white hover:bg-brand-surface transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="space-y-1 pr-8">
          <div className="flex items-center gap-2">
            <Badge variant="accent">Secure Checkout</Badge>
            <span className="text-[11px] font-semibold text-brand-emerald flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Razorpay Secured
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Confirm Your Membership
          </h2>
        </div>

        {/* Selected Plan Overview Card */}
        <div className="p-4 rounded-2xl bg-brand-surface/80 border border-brand-border space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-bold text-white">{plan.title}</h3>
              <p className="text-xs text-brand-accent font-medium mt-0.5">
                {plan.sessions} Live Interactive Sessions
              </p>
            </div>
            <span className="text-xs text-brand-muted flex items-center gap-1 bg-brand-card px-2.5 py-1 rounded-lg border border-brand-border">
              <Calendar className="w-3 h-3" />
              {plan.duration}
            </span>
          </div>
          <p className="text-xs text-brand-muted leading-relaxed line-clamp-2">
            {plan.description}
          </p>
        </div>

        {/* Coupon Code Section */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-brand-muted flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-brand-accent" />
            Have a Promotional Coupon Code?
          </label>

          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-mono font-bold text-emerald-400">
                    {appliedCoupon.code}
                  </span>
                  <span className="text-emerald-300/80 ml-2">
                    (Saved {formatINR(appliedCoupon.discountAmount)})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-xs text-red-400 hover:text-red-300 font-semibold underline ml-2"
              >
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                value={couponInput}
                onChange={(e) => {
                  setCouponInput(e.target.value.toUpperCase());
                  setCouponError('');
                }}
                placeholder="e.g. KUSH10"
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-xs font-mono uppercase tracking-wider focus:outline-none focus:border-brand-accent"
              />
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                isLoading={couponLoading}
                disabled={!couponInput.trim()}
              >
                Apply
              </Button>
            </form>
          )}

          {couponError && (
            <p className="text-[11px] text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {couponError}
            </p>
          )}
        </div>

        {/* Order Breakdown */}
        <div className="p-4 rounded-2xl bg-brand-card border border-brand-border space-y-2 text-xs">
          <div className="flex justify-between text-brand-muted">
            <span>Membership Subtotal:</span>
            <span className="font-semibold text-white">{formatINR(basePrice)}</span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-emerald-400 font-semibold">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Coupon Discount ({appliedCoupon.code}):
              </span>
              <span>-{formatINR(appliedCoupon.discountAmount)}</span>
            </div>
          )}

          <div className="flex justify-between text-brand-muted">
            <span>GST / Tax (Included):</span>
            <span className="text-white">₹0</span>
          </div>

          <div className="pt-2 border-t border-brand-border/80 flex justify-between items-baseline">
            <span className="text-sm font-bold text-white">Total Payable:</span>
            <span className="text-2xl font-black text-brand-accent">
              {formatINR(finalPrice)}
            </span>
          </div>
        </div>

        {/* Razorpay Action Button */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full text-sm font-bold uppercase tracking-wider gap-2 shadow-xl shadow-brand-accent/15"
            isLoading={paymentProcessing}
            onClick={handleProceedPayment}
          >
            <Lock className="w-4 h-4" />
            Pay {formatINR(finalPrice)} via Razorpay
            {!paymentProcessing && <ArrowRight className="w-4 h-4" />}
          </Button>

          <p className="text-[11px] text-center text-brand-darkMuted flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
            256-Bit SSL Encryption • Instant PDF Tax Invoice Generated
          </p>
        </div>
      </div>
    </div>
  );
};
