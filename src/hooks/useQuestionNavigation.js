const useQuestionNavigation = (
    actualQuestionIndex,
    totalQuestions,
    flaggedQuestions,
    onNext,
    onNextQuestion,
    onPrevious,
    onPreviousQuestion,
    onFinish,
    onFinishTest
) => {
    const progressPercentage =
        totalQuestions > 0 ? ((actualQuestionIndex + 1) / totalQuestions) * 100 : 0;

    const isLastQuestion = actualQuestionIndex === totalQuestions - 1;
    const isFirstQuestion = actualQuestionIndex === 0;
    const isQuestionFlagged = flaggedQuestions.includes(actualQuestionIndex);

    const handleNextQuestion = onNext || onNextQuestion || (() => { });
    const handlePreviousQuestion = onPrevious || onPreviousQuestion || (() => { });

    const handleFinishTest = (localAnswers) => {
        if (onFinish) onFinish(localAnswers);
        if (onFinishTest) onFinishTest(localAnswers);
    };

    return {
        progressPercentage,
        isLastQuestion,
        isFirstQuestion,
        isQuestionFlagged,
        handleNextQuestion,
        handlePreviousQuestion,
        handleFinishTest,
    };
};

export default useQuestionNavigation;
