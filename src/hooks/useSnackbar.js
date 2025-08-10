import { useState, useCallback } from 'react';

export default function useSnackbar(initial = '') {
    const [message, setMessage] = useState(initial);

    const show = useCallback((msg) => setMessage(msg), []);
    const clear = useCallback(() => setMessage(''), []);

    return { message, show, clear };
}
