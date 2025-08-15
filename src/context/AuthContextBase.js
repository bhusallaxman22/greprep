import React from "react";

// Central AuthContext definition exported from its own module to keep Fast Refresh happy
export const AuthContext = React.createContext({
    user: null,
    loading: true,
    signInAsGuest: async () => { },
    signUp: async () => { },
    signIn: async () => { },
    signInWithGoogle: async () => { },
    logout: async () => { },
    resetPassword: async () => { },
    updateUserPassword: async () => { },
    updateUserProfile: async () => { },
});
