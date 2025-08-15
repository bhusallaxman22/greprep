// Centralized fallback questions for when AI generation fails
// Keep lightweight, text-only (no images)

export const fallbackQuestions = {
    GRE: {
        verbal: {
            easy: {
                question:
                    "Choose the word that best completes the sentence: The scientist's _____ approach to research yielded unexpected discoveries.",
                options: ["methodical", "careless", "rushed", "biased", "random"],
                correctAnswer: 0,
                explanation:
                    "Methodical means systematic and orderly, which would be most likely to yield discoveries in scientific research.",
            },
            medium: {
                passage:
                    "The concept of artificial intelligence has evolved dramatically since its inception in the 1950s. Early researchers were optimistic about creating machines that could think and reason like humans within a few decades. However, the complexity of human cognition proved far greater than initially anticipated. While modern AI systems excel at specific tasks like chess, image recognition, and language translation, they still lack the general intelligence and adaptability that characterizes human thinking. Recent advances in machine learning and neural networks have renewed interest in artificial general intelligence, though experts remain divided on whether and when such systems might be achieved.",
                question:
                    "According to the passage, what can be inferred about early AI researchers?",
                options: [
                    "They accurately predicted the timeline for achieving human-level AI",
                    "They underestimated the complexity of human cognition",
                    "They focused primarily on specific task-oriented applications",
                    "They were pessimistic about the potential for machine intelligence",
                    "They successfully created machines with general intelligence"
                ],
                correctAnswer: 1,
                explanation:
                    "The passage states that early researchers were optimistic about creating thinking machines within a few decades, but the complexity of human cognition proved greater than anticipated, indicating they underestimated this complexity.",
            },
            hard: {
                question:
                    "The relationship between 'verbose' and 'concise' is most similar to the relationship between:",
                options: [
                    "abundant : scarce",
                    "bright : luminous",
                    "fast : quick",
                    "large : huge",
                    "happy : joyful",
                ],
                correctAnswer: 0,
                explanation:
                    "Verbose and concise are antonyms, just as abundant and scarce are opposite in meaning.",
            },
        },
        reading: {
            medium: {
                passage:
                    "Climate change represents one of the most pressing challenges of our time, with far-reaching implications for ecosystems, human societies, and economic systems worldwide. The scientific consensus overwhelmingly supports the conclusion that human activities, particularly the emission of greenhouse gases from fossil fuel combustion, are the primary drivers of recent climate change. Evidence for this warming trend includes rising global temperatures, melting ice sheets, rising sea levels, and shifting precipitation patterns. However, the complexity of climate systems means that impacts vary significantly by geographic region and time scale. Some areas may experience more severe droughts, while others face increased flooding. Understanding these regional variations is crucial for developing effective adaptation and mitigation strategies.",
                question:
                    "The author's primary purpose in this passage is to:",
                options: [
                    "Argue that climate change impacts are uniform across all regions",
                    "Provide an overview of climate change causes and varied regional impacts",
                    "Criticize the scientific consensus on climate change",
                    "Focus exclusively on economic implications of climate change",
                    "Propose specific solutions for climate change mitigation"
                ],
                correctAnswer: 1,
                explanation:
                    "The passage provides a general overview of climate change causes and emphasizes that impacts vary by region, making option B the best description of the author's primary purpose.",
            }
        },
        quantitative: {
            easy: {
                question: "If x + 5 = 12, what is the value of x?",
                options: ["5", "6", "7", "8", "9"],
                correctAnswer: 2,
                explanation: "Subtract 5 from both sides: x = 12 - 5 = 7",
            },
            medium: {
                question: "What is 15 percent of 240?",
                options: ["30", "32", "34", "36", "38"],
                correctAnswer: 3,
                explanation: "Fifteen percent of 240 is 0.15 times 240, which equals 36",
            },
            hard: {
                question:
                    "If the probability of rain is 0.3 and the probability of wind is 0.4, and these events are independent, what is the probability of both rain and wind?",
                options: ["0.12", "0.15", "0.18", "0.21", "0.24"],
                correctAnswer: 0,
                explanation:
                    "For independent events, the probability of both is the product: 0.3 times 0.4 equals 0.12",
            },
        },
    },
    GMAT: {
        verbal: {
            easy: {
                question:
                    "Which of the following best corrects the sentence: 'The company has been more successful than their competitors.'",
                options: [
                    "The company has been more successful than its competitors.",
                    "The company has been more successful than there competitors.",
                    "The company has been more successful than they're competitors.",
                    "The company has been more successful than their competitors.",
                    "The company has been more successful then their competitors.",
                ],
                correctAnswer: 0,
                explanation:
                    "Use 'its' (possessive) instead of 'their' when referring to a singular company.",
            },
        },
        quantitative: {
            easy: {
                question:
                    "A store sells apples for 2 dollars per pound. If John buys 3.5 pounds of apples, how much does he pay?",
                options: ["$6.00", "$6.50", "$7.00", "$7.50", "$8.00"],
                correctAnswer: 2,
                explanation: "Three point five pounds times two dollars per pound equals seven dollars.",
            },
        },
        integrated: {
            easy: {
                question:
                    "Based on the data table showing monthly sales figures, which quarter had the highest average sales?",
                chartData: {
                    type: "table",
                    headers: ["Month", "Sales ($1000s)"],
                    rows: [
                        ["Jan", "150"], ["Feb", "180"], ["Mar", "200"],
                        ["Apr", "175"], ["May", "165"], ["Jun", "190"],
                        ["Jul", "210"], ["Aug", "225"], ["Sep", "195"],
                        ["Oct", "180"], ["Nov", "170"], ["Dec", "185"]
                    ]
                },
                options: ["Q1 (Jan-Mar)", "Q2 (Apr-Jun)", "Q3 (Jul-Sep)", "Q4 (Oct-Dec)", "All quarters equal"],
                correctAnswer: 2,
                explanation: "Q3 has the highest average: (210 + 225 + 195) / 3 = 210, compared to Q1: 177, Q2: 177, Q4: 178.",
            },
            medium: {
                question:
                    "The chart shows company revenue by region. If the company wants to allocate 40% of its marketing budget proportionally by revenue, how much should be allocated to the highest-performing region?",
                chartData: {
                    type: "pie",
                    data: [
                        { region: "North America", revenue: 4500000, percentage: 45 },
                        { region: "Europe", revenue: 3000000, percentage: 30 },
                        { region: "Asia Pacific", revenue: 2000000, percentage: 20 },
                        { region: "Other", revenue: 500000, percentage: 5 }
                    ]
                },
                options: ["18% of budget", "20% of budget", "30% of budget", "40% of budget", "45% of budget"],
                correctAnswer: 0,
                explanation: "North America has 45% of revenue, so gets 45% of the 40% allocation = 0.45 × 0.40 = 0.18 = 18%.",
            },
            hard: {
                question:
                    "According to the multi-year trend analysis, which statement best describes the relationship between customer satisfaction and revenue growth?",
                chartData: {
                    type: "line",
                    data: [
                        { year: 2020, satisfaction: 75, revenue_growth: 5 },
                        { year: 2021, satisfaction: 80, revenue_growth: 8 },
                        { year: 2022, satisfaction: 78, revenue_growth: 6 },
                        { year: 2023, satisfaction: 85, revenue_growth: 12 },
                        { year: 2024, satisfaction: 87, revenue_growth: 15 }
                    ]
                },
                options: [
                    "No correlation exists between satisfaction and revenue",
                    "Higher satisfaction generally correlates with higher revenue growth",
                    "Revenue growth causes satisfaction to increase",
                    "Satisfaction has been declining while revenue grows",
                    "The relationship is perfectly linear"
                ],
                correctAnswer: 1,
                explanation: "The data shows a general positive correlation: as satisfaction increases from 75% to 87%, revenue growth increases from 5% to 15%, despite some fluctuation in 2022.",
            },
        },
    },
};

export default fallbackQuestions;
