import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { User } from "@shared/schema";

// MOCKED AUTH STATE for UI demonstration
// In a real app, this would use React Query and hit /api/auth/me
const MOCK_USER: User = {
  id: "1",
  email: "member@example.com",
  password: "hashed",
  name: "Jane Doe",
  role: "member"
};

const MOCK_ADMIN: User = {
  id: "2",
  email: "admin@example.com",
  password: "hashed",
  name: "Admin User",
  role: "admin"
};

// Global simulated state
let currentUser: User | null = null;

export function useAuth() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(currentUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, _password: string) => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));

    let loggedInUser = MOCK_USER;
    if (email.includes("admin")) {
      loggedInUser = MOCK_ADMIN;
    } else {
      loggedInUser = { ...MOCK_USER, email };
    }

    currentUser = loggedInUser;
    setUser(loggedInUser);
    setIsLoading(false);

    if (loggedInUser.role === 'admin') {
      setLocation('/admin');
    } else {
      setLocation('/dashboard');
    }
  };

  const register = async (email: string, name: string, _password: string) => {
    setIsLoading(true);
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1000));

    let newUser = { ...MOCK_USER, email, name, id: Date.now().toString() };
    if (email.includes("admin")) {
      newUser.role = "admin";
    }

    currentUser = newUser;
    setUser(newUser);
    setIsLoading(false);

    if (newUser.role === 'admin') {
      setLocation('/admin');
    } else {
      setLocation('/dashboard');
    }
  };

  const logout = () => {
    currentUser = null;
    setUser(null);
    setLocation('/');
  };

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };
}
