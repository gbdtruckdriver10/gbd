"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode, } from "react";

export type UserRole = "parent" | "staff" | "admin" | "cfo";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  childrenIds?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "gbd-auth-user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);

      if (storedUser) {
        setUser(JSON.parse(storedUser) as User);
      }
    } catch (error) {
      console.error("Failed to restore auth state:", error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;

    try {
      if (user) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to persist auth state:", error);
    }
  }, [user, isReady]);

  const login = async (email: string, password: string, role: UserRole) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const mockUser: User = {
      id: "parent-1",
      name:
        role === "parent"
          ? "Sarah Johnson"
          : role === "staff"
          ? "Emily Davis"
          : role === "admin"
          ? "Michael Chen"
          : "Robert Smith",
      email,
      role,
      childrenIds: role === "parent" ? ["child-1", "child-2"] : undefined,
    };

    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isReady,
    }),
    [user, isReady]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}