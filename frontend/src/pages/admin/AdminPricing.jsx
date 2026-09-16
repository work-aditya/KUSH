import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatINR } from '../../utils/formatters';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Loader2, ArrowUpDown } from 'lucide-react';

export const AdminPricing = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    duration: '',
    sessions: 12,
    planType: 'single',
    price: 8999,
    description: '',
    featuresString: '',
    active: true,
    sortOrder: 0,
  });

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['admin', 'pricing'],
    queryFn: adminService.getPricingPlans,
  });

  const createMutation = useMutation({
    mutationFn: (plan) => adminService.createPricingPlan(plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'active'] });
      dispatch(addToast({ type: 'success', message: 'Pricing plan created' }));
      setModalOpen(false);
    },
    onError: (err) => dispatch(addToast({ type: 'error', message: err.message })),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, plan }) => adminService.updatePricingPlan(id, plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'active'] });
      dispatch(addToast({ type: 'success', message: 'Pricing plan updated' }));
      setModalOpen(false);
    },
    onError: (err) => dispatch(addToast({ type: 'error', message: err.message })),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deletePricingPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pricing'] });
      queryClient.invalidateQueries({ queryKey: ['pricing', 'active'] });
      dispatch(addToast({ type: 'info', message: 'Pricing plan removed' }));
    },
    onError: (err) => dispatch(addToast({ type: 'error', message: err.message })),
  });

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData({
      title: '',
      duration: '1 Month',
      sessions: 12,
      planType: 'single',
      price: 8999,
      description: '',
      featuresString: 'Live 1-on-1 Sessions\nCustom Programming\nDirect WhatsApp Support',
      active: true,
      sortOrder: plans.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      title: plan.title,
      duration: plan.duration,
      sessions: plan.sessions,
      planType: plan.planType,
      price: plan.price,
      description: plan.description,
      featuresString: plan.features?.join('\n') || '',
      active: plan.active,
      sortOrder: plan.sortOrder || 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      duration: formData.duration,
      sessions: Number(formData.sessions),
      planType: formData.planType,
      price: Number(formData.price),
      description: formData.description,
      features: formData.featuresString
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
      active: formData.active,
      sortOrder: Number(formData.sortOrder),
    };

    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan._id, plan: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleToggleActive = (plan) => {
    updateMutation.mutate({
      id: plan._id,
      plan: { active: !plan.active },
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this pricing package?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Pricing Plans Manager</h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Create, update, enable/disable, and reorder dynamic packages displayed to trainees.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 self-start">
          <Plus className="w-4 h-4" />
          Create New Package
        </Button>
      </div>

      {isLoading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-brand-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-surface text-brand-muted uppercase font-semibold border-b border-brand-border">
                <tr>
                  <th className="px-6 py-3.5">Sort</th>
                  <th className="px-6 py-3.5">Title & Type</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">Sessions</th>
                  <th className="px-6 py-3.5">Price</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-brand-text">
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-brand-muted">
                      No pricing plans found. Click "Create New Package" to seed your first tier.
                    </td>
                  </tr>
                ) : (
                  plans.map((plan) => (
                    <tr key={plan._id} className="hover:bg-brand-surface/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-brand-accent">
                        #{plan.sortOrder || 0}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-white text-sm">{plan.title}</p>
                        <Badge
                          variant={plan.planType === 'couple' ? 'emerald' : 'muted'}
                          className="mt-1"
                        >
                          {plan.planType}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-medium">{plan.duration}</td>
                      <td className="px-6 py-4">{plan.sessions} Sessions</td>
                      <td className="px-6 py-4 font-bold text-white">
                        {formatINR(plan.price)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(plan)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                            plan.active
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {plan.active ? (
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
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(plan)}
                          className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-border text-brand-muted hover:text-white transition-colors"
                          title="Edit Package"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan._id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete Package"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-xl w-full rounded-3xl p-6 sm:p-8 border border-brand-border shadow-2xl space-y-5 my-8">
            <h2 className="text-xl font-bold text-white">
              {editingPlan ? 'Edit Pricing Package' : 'Create Pricing Package'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-brand-muted mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Session 12 - Single"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-sm focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-brand-muted mb-1">Duration *</label>
                  <input
                    type="text"
                    required
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 1 Month"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-sm focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brand-muted mb-1">Number of Sessions *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.sessions}
                    onChange={(e) => setFormData({ ...formData, sessions: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-sm focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-brand-muted mb-1">Plan Type *</label>
                  <select
                    value={formData.planType}
                    onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-xs focus:outline-none focus:border-brand-accent"
                  >
                    <option value="single">Single (1-on-1)</option>
                    <option value="couple">Couple / Partner</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-brand-muted mb-1">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-sm focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brand-muted mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-sm focus:outline-none focus:border-brand-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-brand-muted mb-1">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summary of the coaching offering..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-xs focus:outline-none focus:border-brand-accent resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-brand-muted mb-1">
                  Features (One per line)
                </label>
                <textarea
                  rows={4}
                  value={formData.featuresString}
                  onChange={(e) => setFormData({ ...formData, featuresString: e.target.value })}
                  placeholder="Live 1-on-1 Sessions&#10;Custom Nutrition Guideline&#10;WhatsApp Support"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-xs focus:outline-none focus:border-brand-accent"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded border-brand-border bg-brand-card text-brand-accent focus:ring-brand-accent"
                />
                <label htmlFor="activeCheck" className="font-semibold text-white">
                  Active (Visible on public pricing page)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-brand-border">
                <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={createMutation.isPending || updateMutation.isPending}
                >
                  {editingPlan ? 'Save Changes' : 'Create Package'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
