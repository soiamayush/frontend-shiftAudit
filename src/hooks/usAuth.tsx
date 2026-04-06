// File: src/hooks/useAuth.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { API_ROUTES } from "../config/index";

type AuthResult = { ok: true; error?: undefined } | { ok: false; error: string };

interface AuthContextType {
  token: string | null;
  login: (creds: { email: string; password: string }) => Promise<AuthResult>;
  signup: (data: { name: string; email: string; password: string }) => Promise<AuthResult>;
  logout: () => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function extractApiError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.detail === "string") return data.detail;
    if (Array.isArray(data?.detail) && data.detail.length > 0) {
      const first = data.detail[0];
      if (typeof first?.msg === "string") return first.msg;
    }
    if (typeof data?.message === "string") return data.message;
  } catch {
    // ignore parse errors
  }
  return res.statusText || "Request failed";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) setToken(stored);
    setLoading(false);
  }, []);

// login handler
const login: AuthContextType["login"] = async (creds) => {
  const res = await fetch(API_ROUTES.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(creds),
    credentials: "include",
  });

  if (!res.ok) {
    return { ok: false as const, error: await extractApiError(res) };
  }

  const { token: newToken } = await res.json();
  localStorage.setItem("token", newToken);
  setToken(newToken);

  return { ok: true as const };
};

// signup handler
const signup: AuthContextType["signup"] = async (data) => {
  const res = await fetch(API_ROUTES.SIGNUP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    return { ok: false as const, error: await extractApiError(res) };
  }

  const { token: newToken } = await res.json();
  localStorage.setItem("token", newToken);
  setToken(newToken);

  return { ok: true as const };
};

  // logout handler
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, signup, logout, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
