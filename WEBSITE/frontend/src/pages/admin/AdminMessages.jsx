import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { formatDateTime } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import { MessageSquare, Mail, Phone, CheckCircle, Archive, Loader2 } from 'lucide-react';

export const AdminMessages = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['admin', 'messages'],
    queryFn: adminService.getMessages,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminService.updateMessageStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'messages'] });
      dispatch(addToast({ type: 'success', message: 'Message status updated' }));
    },
    onError: (err) => dispatch(addToast({ type: 'error', message: err.message })),
  });

  const handleStatusChange = (id, status) => {
    statusMutation.mutate({ id, status });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Contact Inquiries</h1>
        <p className="text-xs text-brand-muted mt-0.5">
          Review trainee inquiries submitted through the contact form.
        </p>
      </div>

      {isLoading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
        </div>
      ) : messages.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center border border-brand-border space-y-3">
          <MessageSquare className="w-12 h-12 text-brand-muted mx-auto" />
          <p className="text-white font-bold">No Messages Yet</p>
          <p className="text-xs text-brand-muted">New inquiries will appear here as trainees reach out.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className="glass-card rounded-2xl p-6 border border-brand-border space-y-4 hover:border-brand-borderLight transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-brand-border/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center text-brand-accent font-bold text-sm">
                    {msg.name?.[0]?.toUpperCase() || 'M'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{msg.name}</h3>
                    <div className="flex items-center gap-4 text-xs text-brand-muted mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        {msg.email}
                      </span>
                      {msg.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {msg.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  <Badge
                    variant={
                      msg.status === 'new'
                        ? 'accent'
                        : msg.status === 'read'
                        ? 'emerald'
                        : 'muted'
                    }
                  >
                    {msg.status}
                  </Badge>
                  <span className="text-[11px] text-brand-muted">
                    {formatDateTime(msg.createdAt)}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-brand-surface/60 border border-brand-border/40 text-xs sm:text-sm text-brand-text whitespace-pre-wrap leading-relaxed">
                {msg.message}
              </div>

              <div className="flex items-center justify-end gap-2 text-xs pt-1">
                {msg.status === 'new' && (
                  <button
                    onClick={() => handleStatusChange(msg._id, 'read')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/30 transition-colors font-medium"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Mark as Read
                  </button>
                )}
                {msg.status !== 'archived' && (
                  <button
                    onClick={() => handleStatusChange(msg._id, 'archived')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-surface hover:bg-brand-border text-brand-muted hover:text-white transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Archive
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
