import { useState, useCallback } from 'react';

export default function useMenu() {
    const [anchorEl, setAnchorEl] = useState(null);

    const openMenu = useCallback((event) => setAnchorEl(event.currentTarget), []);
    const closeMenu = useCallback(() => setAnchorEl(null), []);

    return {
        anchorEl,
        isOpen: Boolean(anchorEl),
        openMenu,
        closeMenu,
    };
}
