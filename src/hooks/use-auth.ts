"use client";

import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/http";
import type { User } from "@/lib/schema";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await apiRequest<{ user: User }>("/api/auth/me", { method: "GET" });
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const data = await apiRequest<{ user: User; token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(data.user);
    await queryClient.invalidateQueries();
    setIsLoading(false);
    router.push(data.user.role === "admin" ? "/admin" : "/dashboard");
  };

  const register = async (email: string, name: string, password: string) => {
    setIsLoading(true);
    const data = await apiRequest<{ user: User; token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, name, password }),
    });
    setUser(data.user);
    await queryClient.invalidateQueries();
    setIsLoading(false);
    router.push(data.user.role === "admin" ? "/admin" : "/dashboard");
  };

  const logout = async () => {
    setIsLoading(true);
    await apiRequest<{ success: boolean }>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({}),
    });
    setUser(null);
    queryClient.clear();
    setIsLoading(false);
    router.push("/");
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      refreshUser,
    }),
    [isLoading, user],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export function useRequireAuth(adminOnly = false) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();

  useEffect(() => {
    if (auth.isLoading) {
      return;
    }

    if (!auth.user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (adminOnly && auth.user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [adminOnly, auth.isLoading, auth.user, pathname, router]);

  return auth;
}
