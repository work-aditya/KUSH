import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { formatDate } from '../../utils/formatters';
import { Badge } from '../../components/common/Badge';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import { Users, Search, CheckCircle, XCircle, Shield, Loader2 } from 'lucide-react';

export const AdminUsers = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminService.getUsers,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, active }) => adminService.toggleUserStatus(id, active),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      dispatch(
        addToast({
          type: 'success',
          message: `User status updated to ${data.active ? 'Active' : 'Deactivated'}`,
        })
      );
    },
    onError: (err) => dispatch(addToast({ type: 'error', message: err.message })),
  });

  const handleToggle = (user) => {
    toggleStatusMutation.mutate({ id: user._id, active: !user.active });
  };

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      u.phone?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Trainee Directory</h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Manage user accounts, privileges, and active access status.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search trainees by name, email..."
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
                  <th className="px-6 py-3.5">Trainee</th>
                  <th className="px-6 py-3.5">Contact Details</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Joined Date</th>
                  <th className="px-6 py-3.5 text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-brand-text">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-brand-muted">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-brand-surface/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-surface border border-brand-border flex items-center justify-center font-bold text-brand-accent">
                            {user.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{user.name}</p>
                            <p className="text-[11px] text-brand-muted font-mono">{user._id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-medium">{user.email}</p>
                        <p className="text-brand-muted">{user.phone || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={user.role === 'admin' ? 'accent' : 'muted'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-brand-muted">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {user.role === 'admin' ? (
                          <span className="text-[11px] text-brand-accent font-semibold px-2 py-1 bg-brand-accent/10 rounded-lg">
                            Root Administrator
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggle(user)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                              user.active
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
                            }`}
                          >
                            {user.active ? (
                              <>
                                <CheckCircle className="w-3.5 h-3.5" /> Active
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3.5 h-3.5" /> Deactivated
                              </>
                            )}
                          </button>
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
