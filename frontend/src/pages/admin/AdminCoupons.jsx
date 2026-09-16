import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatDate, formatINR } from '../../utils/formatters';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import {
  Ticket,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  Percent,
  Calendar,
  Layers,
  AlertCircle,
  Loader2,
  Tag,
} from 'lucide-react';

export const AdminCoupons = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderAmount: '',
    maxDiscount: '',
    validUntil: '',
    usageLimit: '',
    active: true,
    description: '',
  });

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: adminService.getCoupons,
  });

  const createMutation = useMutation({
    mutationFn: (newCoupon) => adminService.createCoupon(newCoupon),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      dispatch(addToast({ type: 'success', message: 'Coupon code created successfully' }));
      setModalOpen(false);
      resetForm();
    },
    onError: (err) => {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to create coupon' }));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      dispatch(addToast({ type: 'info', message: 'Coupon deleted successfully' }));
    },
    onError: (err) => {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to delete coupon' }));
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (id) => adminService.toggleCouponStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      dispatch(addToast({ type: 'success', message: 'Coupon status updated' }));
    },
    onError: (err) => {
      dispatch(addToast({ type: 'error', message: err.message || 'Failed to update coupon status' }));
    },
  });

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minOrderAmount: '',
      maxDiscount: '',
      validUntil: '',
      usageLimit: '',
      active: true,
      description: '',
    });
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    dispatch(addToast({ type: 'info', message: `Copied "${code}" to clipboard` }));
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      discountValue: Number(formData.discountValue),
      minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      validUntil: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
    };
    createMutation.mutate(payload);
  };

  const handleDelete = (coupon) => {
    if (window.confirm(`Are you sure you want to permanently delete coupon "${coupon.code}"?`)) {
      deleteMutation.mutate(coupon._id);
    }
  };

  const totalRedemptions = coupons.reduce((acc, c) => acc + (c.timesUsed || 0), 0);
  const activeCount = coupons.filter((c) => c.active).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-brand-accent" />
            Coupons & Discounts
          </h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Create, track, and manage promotional discount codes for coaching packages.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="gap-2 self-start">
          <Plus className="w-4 h-4" />
          Create New Coupon
        </Button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-brand-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-accent/15 border border-brand-accent/30 flex items-center justify-center text-brand-accent">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-brand-muted font-medium">Total Coupons</p>
            <p className="text-2xl font-black text-white">{coupons.length}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-brand-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-brand-muted font-medium">Active Coupons</p>
            <p className="text-2xl font-black text-white">{activeCount}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-brand-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-brand-muted font-medium">Total Redemptions</p>
            <p className="text-2xl font-black text-white">{totalRedemptions}</p>
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      {isLoading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
          <p className="text-xs text-brand-muted">Loading coupon catalog...</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-brand-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-surface text-brand-muted uppercase font-semibold border-b border-brand-border">
                <tr>
                  <th className="px-6 py-3.5">Coupon Code</th>
                  <th className="px-6 py-3.5">Discount</th>
                  <th className="px-6 py-3.5">Conditions</th>
                  <th className="px-6 py-3.5">Usage</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Valid Until</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-brand-text">
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-brand-muted">
                      <Ticket className="w-10 h-10 mx-auto text-brand-muted/40 mb-2" />
                      <p className="font-semibold text-white">No Coupons Created Yet</p>
                      <p className="text-xs text-brand-muted mt-1">
                        Click "Create New Coupon" to offer special promotions to your trainees.
                      </p>
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => {
                    const isExpired =
                      coupon.validUntil && new Date() > new Date(coupon.validUntil);

                    return (
                      <tr key={coupon._id} className="hover:bg-brand-surface/40 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-brand-accent bg-brand-card border border-brand-border px-2.5 py-1 rounded-lg text-sm tracking-wider">
                              {coupon.code}
                            </span>
                            <button
                              onClick={() => handleCopy(coupon.code)}
                              className="p-1 text-brand-muted hover:text-white transition-colors"
                              title="Copy code"
                            >
                              {copiedCode === coupon.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          {coupon.description && (
                            <p className="text-[11px] text-brand-muted mt-1 max-w-xs truncate">
                              {coupon.description}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <Badge variant={coupon.discountType === 'percentage' ? 'accent' : 'emerald'}>
                            {coupon.discountType === 'percentage'
                              ? `${coupon.discountValue}% OFF`
                              : `${formatINR(coupon.discountValue)} FLAT OFF`}
                          </Badge>
                          {coupon.maxDiscount && coupon.discountType === 'percentage' && (
                            <p className="text-[10px] text-brand-darkMuted mt-0.5">
                              Up to {formatINR(coupon.maxDiscount)}
                            </p>
                          )}
                        </td>

                        <td className="px-6 py-4 text-brand-muted">
                          {coupon.minOrderAmount > 0 ? (
                            <span>Min Order: {formatINR(coupon.minOrderAmount)}</span>
                          ) : (
                            <span className="text-brand-darkMuted">No min order</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-white">
                            {coupon.timesUsed || 0}
                          </span>
                          <span className="text-brand-muted">
                            {' / '}
                            {coupon.usageLimit ? coupon.usageLimit : '∞'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleStatusMutation.mutate(coupon._id)}
                            disabled={isExpired}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                              isExpired
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20 opacity-80 cursor-not-allowed'
                                : coupon.active
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                            }`}
                            title="Click to toggle status"
                          >
                            {isExpired ? (
                              <>
                                <AlertCircle className="w-3 h-3" /> Expired
                              </>
                            ) : coupon.active ? (
                              <>
                                <CheckCircle className="w-3 h-3" /> Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> Inactive
                              </>
                            )}
                          </button>
                        </td>

                        <td className="px-6 py-4 text-brand-muted">
                          {coupon.validUntil ? (
                            <span className={isExpired ? 'text-red-400 font-medium' : ''}>
                              {formatDate(coupon.validUntil)}
                            </span>
                          ) : (
                            <span className="text-brand-darkMuted">Never expires</span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDelete(coupon)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-xl w-full rounded-3xl p-6 sm:p-8 border border-brand-border shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-brand-accent" />
                  Create New Coupon
                </h2>
                <p className="text-xs text-brand-muted mt-0.5">
                  Configure discount terms and optional redemption thresholds.
                </p>
              </div>
              <button
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="text-brand-muted hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Code and Discount Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-brand-muted mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUMMER25"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-sm font-mono tracking-wider uppercase focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-brand-muted mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({ ...formData, discountType: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-sm focus:outline-none focus:border-brand-accent"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹ INR)</option>
                  </select>
                </div>
              </div>

              {/* Discount Value and Max Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-brand-muted mb-1">
                    {formData.discountType === 'percentage'
                      ? 'Discount Percentage (%) *'
                      : 'Flat Discount Amount (₹) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={formData.discountType === 'percentage' ? 100 : 100000}
                    placeholder={formData.discountType === 'percentage' ? '20' : '1000'}
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-sm focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-brand-muted mb-1">
                    {formData.discountType === 'percentage'
                      ? 'Max Discount Cap (₹) (Optional)'
                      : 'Not applicable'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    disabled={formData.discountType === 'flat'}
                    placeholder="e.g. 2500"
                    value={formData.maxDiscount}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDiscount: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-sm focus:outline-none focus:border-brand-accent disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Min Order & Usage Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-brand-muted mb-1">
                    Min Order Value (₹) (Optional)
                  </label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 8000"
                    value={formData.minOrderAmount}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderAmount: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-sm focus:outline-none focus:border-brand-accent"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-brand-muted mb-1">
                    Usage Limit (Optional)
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 50 (unlimited if empty)"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-sm focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block font-semibold text-brand-muted mb-1">
                  Expiration Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.validUntil}
                  onChange={(e) =>
                    setFormData({ ...formData, validUntil: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-sm focus:outline-none focus:border-brand-accent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-brand-muted mb-1">
                  Internal Description / Note
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 20% off promotion for Instagram campaign"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-xs focus:outline-none focus:border-brand-accent"
                />
              </div>

              {/* Active status */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="couponActive"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded border-brand-border bg-brand-card text-brand-accent focus:ring-brand-accent"
                />
                <label htmlFor="couponActive" className="font-semibold text-white">
                  Active (Ready for immediate use by trainees)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-brand-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setModalOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" isLoading={createMutation.isPending}>
                  Save Coupon
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
