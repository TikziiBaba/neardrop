"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { UserProfile } from "@/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const supabase = useMemo(() => createClient(), []);

  // Helper: fetch profile from Supabase and build UserProfile
  const fetchProfile = useCallback(async (userId: string, email: string): Promise<UserProfile | null> => {
    if (!supabase) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profile) {
      return {
        id: profile.id,
        email: profile.email || email,
        displayName: profile.display_name || email.split("@")[0] || "User",
        avatarUrl: profile.avatar_url,
        quotaBytes: profile.quota_bytes || 10737418240,
        usedBytes: profile.used_bytes || 0,
        createdAt: profile.created_at,
        updatedAt: profile.updated_at,
      };
    }

    // Profile may not exist yet (trigger delay), return minimal
    return {
      id: userId,
      email,
      displayName: email.split("@")[0] || "User",
      quotaBytes: 10737418240,
      usedBytes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchProfile(session.user.id, session.user.email || "");
          setUser(profile);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen to auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email || "");
        setUser(profile);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // Optionally refresh profile on token refresh
        const profile = await fetchProfile(session.user.id, session.user.email || "");
        setUser(profile);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase) {
      return { success: false, error: "Supabase is not configured. Please check your environment variables." };
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
      return { success: false, error: "Supabase is not configured. Please check your environment variables." };
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

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user || !supabase) return;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    setUser(updated);

    await supabase.from("profiles").update({
      display_name: updated.displayName,
      avatar_url: updated.avatarUrl,
      updated_at: updated.updatedAt,
    }).eq("id", user.id);
  }, [user, supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
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
