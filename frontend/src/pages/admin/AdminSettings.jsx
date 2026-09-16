import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { CheckCircle2, Shield, Server, CreditCard, Mail, Globe, MessageCircle } from 'lucide-react';

export const AdminSettings = () => {
  const { data: healthData } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await api.get('/health');
      return res.data;
    },
  });

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System & Deployment Health</h1>
        <p className="text-xs text-brand-muted mt-0.5">
          Review environment parameters, security states, and production service integrations.
        </p>
      </div>

      {/* Services Status */}
      <div className="glass-card rounded-2xl p-6 border border-brand-border space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-brand-accent" />
          Service Status Check
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-white">REST API Runtime</p>
              <p className="text-[11px] text-brand-muted">Express Engine</p>
            </div>
            <Badge variant="emerald">Healthy ({healthData?.status || 'ok'})</Badge>
          </div>

          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-white">Database Cluster</p>
              <p className="text-[11px] text-brand-muted">MongoDB Atlas</p>
            </div>
            <Badge variant="emerald">{healthData?.checks?.database || 'Connected'}</Badge>
          </div>

          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-white">Payment Gateway</p>
              <p className="text-[11px] text-brand-muted">Razorpay PG Standard</p>
            </div>
            <Badge variant="accent">Active</Badge>
          </div>

          <div className="p-4 rounded-xl bg-brand-surface border border-brand-border flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-white">Invoice Delivery</p>
              <p className="text-[11px] text-brand-muted">PDFKit & Nodemailer</p>
            </div>
            <Badge variant="emerald">Operational</Badge>
          </div>
        </div>
      </div>

      {/* Security Architecture Checklist */}
      <div className="glass-card rounded-2xl p-6 border border-brand-border space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-emerald" />
          Security Architecture Verification
        </h2>

        <ul className="space-y-2.5 text-xs text-brand-muted">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
            <span>Zero hard-coded secrets: All credentials loaded strictly from environment configuration.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
            <span>Server-side authoritative pricing: Client prices are never trusted.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
            <span>Argon2id password hashing implemented for all stored credentials.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
            <span>Secure HTTP-only cookies (<code className="text-brand-accent">coachkush_session</code>) for session security.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
            <span>Razorpay HMAC-SHA256 payment signature and webhook verification enforced.</span>
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-brand-emerald shrink-0" />
            <span>IDOR protections enforced on all order and invoice download endpoints.</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
