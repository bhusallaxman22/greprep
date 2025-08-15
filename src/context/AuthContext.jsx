import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import {
  onAuthStateChanged,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { AuthContext } from "./AuthContextBase";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInAsGuest = React.useCallback(async () => {
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error) {
      console.error("Error signing in as guest:", error);
      throw error;
    }
  }, []);

  const signUp = React.useCallback(async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (displayName) {
        await updateProfile(result.user, { displayName });
      }
      return result.user;
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  }, []);

  const signIn = React.useCallback(async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  }, []);

  const signInWithGoogle = React.useCallback(async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  }, []);

  const logout = React.useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  }, []);

  const resetPassword = React.useCallback(async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  }, []);

  const updateUserPassword = React.useCallback(async (newPassword) => {
    try {
      await updatePassword(auth.currentUser, newPassword);
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  }, []);

  const updateUserProfile = React.useCallback(async (updates) => {
    try {
      await updateProfile(auth.currentUser, updates);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }, []);

  const value = React.useMemo(
    () => ({
      user,
      loading,
      signInAsGuest,
      signUp,
      signIn,
      signInWithGoogle,
      logout,
      resetPassword,
      updateUserPassword,
      updateUserProfile,
    }),
    [
      user,
      loading,
      signInAsGuest,
      signUp,
      signIn,
      signInWithGoogle,
      logout,
      resetPassword,
      updateUserPassword,
      updateUserProfile,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
