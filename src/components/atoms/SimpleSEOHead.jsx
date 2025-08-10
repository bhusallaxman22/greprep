import React, { useEffect } from "react";
import PropTypes from "prop-types";

const SimpleSEOHead = ({
  title,
  description,
  keywords,
  canonical,
  ogImage,
  ogType = "website",
  twitterCard = "summary_large_image",
  jsonLd,
  noIndex = false,
}) => {
  const siteUrl = "https://greprep.academy"; // Replace with your actual domain
  const siteName = "GREPrep.AI - AI-Powered GRE & GMAT Test Preparation";

  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;
  const imageUrl = ogImage
    ? `${siteUrl}${ogImage}`
    : `${siteUrl}/images/og-default.jpg`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Function to update or create meta tag
    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let tag = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    // Update meta tags
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);

    // Open Graph tags
    updateMetaTag("og:type", ogType, true);
    updateMetaTag("og:url", canonicalUrl, true);
    updateMetaTag("og:title", fullTitle, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:image", imageUrl, true);
    updateMetaTag("og:site_name", siteName, true);

    // Twitter tags
    updateMetaTag("twitter:card", twitterCard, true);
    updateMetaTag("twitter:url", canonicalUrl, true);
    updateMetaTag("twitter:title", fullTitle, true);
    updateMetaTag("twitter:description", description, true);
    updateMetaTag("twitter:image", imageUrl, true);

    // Additional SEO tags
    updateMetaTag("author", "GREPrep.AI Team");
    updateMetaTag("language", "English");
    updateMetaTag("revisit-after", "7 days");

    // Robots tag
    if (noIndex) {
      updateMetaTag("robots", "noindex,nofollow");
    }

    // Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", canonicalUrl);

    // Structured data
    if (jsonLd) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(jsonLd);
    }
  }, [
    fullTitle,
    description,
    keywords,
    canonicalUrl,
    imageUrl,
    ogType,
    twitterCard,
    siteName,
    noIndex,
    jsonLd,
  ]);

  return null;
};

SimpleSEOHead.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string.isRequired,
  keywords: PropTypes.string.isRequired,
  canonical: PropTypes.string,
  ogImage: PropTypes.string,
  ogType: PropTypes.string,
  twitterCard: PropTypes.string,
  jsonLd: PropTypes.object,
  noIndex: PropTypes.bool,
};

export default SimpleSEOHead;
