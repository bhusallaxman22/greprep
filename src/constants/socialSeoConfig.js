// Social Media and SEO Meta Tags Configuration
export const socialMediaConfig = {
    // Open Graph images for different test types
    images: {
        default: "/images/og-greprep-ai.jpg",
        gre: "/images/og-gre-prep.jpg",
        gmat: "/images/og-gmat-prep.jpg",
        practice: "/images/og-practice-test.jpg",
        results: "/images/og-test-results.jpg"
    },

    // Twitter Card configurations
    twitter: {
        cardType: "summary_large_image",
        site: "@GREPrepAI",
        creator: "@GREPrepAI"
    },

    // Facebook/LinkedIn specific tags
    facebook: {
        appId: "123456789", // Replace with actual Facebook App ID
        admins: "admin_id" // Replace with Facebook admin ID
    }
};

// Rich Snippets and Featured Snippet optimization
export const richSnippetsConfig = {
    // FAQ Schema for featured snippets
    faqData: [
        {
            question: "How effective is AI-powered GRE preparation?",
            answer: "AI-powered GRE preparation is highly effective, providing personalized learning paths, adaptive question difficulty, and real-time feedback that can improve scores by 20-40 points on average."
        },
        {
            question: "What makes GREPrep.AI different from other test prep platforms?",
            answer: "GREPrep.AI uses advanced artificial intelligence to generate unlimited practice questions, provide instant detailed explanations, and adapt to your learning style for maximum efficiency."
        },
        {
            question: "How long should I prepare for the GRE using AI preparation?",
            answer: "With AI-powered preparation, most students see significant improvement in 4-8 weeks with consistent daily practice of 1-2 hours using our adaptive learning system."
        },
        {
            question: "Is the GMAT preparation different from GRE preparation?",
            answer: "Yes, our AI platform provides specific preparation for both exams, with GMAT focusing on business school requirements and GRE on graduate school admissions."
        },
        {
            question: "Can I track my progress with AI-powered test prep?",
            answer: "Absolutely! Our AI provides detailed analytics, performance insights, and personalized recommendations to track your improvement and identify areas for focus."
        }
    ],

    // HowTo Schema for ranking
    howToData: {
        name: "How to Prepare for GRE/GMAT with AI Technology",
        description: "Complete guide to using AI-powered preparation for GRE and GMAT success",
        steps: [
            {
                name: "Take Initial Assessment",
                text: "Complete our AI-powered diagnostic test to identify your current skill level and areas for improvement."
            },
            {
                name: "Get Personalized Study Plan",
                text: "Receive a customized study plan based on your goals, timeline, and current performance level."
            },
            {
                name: "Practice with Adaptive Questions",
                text: "Use our AI-generated practice questions that adapt to your skill level and learning pace."
            },
            {
                name: "Review AI Feedback",
                text: "Get instant, detailed explanations and feedback on every question to understand concepts thoroughly."
            },
            {
                name: "Track Progress",
                text: "Monitor your improvement with detailed analytics and adjust your study plan as needed."
            }
        ]
    }
};

export default {
    socialMediaConfig,
    richSnippetsConfig
};
