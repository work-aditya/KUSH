import React, { useEffect } from 'react';

const SITE_URL = 'https://coachkush.in';
const DEFAULT_IMAGE = `${SITE_URL}/assets/images/coach_kush.jpg`;

export const SEO = ({
  title,
  description,
  canonical,
  noindex = false,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  schema = null,
}) => {
  useEffect(() => {
    // 1. Update Title
    if (title) {
      document.title = title;
    }

    // Helper to update or create a meta tag
    const setMetaTag = (attributeName, attributeValue, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attributeName, attributeValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Helper to update or create a link tag
    const setLinkTag = (rel, href) => {
      if (!href) return;
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    // Calculate full canonical URL
    const cleanCanonical = canonical
      ? canonical.startsWith('http')
        ? canonical
        : `${SITE_URL}${canonical.startsWith('/') ? '' : '/'}${canonical}`
      : `${SITE_URL}${window.location.pathname === '/' ? '/' : window.location.pathname}`;

    // 2. Meta Description
    if (description) {
      setMetaTag('name', 'description', description);
    }

    // 3. Canonical URL
    setLinkTag('canonical', cleanCanonical);

    // 4. Open Graph Tags
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'Coach Kush');
    if (title) setMetaTag('property', 'og:title', title);
    if (description) setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', cleanCanonical);
    setMetaTag('property', 'og:image', ogImage);

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    if (title) setMetaTag('name', 'twitter:title', title);
    if (description) setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // 6. Robots Tag (Index/Noindex)
    const robotsDirective = noindex ? 'noindex, nofollow' : 'index, follow';
    setMetaTag('name', 'robots', robotsDirective);

    // 7. Dynamic JSON-LD Schema (if provided)
    let schemaScript = document.getElementById('seo-dynamic-schema');
    if (schema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'seo-dynamic-schema';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.textContent = JSON.stringify(schema);
    } else if (schemaScript) {
      schemaScript.remove();
    }
  }, [title, description, canonical, noindex, ogType, ogImage, schema]);

  return null;
};

export default SEO;
