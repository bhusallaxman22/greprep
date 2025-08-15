// Validation and post-processing for question objects

export function validateQuestion(question) {
    if (!question || typeof question !== 'object') return false;

    // Check question text
    if (typeof question.question !== 'string' || question.question.trim().length < 3) return false;

    // Check options array
    if (!Array.isArray(question.options)) return false;
    if (question.options.length < 4 || question.options.length > 5) return false;

    // Check correct answer index
    if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) return false;

    // Check explanation
    if (typeof question.explanation !== 'string' || question.explanation.trim().length < 3) return false;

    // Check that all options are valid strings
    for (const option of question.options) {
        if (typeof option !== 'string' || option.trim().length < 1) return false;
    }

    // Validate image fields if present
    if (question.image !== undefined) {
        if (typeof question.image !== 'string' || question.image.trim().length === 0) return false;
        if (!question.imageDescription || typeof question.imageDescription !== 'string' || question.imageDescription.trim().length < 3) return false;
    }

    if (question.imageDescription && !question.image) return false;

    return true;
}

export function postprocessQuestion(q) {
    const question = { ...q };

    // Remove empty passage
    if (!question.passage || (typeof question.passage === 'string' && question.passage.trim().length === 0)) {
        delete question.passage;
    }

    // Image handling
    if (question.image === '' || question.image === null || question.image === undefined) {
        delete question.image;
        delete question.imageDescription;
    } else if (typeof question.image === 'string' && question.image.trim().length > 0) {
        const imageUrl = question.image.trim();
        if (imageUrl.includes('via.placeholder.com') || imageUrl.includes('placeholder')) {
            delete question.image;
            delete question.imageDescription;
        } else {
            if (!question.imageDescription || question.imageDescription.trim().length === 0) {
                question.imageDescription = 'Chart or graph related to the question';
            }
        }
    } else {
        delete question.image;
    }

    if (question.imageDescription && !question.image) delete question.imageDescription;

    return question;
}

export default { validateQuestion, postprocessQuestion };
