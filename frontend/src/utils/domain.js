/**
 * CoachKush Domain & Dynamic URL Utility
 * 
 * Manages domain detection, canonical URL construction, OpenGraph synchronization,
 * and dynamic authentication redirects across all configured domain variants.
 */

export const PRIMARY_DOMAIN = 'coachkush.in';
export const PRIMARY_URL = 'https://coachkush.in';

export const SUPPORTED_DOMAINS = [
  'coachkush.in',
  'www.coachkush.in',
  'coachkush.com',
  'www.coachkush.com',
  'cochkush.in',
  'www.cochkush.in',
  'cochkush.com',
  'www.cochkush.com',
];

/**
 * Returns current window origin or defaults to primary production URL.
 * Safe for server-side or build-time evaluation.
 */
export const getCurrentOrigin = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return PRIMARY_URL;
};

/**
 * Returns the current hostname safely.
 */
export const getCurrentHostname = () => {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return window.location.hostname;
  }
  return PRIMARY_DOMAIN;
};

/**
 * Checks if current origin is one of the custom domains.
 */
export const isCustomDomain = () => {
  const host = getCurrentHostname().toLowerCase();
  return host.includes('cochkush.in') || host.includes('coachkush.in') || host.includes('coachkush.com');
};

/**
 * Construct an absolute URL dynamically anchored to the active origin.
 * @param {string} path - Target path e.g. '/pricing' or 'pricing'
 */
export const getSiteUrl = (path = '') => {
  const origin = getCurrentOrigin();
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';
  return `${origin}${cleanPath}`;
};

/**
 * Constructs dynamic Supabase Auth redirect URL based on active domain.
 * @param {string} path - Redirect destination path e.g. '/' or '/reset-password'
 */
export const getAuthRedirectUrl = (path = '/') => {
  return getSiteUrl(path);
};

/**
 * Synchronize head metadata (canonical link, og:url, twitter:url)
 * dynamically to match current domain and path.
 * @param {string} pathname - Current route pathname
 */
export const syncDomainMetadata = (pathname = '') => {
  if (typeof document === 'undefined') return;

  const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');
  const fullUrl = getSiteUrl(currentPath);

  // 1. Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', fullUrl);

  // 2. OpenGraph URL
  let ogUrl = document.querySelector('meta[property="og:url"]');
  if (!ogUrl) {
    ogUrl = document.createElement('meta');
    ogUrl.setAttribute('property', 'og:url');
    document.head.appendChild(ogUrl);
  }
  ogUrl.setAttribute('content', fullUrl);

  // 3. Twitter URL
  let twitterUrl = document.querySelector('meta[name="twitter:url"]');
  if (!twitterUrl) {
    twitterUrl = document.createElement('meta');
    twitterUrl.setAttribute('name', 'twitter:url');
    document.head.appendChild(twitterUrl);
  }
  twitterUrl.setAttribute('content', fullUrl);
};

export default {
  PRIMARY_DOMAIN,
  PRIMARY_URL,
  SUPPORTED_DOMAINS,
  getCurrentOrigin,
  getCurrentHostname,
  isCustomDomain,
  getSiteUrl,
  getAuthRedirectUrl,
  syncDomainMetadata,
};
