export const formatDate = (iso) => {
    try {
        return new Date(iso).toLocaleDateString();
    } catch {
        return '';
    }
};

export const percent = (value, digits = 0) =>
    `${Number(value || 0).toFixed(digits)}%`;
