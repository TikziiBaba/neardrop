"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { UserProfile, UserRole, SubscriptionTier } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (provider: "google" | "github") => Promise<{ success: boolean; error?: string }>;
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

  // Helper: Determine subscription tier from quota
  const determineTier = (quotaBytes: number, dbTier?: string): SubscriptionTier => {
    if (dbTier === "pro" || dbTier === "ultra" || dbTier === "enterprise") {
      return dbTier as SubscriptionTier;
    }
    if (quotaBytes >= 2199023255552) return "enterprise"; // 2 TB
    if (quotaBytes >= 536870912000) return "ultra"; // 500 GB
    if (quotaBytes >= 107374182400) return "pro"; // 100 GB
    return "free";
  };

  // Helper: fetch profile from Supabase and build UserProfile
  const fetchProfile = useCallback(
    async (userId: string, email: string, userMetadata?: any): Promise<UserProfile | null> => {
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
      const quotaBytes = profile?.quota_bytes || 10737418240; // 10 GB default
      const role = determineRole(email, profile?.role);
      const subscriptionTier = determineTier(quotaBytes, profile?.subscription_tier);

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
          subscription_tier: subscriptionTier || "free",
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
        subscriptionTier,
        subscriptionStatus: "active",
        status: "active",
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
          const profile = await fetchProfile(session.user.id, session.user.email || "", session.user.user_metadata);
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
        const profile = await fetchProfile(session.user.id, session.user.email || "", session.user.user_metadata);
        setUser(profile);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email || "", session.user.user_metadata);
        setUser(profile);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: "Supabase is not configured." };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        const profile = await fetchProfile(data.user.id, data.user.email || email);
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

  const register = async (email: string, password: string, displayName: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: "Supabase is not configured." };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      });
      if (error) throw error;
      if (data.user) {
        const profile = await fetchProfile(data.user.id, data.user.email || email);
        setUser(profile);
        return { success: true };
      }
      return { success: false, error: "Registration failed." };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to register" };
    } finally {
      setIsLoading(false);
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

      const updateData = {
        display_name: updated.displayName,
        avatar_url: updated.avatarUrl,
        quota_bytes: updated.quotaBytes,
        updated_at: updated.updatedAt,
      };

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
