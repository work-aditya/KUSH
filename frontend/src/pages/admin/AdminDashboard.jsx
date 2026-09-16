import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { formatINR, formatDate, formatDateTime } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  ShoppingBag,
  CreditCard,
  IndianRupee,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminService.getDashboard,
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
        <p className="text-sm text-brand-muted">Aggregating dashboard analytics...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
        Failed to load administrative analytics. Please ensure backend is running.
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Total Revenue',
      value: formatINR(stats?.totalRevenue || 0),
      icon: IndianRupee,
      color: 'text-brand-emerald',
      bg: 'bg-brand-emerald/10 border-brand-emerald/30',
    },
    {
      title: 'Paid Orders',
      value: stats?.paidOrdersCount || 0,
      icon: CheckCircle2,
      color: 'text-brand-accent',
      bg: 'bg-brand-accent/10 border-brand-accent/30',
    },
    {
      title: 'Registered Trainees',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/30',
    },
    {
      title: 'Pending Transactions',
      value: stats?.pendingOrdersCount || 0,
      icon: Clock,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/30',
    },
    {
      title: 'Failed Payments',
      value: stats?.failedOrdersCount || 0,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/30',
    },
    {
      title: 'Active Pricing Plans',
      value: stats?.activePlansCount || 0,
      icon: CreditCard,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/30',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Performance Overview</h1>
        <p className="text-xs text-brand-muted mt-1">
          Live financial and trainee enrollment metrics across CoachKush.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {metricCards.map((card, idx) => (
          <div
            key={idx}
            className="glass-card rounded-2xl p-5 border border-brand-border flex items-center justify-between"
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                {card.title}
              </p>
              <p className="text-2xl font-black text-white">{card.value}</p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl border flex items-center justify-center ${card.bg} ${card.color}`}
            >
              <card.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="glass-card rounded-2xl border border-brand-border overflow-hidden">
        <div className="p-6 border-b border-brand-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Orders</h2>
            <p className="text-xs text-brand-muted mt-0.5">
              Latest trainee registrations and payment attempts
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-brand-surface text-brand-muted uppercase font-semibold border-b border-brand-border">
              <tr>
                <th className="px-6 py-3.5">Order Ref</th>
                <th className="px-6 py-3.5">Trainee</th>
                <th className="px-6 py-3.5">Plan</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border text-brand-text">
              {stats?.recentOrders?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-brand-muted">
                    No orders recorded yet.
                  </td>
                </tr>
              ) : (
                stats?.recentOrders?.map((order) => (
                  <tr key={order._id} className="hover:bg-brand-surface/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-brand-muted text-[11px]">
                      {order.merchantTransactionId}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-white">{order.userId?.name || 'User'}</p>
                      <p className="text-[11px] text-brand-muted">{order.userId?.email}</p>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {order.pricingId?.title || 'Coaching Program'}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      {formatINR(order.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          order.status === 'paid'
                            ? 'emerald'
                            : order.status === 'pending'
                            ? 'accent'
                            : 'danger'
                        }
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-brand-muted text-[11px]">
                      {formatDateTime(order.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
