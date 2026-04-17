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
  isSuperAdmin: boolean;
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
    try {
      const data = await apiRequest<{ user: User; token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setUser(data.user);
      await queryClient.invalidateQueries();
      const destination = data.user.role === "super_admin" 
        ? "/super-admin" 
        : (!data.user.organizationId ? "/setup/pricing" : (data.user.role === "admin" ? "/admin" : "/dashboard"));
        
      router.push(destination);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, name: string, password: string) => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ user: User; token: string }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, name, password }),
      });
      setUser(data.user);
      await queryClient.invalidateQueries();
      
      const destination = data.user.role === "super_admin" 
        ? "/super-admin" 
        : (!data.user.organizationId ? "/setup/pricing" : (data.user.role === "admin" ? "/admin" : "/dashboard"));

      router.push(destination);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiRequest<{ success: boolean }>("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({}),
      });
      setUser(null);
      queryClient.clear();
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin" || user?.role === "super_admin",
      isSuperAdmin: user?.role === "super_admin",
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

export function useRequireAuth(adminOnly = false, superAdminOnly = false) {
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

    if (auth.user && auth.user.role !== "super_admin" && !auth.user.organizationId && !pathname.startsWith("/setup")) {
      router.replace("/setup/pricing");
      return;
    }

    if (superAdminOnly && auth.user.role !== "super_admin") {
      router.replace("/dashboard");
      return;
    }

    if (adminOnly && !["admin", "super_admin"].includes(auth.user.role)) {
      router.replace("/dashboard");
    }
  }, [adminOnly, auth.isLoading, auth.user, pathname, router, superAdminOnly]);

  return auth;
}
