import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, tokenStore, type AuthUser } from "./api";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = tokenStore.get();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await authApi.me();
        if (!cancelled) setUser(user);
      } catch {
        tokenStore.clear();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: !!user,
    async login(email, password) {
      const res = await authApi.login({ email, password });
      tokenStore.set(res.accessToken);
      setUser(res.user);
      return res.user;
    },
    async register(name, email, password) {
      const res = await authApi.register({ name, email, password });
      tokenStore.set(res.accessToken);
      setUser(res.user);
      return res.user;
    },
    async logout() {
      try {
        await authApi.logout();
      } catch {
        // ignore — clear local state regardless
      }
      tokenStore.clear();
      setUser(null);
    },
    async refresh() {
      const { user } = await authApi.me();
      setUser(user);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
