import { useState, useEffect } from "react";

const useQuestionState = (userAnswers = {}, question, selectedAnswer, currentQuestionIndex, questionNumber) => {
    const actualQuestionIndex = questionNumber ? questionNumber - 1 : currentQuestionIndex ?? 0;
    const [localAnswers, setLocalAnswers] = useState(userAnswers);
    const userAnswersString = JSON.stringify(userAnswers || {});

    // Sync with external userAnswers changes
    useEffect(() => {
        const parsedUserAnswers = JSON.parse(userAnswersString);
        if (Object.keys(parsedUserAnswers).length === 0) {
            setLocalAnswers({});
        }
    }, [userAnswersString]);

    // Handle initial selected answer
    useEffect(() => {
        if (
            selectedAnswer !== undefined &&
            question?.options?.[selectedAnswer] &&
            !(actualQuestionIndex in localAnswers)
        ) {
            const opt = question.options[selectedAnswer];
            const selectedValue =
                typeof opt === "string" ? opt : opt.text || opt.label || opt.value;
            setLocalAnswers((prev) => ({
                ...prev,
                [actualQuestionIndex]: selectedValue,
            }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actualQuestionIndex, selectedAnswer]);

    const handleAnswerSelect = (value, onAnswer, onAnswerSelect) => {
        const optionIndex = question.options?.findIndex((option) => {
            const optionValue =
                typeof option === "string"
                    ? option
                    : option.text || option.label || option.value;
            return optionValue === value;
        });

        const updatedAnswers = { ...localAnswers, [actualQuestionIndex]: value };
        setLocalAnswers(updatedAnswers);

        if (onAnswer) onAnswer(optionIndex);
        if (onAnswerSelect) onAnswerSelect(value);
    };

    const getCurrentSelectedValue = () => {
        return localAnswers[actualQuestionIndex] ||
            (selectedAnswer !== undefined && question.options?.[selectedAnswer]
                ? typeof question.options[selectedAnswer] === "string"
                    ? question.options[selectedAnswer]
                    : question.options[selectedAnswer].text ||
                    question.options[selectedAnswer].label ||
                    question.options[selectedAnswer].value
                : "");
    };

    return {
        actualQuestionIndex,
        localAnswers,
        handleAnswerSelect,
        getCurrentSelectedValue,
    };
};

export default useQuestionState;
