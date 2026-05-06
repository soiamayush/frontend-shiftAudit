// File: src/hooks/useAuth.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { API_ROUTES } from "../config/index";

export type AuthUser = {
  user_id: string;
  email: string;
  name: string | null;
};

type AuthResult = { ok: true; error?: undefined } | { ok: false; error: string };

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  login: (creds: { email: string; password: string }) => Promise<AuthResult>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<AuthResult>;
  /** Persist token after OAuth / external login and sync React state */
  setSessionToken: (token: string) => void;
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

async function fetchMe(
  accessToken: string
): Promise<{ ok: true; user: AuthUser } | { ok: false }> {
  try {
    const res = await fetch(API_ROUTES.ME, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    const user: AuthUser = {
      user_id: data.user_id,
      email: data.email,
      name: data.name ?? null,
    };
    return { ok: true, user };
  } catch {
    // Offline or network failure: keep existing token; skip clearing session
    return { ok: true, user: { user_id: "", email: "", name: null } };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  const validateAndHydrate = useCallback(async (stored: string) => {
    const result = await fetchMe(stored);
    if (result.ok && result.user.user_id) {
      setToken(stored);
      setUser(result.user);
      return;
    }
    if (result.ok && !result.user.user_id) {
      // Network error path: trust stored JWT for UI; user details load next time
      setToken(stored);
      setUser(null);
      return;
    }
    clearSession();
  }, [clearSession]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const stored = localStorage.getItem("token");
      if (!stored) {
        if (!cancelled) setLoading(false);
        return;
      }
      await validateAndHydrate(stored);
      if (!cancelled) setLoading(false);
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, [validateAndHydrate]);

  // Re-check token when the tab becomes visible (e.g. after idle or another tab logged out)
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== "visible") return;
      const stored = localStorage.getItem("token");
      if (!stored) return;
      void (async () => {
        const result = await fetchMe(stored);
        if (result.ok && result.user.user_id) {
          setToken(stored);
          setUser(result.user);
        } else if (!result.ok) {
          clearSession();
        }
      })();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [clearSession]);

  const setSessionToken = useCallback(
    (newToken: string) => {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      void (async () => {
        const result = await fetchMe(newToken);
        if (result.ok && result.user.user_id) setUser(result.user);
        else if (result.ok && !result.user.user_id) setUser(null);
        else clearSession();
      })();
    },
    [clearSession]
  );

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

    const body = await res.json();
    const newToken = body.token as string;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    const me = await fetchMe(newToken);
    if (me.ok && me.user.user_id) setUser(me.user);
    else setUser({
      user_id: body.user_id,
      email: body.email,
      name: body.name ?? null,
    });

    return { ok: true as const };
  };

  const signup: AuthContextType["signup"] = async (data) => {
    const res = await fetch(API_ROUTES.SIGNUP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      return { ok: false as const, error: await extractApiError(res) };
    }

    const body = await res.json();
    const newToken = body.token as string;
    localStorage.setItem("token", newToken);
    setToken(newToken);
    const me = await fetchMe(newToken);
    if (me.ok && me.user.user_id) setUser(me.user);
    else
      setUser({
        user_id: body.user_id,
        email: body.email,
        name: body.name ?? null,
      });

    return { ok: true as const };
  };

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        login,
        signup,
        setSessionToken,
        logout,
        loading,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
