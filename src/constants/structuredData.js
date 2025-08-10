// Structured data configurations for rich snippets and better search ranking
export const structuredData = {
    organization: {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": "GRE GMAT AI Prep",
        "description": "Advanced AI-powered GRE and GMAT preparation platform with personalized learning and real-time feedback",
        "url": "https://greprep.academy",
        "logo": "https://greprep.academy/logo.png",
        "sameAs": [
            "https://twitter.com/gregmatprep",
            "https://linkedin.com/company/gregmatprep"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-800-GRE-GMAT",
            "contactType": "customer service"
        }
    },

    course: {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": "AI-Powered GRE & GMAT Preparation",
        "description": "Comprehensive test preparation with AI-driven question generation, personalized feedback, and adaptive learning",
        "provider": {
            "@type": "EducationalOrganization",
            "name": "GRE GMAT AI Prep"
        },
        "educationalLevel": "Graduate",
        "coursePrerequisites": "Bachelor's degree or equivalent",
        "courseMode": "online",
        "offers": {
            "@type": "Offer",
            "category": "free trial",
            "priceCurrency": "USD",
            "price": "0"
        }
    },

    product: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "GRE GMAT AI Prep Platform",
        "description": "Advanced AI-powered test preparation software for GRE and GMAT exams",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web-based",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "1847",
            "bestRating": "5",
            "worstRating": "1"
        }
    },

    faq: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What makes your GRE prep different from other platforms?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our AI-powered platform generates unlimited practice questions, provides real-time feedback, and adapts to your learning style for maximum score improvement."
                }
            },
            {
                "@type": "Question",
                "name": "How does the AI evaluation work for GMAT preparation?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Our advanced AI analyzes your responses, identifies weak areas, and provides personalized recommendations to improve your GMAT performance efficiently."
                }
            },
            {
                "@type": "Question",
                "name": "Is the AI preparation platform free to use?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, we offer a comprehensive free tier with unlimited practice questions and AI feedback to help you succeed on your GRE or GMAT exam."
                }
            }
        ]
    },

    breadcrumb: {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://greprep.academy"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Test Preparation",
                "item": "https://greprep.academy/test-selection"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": "Practice Tests",
                "item": "https://greprep.academy/practice"
            }
        ]
    }
};

export default structuredData;
