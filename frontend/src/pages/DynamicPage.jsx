import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { pageService } from '../services/contactService';
import { Button } from '../components/common/Button';
import { formatDate } from '../utils/formatters';
import { Loader2, ArrowLeft, FileText } from 'lucide-react';
import { SEO } from '../components/common/SEO';

export const DynamicPage = ({ defaultSlug }) => {
  const params = useParams();
  const slug = defaultSlug || params.slug;

  const { data: page, isLoading, isError } = useQuery({
    queryKey: ['page', slug],
    queryFn: () => pageService.getPageBySlug(slug),
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
        <p className="text-sm text-brand-muted">Loading content...</p>
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <SEO title="Page Not Found | Coach Kush" noindex={true} />
        <FileText className="w-12 h-12 text-brand-muted mx-auto" />
        <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
        <p className="text-sm text-brand-muted">
          The requested page could not be located or is no longer published.
        </p>
        <Link to="/">
          <Button variant="secondary" size="md" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </Button>
        </Link>
      </div>
    );
  }

  const canonicalPath = slug === 'privacy' ? '/privacy' : slug === 'terms' ? '/terms' : `/pages/${slug}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-8">
      <SEO
        title={`${page.title} | Coach Kush Online Fitness Coaching`}
        description={`${page.title} and policy documentation for Coach Kush online fitness coaching platform.`}
        canonical={canonicalPath}
      />
      <div className="space-y-3 pb-6 border-b border-brand-border">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-brand-muted hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Home
        </Link>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          {page.title}
        </h1>
        <p className="text-xs text-brand-darkMuted">
          Last updated: {formatDate(page.updatedAt)}
        </p>
      </div>

      <div className="glass-card rounded-3xl p-8 sm:p-12 border border-brand-border leading-relaxed text-brand-text/90 space-y-4 whitespace-pre-wrap text-sm sm:text-base">
        {page.content}
      </div>
    </div>
  );
};
