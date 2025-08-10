import React from "react";
import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";

const SEOHead = ({
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

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={imageUrl} />

      {/* Additional SEO Meta Tags */}
      <meta name="author" content="GREPrep.academy Team" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="distribution" content="web" />
      <meta name="rating" content="general" />

      {/* Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=no" />

      {/* Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

SEOHead.propTypes = {
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

export default SEOHead;
