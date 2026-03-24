import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

interface AuthUser {
  id: string; // UUID
  fullName: string;
  email: string;
  company: string;
  role: string;
  plan: string;
  avatarInitials: string;
  twoFactorEnabled: boolean;
  createdAt: Date;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { fullName: string; email: string; password: string; company?: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function buildAuthUser(session: Session): AuthUser {
  const u = session.user;
  const meta = u.user_metadata || {};
  const fullName: string = meta.full_name || u.email?.split("@")[0] || "User";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return {
    id: u.id,
    fullName,
    email: u.email || "",
    company: meta.company || "",
    role: meta.role || "admin",
    plan: meta.plan || "starter",
    avatarInitials: meta.avatar_initials || initials,
    twoFactorEnabled: meta.two_factor_enabled || false,
    createdAt: new Date(u.created_at),
  };
}

async function loadProfileData(userId: string): Promise<Partial<AuthUser>> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email, company, role, plan, avatar_initials, two_factor_enabled, created_at")
      .eq("id", userId)
      .single();
    if (!data) return {};
    return {
      fullName: data.full_name,
      email: data.email,
      company: data.company,
      role: data.role,
      plan: data.plan,
      avatarInitials: data.avatar_initials,
      twoFactorEnabled: data.two_factor_enabled,
      createdAt: new Date(data.created_at),
    };
  } catch {
    return {};
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from existing session
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        const base = buildAuthUser(session);
        const profile = await loadProfileData(session.user.id);
        setUser({ ...base, ...profile });
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const base = buildAuthUser(session);
        const profile = await loadProfileData(session.user.id);
        setUser({ ...base, ...profile });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(`401: ${error.message}`);
    if (data.session) {
      const base = buildAuthUser(data.session);
      const profile = await loadProfileData(data.session.user.id);
      setUser({ ...base, ...profile });
    }
  }, []);

  const signup = useCallback(async (data: { fullName: string; email: string; password: string; company?: string }) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          company: data.company || "",
        },
      },
    });
    if (error) throw new Error(`400: ${error.message}`);

    if (authData.user) {
      // Insert profile row
      const initials = data.fullName
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      await supabase.from("profiles").upsert({
        id: authData.user.id,
        full_name: data.fullName,
        email: data.email,
        company: data.company || "",
        role: "admin",
        plan: "starter",
        avatar_initials: initials,
        two_factor_enabled: false,
      });
      if (authData.session) {
        const base = buildAuthUser(authData.session);
        setUser({ ...base });
      }
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
