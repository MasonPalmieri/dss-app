import React, { createContext, useContext, useState, useCallback } from "react";
import { mockApi } from "@/lib/mockApi";

interface AuthUser {
  id: number;
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
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const data = await mockApi.login(email, password);
    setUser(data.user as AuthUser);
  }, []);

  const signup = useCallback(async (data: { fullName: string; email: string; password: string; company?: string }) => {
    const result = await mockApi.register(data.fullName, data.email, data.password, data.company || "");
    setUser(result.user as AuthUser);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
