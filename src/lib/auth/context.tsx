"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { UserProfile, UserRole, SubscriptionTier } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean }>;
  register: (email: string, password: string, displayName: string, selectedTier?: SubscriptionTier) => Promise<{ success: boolean; error?: string; requiresVerification?: boolean }>;
  signInWithOAuth: (provider: "google" | "github") => Promise<{ success: boolean; error?: string }>;
  resendVerificationEmail: (email?: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtp: (email: string, token: string, type?: "signup" | "email" | "magiclink" | "recovery") => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const supabase = useMemo(() => createClient(), []);

  // Helper: Determine role
  const determineRole = (email: string, dbRole?: string): UserRole => {
    if (dbRole === "admin" || dbRole === "moderator" || dbRole === "premium" || dbRole === "member") {
      return dbRole as UserRole;
    }
    const lower = email.toLowerCase().trim();
    const envAdmins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
      .toLowerCase()
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (envAdmins.length > 0 && envAdmins.includes(lower)) {
      return "admin";
    }
    return "member";
  };

  // Helper: Determine subscription tier
  const determineTier = (quotaBytes: number, dbTier?: string): SubscriptionTier => {
    if (dbTier === "pro" || dbTier === "ultra" || dbTier === "enterprise") {
      return dbTier as SubscriptionTier;
    }
    return "free";
  };

  // Helper: fetch profile from Supabase and build UserProfile
  const fetchProfile = useCallback(
    async (userId: string, email: string, userMetadata?: any, rawUser?: any): Promise<UserProfile | null> => {
      if (!supabase) return null;

      // 1. Check profile by user ID
      let { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      // 2. If not found by ID, look up by email to link same-user accounts (e.g. Google & GitHub)
      if (!profile && email) {
        const { data: profileByEmail } = await supabase
          .from("profiles")
          .select("*")
          .eq("email", email)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (profileByEmail) {
          profile = profileByEmail;
        }
      }

      // 3. Check if there is an existing custom avatar in any profile with this email
      let existingAvatar = profile?.avatar_url;
      if (!existingAvatar && email) {
        const { data: pWithAvatar } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("email", email)
          .not("avatar_url", "is", null)
          .limit(1)
          .maybeSingle();

        if (pWithAvatar?.avatar_url) {
          existingAvatar = pWithAvatar.avatar_url;
        }
      }

      const meta = userMetadata || {};
      const displayName = profile?.display_name || meta.full_name || meta.user_name || meta.name || email.split("@")[0] || "User";
      const avatarUrl = existingAvatar || meta.avatar_url || meta.picture || "";
      const quotaBytes = profile?.quota_bytes || 1099511627776; // 1 TB default free quota
      const role = determineRole(email, profile?.role);
      const subscriptionTier = determineTier(quotaBytes, profile?.subscription_tier);

      // Check email verification status from Supabase user object or OAuth provider
      const emailConfirmedAt = rawUser?.email_confirmed_at || rawUser?.confirmed_at || null;
      const isOAuth = rawUser?.app_metadata?.provider && rawUser.app_metadata.provider !== "email";
      const isEmailVerified = Boolean(emailConfirmedAt || isOAuth);

      if (profile) {
        return {
          id: profile.id,
          email: profile.email || email,
          displayName: profile.display_name || displayName,
          avatarUrl: existingAvatar || avatarUrl,
          quotaBytes,
          usedBytes: profile.used_bytes || 0,
          role,
          subscriptionTier,
          subscriptionStatus: profile.subscription_status || "active",
          subscriptionRenewsAt: profile.subscription_renews_at,
          status: "active",
          isEmailVerified,
          emailConfirmedAt,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        };
      }

      // Auto-insert if profile row doesn't exist yet
      try {
        await supabase.from("profiles").insert({
          id: userId,
          email,
          display_name: displayName,
          avatar_url: avatarUrl,
          quota_bytes: quotaBytes,
          used_bytes: 0,
          role: role || "member",
          subscription_tier: "free",
          subscription_status: "active",
        });
      } catch (e) {
        console.warn("Could not auto-insert profile row:", e);
      }

      return {
        id: userId,
        email,
        displayName,
        avatarUrl,
        quotaBytes,
        usedBytes: 0,
        role,
        subscriptionTier: "free",
        subscriptionStatus: "active",
        status: "active",
        isEmailVerified,
        emailConfirmedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    [supabase]
  );

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchProfile(
            session.user.id,
            session.user.email || "",
            session.user.user_metadata,
            session.user
          );
          setUser(profile);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchProfile(
          session.user.id,
          session.user.email || "",
          session.user.user_metadata,
          session.user
        );
        setUser(profile);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        const profile = await fetchProfile(
          session.user.id,
          session.user.email || "",
          session.user.user_metadata,
          session.user
        );
        setUser(profile);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string; requiresVerification?: boolean }> => {
    if (!supabase) {
      return { success: false, error: "Supabase is not configured." };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          return {
            success: false,
            error: "Email not confirmed. Please check your inbox for the verification link.",
            requiresVerification: true,
          };
        }
        throw error;
      }
      if (data.user) {
        const profile = await fetchProfile(
          data.user.id,
          data.user.email || email,
          data.user.user_metadata,
          data.user
        );
        setUser(profile);
        return { success: true };
      }
      return { success: false, error: "Login failed. Please try again." };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to log in" };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    displayName: string,
    selectedTier: SubscriptionTier = "free"
  ): Promise<{ success: boolean; error?: string; requiresVerification?: boolean }> => {
    if (!supabase) {
      return { success: false, error: "Supabase is not configured." };
    }

    setIsLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
            subscription_tier: "free",
          },
          emailRedirectTo: `${origin}/auth/confirm`,
        },
      });
      if (error) throw error;
      if (data.user) {
        // If session is null or email is not confirmed, verification is needed
        const requiresVerification = !data.session || !data.user.email_confirmed_at;

        if (data.session) {
          const profile = await fetchProfile(
            data.user.id,
            data.user.email || email,
            data.user.user_metadata,
            data.user
          );
          setUser(profile);
        }

        return {
          success: true,
          requiresVerification,
        };
      }
      return { success: false, error: "Registration failed." };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to register" };
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async (targetEmail?: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) return { success: false, error: "Supabase is not configured." };
    const emailToSend = targetEmail || user?.email;
    if (!emailToSend) return { success: false, error: "No email address specified." };

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailToSend,
        options: {
          emailRedirectTo: `${origin}/auth/confirm`,
        },
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to resend confirmation email." };
    }
  };

  const verifyOtp = async (
    email: string,
    token: string,
    type: "signup" | "email" | "magiclink" | "recovery" = "signup"
  ): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) return { success: false, error: "Supabase is not configured." };
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: type as any,
      });
      if (error) throw error;
      if (data?.session?.user) {
        const profile = await fetchProfile(
          data.session.user.id,
          data.session.user.email || email,
          data.session.user.user_metadata,
          data.session.user
        );
        setUser(profile);
        return { success: true };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Invalid or expired confirmation code." };
    }
  };

  const signInWithOAuth = async (provider: "google" | "github"): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: "Supabase is not configured." };
    }

    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${origin}/auth/callback`,
        },
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || `Failed to sign in with ${provider}` };
    }
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user || !supabase) return;
      const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
      setUser(updated);

      const updateData: any = {
        display_name: updated.displayName,
        avatar_url: updated.avatarUrl,
        quota_bytes: updated.quotaBytes,
        updated_at: updated.updatedAt,
      };

      if (updates.role) updateData.role = updates.role;
      if (updates.subscriptionTier) updateData.subscription_tier = updates.subscriptionTier;
      if (updates.subscriptionStatus) updateData.subscription_status = updates.subscriptionStatus;
      if (updates.subscriptionRenewsAt) updateData.subscription_renews_at = updates.subscriptionRenewsAt;

      await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", user.id);

      if (user.email) {
        await supabase
          .from("profiles")
          .update(updateData)
          .eq("email", user.email);
      }
    },
    [user, supabase]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        signInWithOAuth,
        resendVerificationEmail,
        verifyOtp,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
