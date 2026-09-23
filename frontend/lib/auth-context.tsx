"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "./types";
import { api } from "./api";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  demoLogin: (role: "organizer" | "judge" | "participant") => Promise<User>;
  logout: () => void;
  switchDemoRole: (role: "organizer" | "judge" | "participant") => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function loadUser() {
      const savedToken = api.getToken();
      if (savedToken) {
        setToken(savedToken);
        try {
          const currentUser = await api.getMe();
          setUser(currentUser);
        } catch {
          api.setToken(null);
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
      setToken(res.access_token);
      redirectToDashboard(res.user.role);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setToken(res.access_token);
      redirectToDashboard(res.user.role);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const demoLogin = async (targetRole: "organizer" | "judge" | "participant"): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.demoLogin(targetRole);
      setUser(res.user);
      setToken(res.access_token);
      redirectToDashboard(res.user.role);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const switchDemoRole = async (targetRole: "organizer" | "judge" | "participant") => {
    await demoLogin(targetRole);
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    setToken(null);
    router.push("/login");
  };

  const redirectToDashboard = (userRole: UserRole) => {
    switch (userRole) {
      case "ORGANIZER":
        router.push("/organizer/dashboard");
        break;
      case "JUDGE":
        router.push("/judge/dashboard");
        break;
      case "PARTICIPANT":
        router.push("/participant/dashboard");
        break;
      default:
        router.push("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        switchDemoRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
