"use client";

import { useState, useEffect, createContext, useContext } from "react";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string | null;
  securityLevel: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const data = await response.json();
      setUser(data.user || null);
    } catch (error) {
      console.error("Failed to refresh session:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Sign in failed");
    }

    const data = await response.json();
    setUser(data.user);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Sign up failed");
    }

    const data = await response.json();
    setUser(data.user);
  };

  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, refreshSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Export individual functions for compatibility
export const authClient = {
  signIn: {
    email: async (
      credentials: { email: string; password: string },
      callbacks?: {
        onSuccess?: () => void;
        onError?: (ctx: { error: { message: string } }) => void;
      }
    ) => {
      try {
        const response = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Sign in failed");
        }

        callbacks?.onSuccess?.();
      } catch (error) {
        callbacks?.onError?.({
          error: { message: (error as Error).message },
        });
      }
    },
  },
  signUp: {
    email: async (
      credentials: { email: string; password: string; name: string },
      callbacks?: {
        onSuccess?: () => void;
        onError?: (ctx: { error: { message: string } }) => void;
      }
    ) => {
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Sign up failed");
        }

        callbacks?.onSuccess?.();
      } catch (error) {
        callbacks?.onError?.({
          error: { message: (error as Error).message },
        });
      }
    },
  },
  signOut: async () => {
    await fetch("/api/auth/signout", { method: "POST" });
  },
};
