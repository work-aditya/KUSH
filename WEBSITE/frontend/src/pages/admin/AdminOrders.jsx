import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { paymentService } from '../../services/paymentService';
import { formatINR, formatDateTime } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ShoppingBag, FileDown, Search, Loader2 } from 'lucide-react';

export const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: adminService.getOrders,
  });

  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    return (
      order.merchantTransactionId?.toLowerCase().includes(term) ||
      order.userId?.name?.toLowerCase().includes(term) ||
      order.userId?.email?.toLowerCase().includes(term) ||
      order.pricingId?.title?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Orders & Invoices</h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Audit PhonePe payment references, order statuses, and access official PDF tax invoices.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by ID, email, trainee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-brand-card border border-brand-border text-xs text-white placeholder:text-brand-darkMuted focus:outline-none focus:border-brand-accent"
          />
        </div>
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
                  <th className="px-6 py-3.5">Order Ref</th>
                  <th className="px-6 py-3.5">Customer / Trainee</th>
                  <th className="px-6 py-3.5">Plan Purchased</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Payment Status</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-brand-text">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-brand-muted">
                      No matching orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-brand-surface/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-[11px] text-brand-muted">
                        {order.merchantTransactionId}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-white">{order.userId?.name || 'Trainee'}</p>
                        <p className="text-[11px] text-brand-muted">{order.userId?.email}</p>
                        {order.userId?.phone && (
                          <p className="text-[10px] text-brand-darkMuted">{order.userId.phone}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-white">{order.pricingId?.title || 'Program'}</p>
                        <span className="text-[10px] text-brand-muted">
                          {order.pricingId?.duration} ({order.pricingId?.sessions} sessions)
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-white text-sm">
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
                      <td className="px-6 py-4 text-right">
                        {order.status === 'paid' ? (
                          <a
                            href={paymentService.getInvoiceDownloadUrl(order._id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-border text-brand-accent hover:text-white transition-colors text-[11px] font-semibold"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                            PDF Invoice
                          </a>
                        ) : (
                          <span className="text-brand-darkMuted text-[11px]">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
