"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { UserProfile } from "@/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loginAsDemoUser: () => void;
}

const DEFAULT_DEMO_USER: UserProfile = {
  id: "usr_demo_88294",
  email: "bekir@neardrop.dev",
  displayName: "Bekir",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  quotaBytes: 10 * 1024 * 1024 * 1024, // 10 GB
  usedBytes: 2.4 * 1024 * 1024 * 1024, // 2.4 GB
  createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
  updatedAt: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = "neardrop_auth_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemo, setIsDemo] = useState<boolean>(false);

  const supabase = isSupabaseConfigured() ? createClient() : null;

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Fetch profile
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            if (profile) {
              setUser({
                id: profile.id,
                email: profile.email,
                displayName: profile.display_name || session.user.email?.split("@")[0] || "User",
                avatarUrl: profile.avatar_url,
                quotaBytes: profile.quota_bytes || 10737418240,
                usedBytes: profile.used_bytes || 0,
                createdAt: profile.created_at,
                updatedAt: profile.updated_at,
              });
              setIsDemo(false);
              setIsLoading(false);
              return;
            }
          }
        }

        // Check local storage for persistent demo user
        const storedUser = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          setIsDemo(true);
        } else {
          // Default to active demo user for instant out-of-the-box exploration
          setUser(DEFAULT_DEMO_USER);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(DEFAULT_DEMO_USER));
          setIsDemo(true);
        }
      } catch (err) {
        console.error("Auth init error:", err);
        setUser(DEFAULT_DEMO_USER);
        setIsDemo(true);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
          const userObj: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            displayName: profile?.display_name || email.split("@")[0],
            avatarUrl: profile?.avatar_url,
            quotaBytes: profile?.quota_bytes || 10737418240,
            usedBytes: profile?.used_bytes || 0,
            createdAt: profile?.created_at || new Date().toISOString(),
            updatedAt: profile?.updated_at || new Date().toISOString(),
          };
          setUser(userObj);
          setIsDemo(false);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userObj));
          return { success: true };
        }
      }

      // Demo login
      const demoUser: UserProfile = {
        id: `usr_${Math.random().toString(36).substring(2, 9)}`,
        email,
        displayName: email.split("@")[0] || "NearDrop User",
        quotaBytes: 10737418240,
        usedBytes: 1824000000,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(demoUser);
      setIsDemo(true);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoUser));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to log in" };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName },
          },
        });
        if (error) throw error;
        if (data.user) {
          const userObj: UserProfile = {
            id: data.user.id,
            email: data.user.email || email,
            displayName: displayName || email.split("@")[0],
            quotaBytes: 10737418240,
            usedBytes: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setUser(userObj);
          setIsDemo(false);
          localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(userObj));
          return { success: true };
        }
      }

      const newUser: UserProfile = {
        id: `usr_${Math.random().toString(36).substring(2, 9)}`,
        email,
        displayName: displayName || email.split("@")[0],
        quotaBytes: 10737418240,
        usedBytes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setUser(newUser);
      setIsDemo(true);
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
      return { success: true };
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
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    setUser(null);
  };

  const loginAsDemoUser = () => {
    setUser(DEFAULT_DEMO_USER);
    setIsDemo(true);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(DEFAULT_DEMO_USER));
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    setUser(updated);
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(updated));

    if (supabase && !isDemo) {
      await supabase.from("profiles").update({
        display_name: updated.displayName,
        avatar_url: updated.avatarUrl,
        updated_at: updated.updatedAt,
      }).eq("id", user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isDemoMode: isDemo,
        login,
        register,
        logout,
        updateProfile,
        loginAsDemoUser,
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
