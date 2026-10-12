"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type AuthUser,
  authenticate,
  clearSession,
  loadSession,
  saveSession,
} from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(loadSession());
    setReady(true);
  }, []);

  const login = useCallback((loginName: string, password: string) => {
    const next = authenticate(loginName, password);
    if (!next) return { ok: false as const };
    saveSession(next);
    setUser(next);
    return { ok: true as const, user: next };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  return { user, ready, login, logout, isAuthenticated: Boolean(user) };
}
