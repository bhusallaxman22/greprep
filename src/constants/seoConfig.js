// SEO Configuration and Keywords
export const SEO_CONFIG = {
    siteName: "GREPrep.AI",
    siteUrl: "https://greprep.academy", // Replace with your actual domain
    defaultImage: "/images/og-default.jpg",
    twitterHandle: "@GREPrepAI",
};

// Primary Target Keywords for Top Ranking
export const PRIMARY_KEYWORDS = [
    "GRE prep",
    "GMAT prep",
    "GRE preparation",
    "GMAT preparation",
    "GRE GMAT AI preparation",
    "AI based GRE preparation",
    "AI powered GMAT prep",
    "online GRE test prep",
    "online GMAT test prep",
    "free GRE practice tests",
    "free GMAT practice tests",
];

// Secondary Keywords for Long-tail SEO
export const SECONDARY_KEYWORDS = [
    "GRE practice questions",
    "GMAT practice questions",
    "GRE verbal reasoning",
    "GRE quantitative reasoning",
    "GRE analytical writing",
    "GMAT quantitative aptitude",
    "GMAT verbal ability",
    "GMAT data sufficiency",
    "GRE reading comprehension",
    "GMAT critical reasoning",
    "GRE vocabulary practice",
    "GMAT sentence correction",
    "adaptive GRE practice",
    "adaptive GMAT practice",
    "personalized test prep",
    "AI tutor GRE GMAT",
];

// Location-based Keywords
export const LOCATION_KEYWORDS = [
    "GRE prep USA",
    "GMAT prep USA",
    "GRE preparation online",
    "GMAT preparation online",
    "graduate school test prep",
    "business school test prep",
];

// SEO Page Configurations
export const SEO_PAGES = {
    HOME: {
        title: "AI-Powered GRE & GMAT Test Preparation - Free Practice Tests & Prep",
        description: "Master GRE & GMAT with AI-powered preparation. Get personalized study plans, adaptive practice tests, and expert guidance. Start your free test prep today!",
        keywords: [
            ...PRIMARY_KEYWORDS,
            "free test prep",
            "personalized study plan",
            "adaptive learning",
            "GRE GMAT scores",
        ].join(", "),
        canonical: "/",
    },

    DASHBOARD: {
        title: "Your Personalized GRE GMAT Prep Dashboard - Track Progress & Analytics",
        description: "Monitor your GRE GMAT prep progress with detailed analytics, performance insights, and AI-powered recommendations for improvement.",
        keywords: [
            "GRE progress tracking",
            "GMAT analytics",
            "test prep dashboard",
            "study progress",
            "performance analytics",
        ].join(", "),
        canonical: "/dashboard",
    },

    TEST_SELECTION: {
        title: "Choose Your GRE GMAT Practice Test - Adaptive AI-Powered Preparation",
        description: "Select from comprehensive GRE and GMAT practice tests. Adaptive difficulty, detailed explanations, and instant feedback powered by AI.",
        keywords: [
            "GRE practice test",
            "GMAT practice test",
            "adaptive test prep",
            "AI powered questions",
            "difficulty selection",
        ].join(", "),
        canonical: "/test-selection",
    },

    QUESTION_PRACTICE: {
        title: "GRE GMAT Practice Questions - AI-Powered Test Preparation",
        description: "Practice GRE and GMAT questions with AI-powered explanations, instant feedback, and personalized difficulty adjustment.",
        keywords: [
            "GRE practice questions",
            "GMAT practice questions",
            "AI explanations",
            "instant feedback",
            "question difficulty",
        ].join(", "),
        canonical: "/practice",
    },

    TEST_RESULTS: {
        title: "Your GRE GMAT Test Results - Detailed Analysis & Improvement Plan",
        description: "Get comprehensive analysis of your GRE GMAT test performance with AI-powered insights and personalized improvement recommendations.",
        keywords: [
            "GRE test results",
            "GMAT test results",
            "performance analysis",
            "improvement plan",
            "AI insights",
        ].join(", "),
        canonical: "/results",
    },

    ABOUT: {
        title: "About GREPrep.AI - Revolutionary AI-Powered Test Preparation Platform",
        description: "Learn how GREPrep.AI uses artificial intelligence to provide personalized GRE and GMAT preparation with adaptive learning technology.",
        keywords: [
            "about GREPrep.AI",
            "AI test preparation",
            "adaptive learning",
            "educational technology",
            "GRE GMAT platform",
        ].join(", "),
        canonical: "/about",
    },
};

// Structured Data Templates
export const STRUCTURED_DATA = {
    WEBSITE: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "GREPrep.AI",
        "alternateName": "GRE GMAT AI Preparation",
        "url": "https://greprep.ai",
        "description": "AI-powered GRE and GMAT test preparation platform with adaptive learning",
        "potentialAction": {
            "@type": "SearchAction",
            "target": "https://greprep.ai/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
        }
    },

    EDUCATIONAL_ORGANIZATION: {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "GREPrep.AI",
        "url": "https://greprep.ai",
        "logo": "https://greprep.ai/images/logo.png",
        "description": "AI-powered test preparation for GRE and GMAT exams",
        "educationalCredentialAwarded": "Test Preparation Certification",
        "hasCredential": {
            "@type": "EducationalOccupationalCredential",
            "credentialCategory": "Test Preparation",
            "educationalLevel": "Graduate Level"
        }
    },

    COURSE: {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": "AI-Powered GRE GMAT Preparation",
        "description": "Comprehensive GRE and GMAT test preparation with AI-powered adaptive learning",
        "provider": {
            "@type": "Organization",
            "name": "GREPrep.AI"
        },
        "educationalLevel": "Graduate Level",
        "courseMode": "Online",
        "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "Online",
            "courseSchedule": "Self-paced"
        }
    },

    SOFTWARE_APPLICATION: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "GREPrep.AI Test Preparation Platform",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web Browser",
        "description": "AI-powered GRE and GMAT test preparation with adaptive learning",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "1250",
            "bestRating": "5",
            "worstRating": "1"
        }
    }
};

export default {
    SEO_CONFIG,
    PRIMARY_KEYWORDS,
    SECONDARY_KEYWORDS,
    LOCATION_KEYWORDS,
    SEO_PAGES,
    STRUCTURED_DATA,
};
