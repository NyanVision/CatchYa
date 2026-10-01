import React, { createContext, useContext, useMemo, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createLocalTestAccount, removeLocalTestAccount, signInLocalTestAccount } from "@/services/localTestAuth";

WebBrowser.maybeCompleteAuthSession();

type AuthStatus = "signedOut" | "onboarding" | "signedIn";

interface AuthContextValue {
  status: AuthStatus;
  userId: string | null;
  error: string | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  createAccount: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  completeOnboarding: () => void;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Replace with your real client IDs from the Google Cloud console.
// Each platform needs its own OAuth client (see README "Wiring up real auth").
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string>;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("signedOut");
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    let active = true;
    AsyncStorage.getItem("catchya:lastUser").then((savedUserId) => {
      if (active && savedUserId) { setUserId(savedUserId); setStatus("signedIn"); }
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const [googleRequest, googleResponse, promptGoogleAuth] = Google.useAuthRequest({
    webClientId: extra.googleExpoClientId,
    iosClientId: extra.googleIosClientId,
    androidClientId: extra.googleAndroidClientId,
  });

  React.useEffect(() => {
    if (googleResponse?.type === "success") {
      const token = googleResponse.authentication?.accessToken;
      if (!token) { setError("Google sign-in returned no access token. Check the OAuth client configuration."); return; }
      setLoading(true);
      fetch("https://www.googleapis.com/oauth2/v3/userinfo", { headers: { Authorization: `Bearer ${token}` } })
        .then(async (response) => {
          if (!response.ok) throw new Error("Google account lookup failed.");
          return response.json() as Promise<{ sub?: string }>;
        })
        .then(async (user) => {
          if (!user.sub) throw new Error("Google did not return an account ID.");
          const id = `google:${user.sub}`;
          setUserId(id);
          await AsyncStorage.setItem("catchya:lastUser", id);
          setStatus("onboarding");
        })
        .catch(() => setError("Google sign-in could not finish. Check your connection and OAuth setup, then try again."))
        .finally(() => setLoading(false));
    } else if (googleResponse?.type === "error") {
      setError(googleResponse.error?.message ?? "Google sign-in failed. Check your OAuth client settings.");
    }
  }, [googleResponse]);

  const signInWithGoogle = async () => {
    setError(null);
    const configuredIds = [extra.googleExpoClientId, extra.googleIosClientId, extra.googleAndroidClientId].filter((id) => !!id && !id.startsWith("REPLACE_WITH"));
    if (configuredIds.length === 0) {
      setError("Google sign-in is not configured. Add googleExpoClientId, googleIosClientId, and googleAndroidClientId to app.json extra and configure the matching OAuth clients in Google Cloud Console.");
      return;
    }
    if (!googleRequest) {
      setError("Google sign-in is still initializing. Please try again in a moment.");
      return;
    }
    setLoading(true);
    try {
      const result = await promptGoogleAuth();
      if (result.type === "cancel" || result.type === "dismiss") setError("Google sign-in was cancelled.");
      else if (result.type !== "success") setError("Google sign-in did not complete. Please try again.");
    } catch {
      setError("Google sign-in failed. Check the OAuth client configuration and try again.");
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setLoading(true);
    try {
      const id = await signInLocalTestAccount(email, password);
      setUserId(id);
      await AsyncStorage.setItem("catchya:lastUser", id);
      setStatus("signedIn");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not sign in to this device’s test account.");
    } finally { setLoading(false); }
  };

  const createAccount = async (email: string, password: string) => {
    setError(null);
    if (!email || !password) {
      setError("Fill in every field to create your account.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const id = await createLocalTestAccount(email, password);
      setUserId(id);
      await AsyncStorage.setItem("catchya:lastUser", id);
      setStatus("onboarding");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not create a local test account.");
    } finally { setLoading(false); }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    if (!email.trim()) { setError("Enter your email address first."); return; }
    setLoading(true);
    setError("Password reset emails are unavailable in local testing mode. Create another local test account or sign in with the password used at registration.");
    setLoading(false);
  };

  const completeOnboarding = () => setStatus("signedIn");

  const signOut = async () => {
    setUserId(null);
    setStatus("signedOut");
    await AsyncStorage.removeItem("catchya:lastUser");
  };

  const deleteAccount = async () => {
    const userKey = userId ?? "local";
    await AsyncStorage.multiRemove([
      `catchya:profile:${userKey}`,
      `catchya:aboutYou:${userKey}`,
      `catchya:discovery:${userKey}`,
      `catchya:notificationsEnabled:${userKey}`,
      "catchya:inboxConversations",
      "catchya:blockedProfiles",
      "catchya:profileReports",
      "catchya:outgoingMessageRequests",
      "catchya:lastUser",
    ]);
    if (userKey.startsWith("local-test:")) await removeLocalTestAccount(userKey);
    setError(null);
    setUserId(null);
    setStatus("signedOut");
  };

  const value = useMemo(
    () => ({
      status,
      userId,
      error,
      loading,
      signInWithGoogle,
      signInWithEmail,
      createAccount,
      resetPassword,
      completeOnboarding,
      signOut,
      deleteAccount,
      clearError: () => setError(null),
    }),
    [status, userId, error, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
