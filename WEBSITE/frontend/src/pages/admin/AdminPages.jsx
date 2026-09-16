import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/adminService';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/uiSlice';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, ExternalLink, Loader2 } from 'lucide-react';

export const AdminPages = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    published: true,
  });

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['admin', 'pages'],
    queryFn: adminService.getPages,
  });

  const createMutation = useMutation({
    mutationFn: (page) => adminService.createPage(page),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] });
      dispatch(addToast({ type: 'success', message: 'Page published successfully' }));
      setModalOpen(false);
    },
    onError: (err) => dispatch(addToast({ type: 'error', message: err.message })),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, page }) => adminService.updatePage(id, page),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] });
      dispatch(addToast({ type: 'success', message: 'Page updated successfully' }));
      setModalOpen(false);
    },
    onError: (err) => dispatch(addToast({ type: 'error', message: err.message })),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminService.deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] });
      dispatch(addToast({ type: 'info', message: 'Page deleted' }));
    },
    onError: (err) => dispatch(addToast({ type: 'error', message: err.message })),
  });

  const openCreateModal = () => {
    setEditingPage(null);
    setFormData({
      title: '',
      slug: '',
      content: '',
      published: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      published: page.published,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPage) {
      updateMutation.mutate({ id: editingPage._id, page: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleTogglePublish = (page) => {
    updateMutation.mutate({
      id: page._id,
      page: { published: !page.published },
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this CMS page?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dynamic Pages CMS</h1>
          <p className="text-xs text-brand-muted mt-0.5">
            Manage legal documents, coaching FAQs, and dynamic custom routes.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 self-start">
          <Plus className="w-4 h-4" />
          Create New Page
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
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Slug / Route</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Last Updated</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border text-brand-text">
                {pages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-brand-muted">
                      No custom pages created yet.
                    </td>
                  </tr>
                ) : (
                  pages.map((page) => (
                    <tr key={page._id} className="hover:bg-brand-surface/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-white text-sm">{page.title}</td>
                      <td className="px-6 py-4 font-mono text-brand-accent">
                        /pages/{page.slug}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePublish(page)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                            page.published
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {page.published ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> Published
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> Draft
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-brand-muted">
                        {formatDate(page.updatedAt)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <a
                          href={`/pages/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block p-1.5 rounded-lg bg-brand-surface hover:bg-brand-border text-brand-muted hover:text-white transition-colors"
                          title="View Live Page"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openEditModal(page)}
                          className="p-1.5 rounded-lg bg-brand-surface hover:bg-brand-border text-brand-muted hover:text-white transition-colors"
                          title="Edit Page"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(page._id)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Delete Page"
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

      {/* Page Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card max-w-2xl w-full rounded-3xl p-6 sm:p-8 border border-brand-border shadow-2xl space-y-5 my-8">
            <h2 className="text-xl font-bold text-white">
              {editingPage ? 'Edit Page' : 'Create New Dynamic Page'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-brand-muted mb-1">Page Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
                      setFormData({ ...formData, title, slug: editingPage ? formData.slug : slug });
                    }}
                    placeholder="e.g. Terms of Coaching"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-sm focus:outline-none focus:border-brand-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-brand-muted mb-1">Slug (URL) *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. terms"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-sm focus:outline-none focus:border-brand-accent font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-brand-muted mb-1">Content *</label>
                <textarea
                  rows={10}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter page body text..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-brand-card border border-brand-border text-white text-xs focus:outline-none focus:border-brand-accent font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="publishedCheck"
                  checked={formData.published}
                  onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  className="w-4 h-4 rounded border-brand-border bg-brand-card text-brand-accent focus:ring-brand-accent"
                />
                <label htmlFor="publishedCheck" className="font-semibold text-white">
                  Publish (Visible to public visitors)
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
                  {editingPage ? 'Save Changes' : 'Publish Page'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
