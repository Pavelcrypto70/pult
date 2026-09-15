"use client";

import { useCallback, useEffect, useState } from "react";
import { team } from "@/lib/mock-data";

const STORAGE_KEY = "pult-door-salon-v1";

interface SalonState {
  currentUserId: string;
}

function defaultState(): SalonState {
  return { currentUserId: "u1" };
}

function loadState(): SalonState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<SalonState>;
    return {
      currentUserId:
        typeof parsed.currentUserId === "string" &&
        team.some((m) => m.id === parsed.currentUserId)
          ? parsed.currentUserId
          : "u1",
    };
  } catch {
    return defaultState();
  }
}

export function useWorkspace() {
  const [state, setState] = useState<SalonState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const currentUser = team.find((m) => m.id === state.currentUserId) ?? team[0];

  const setCurrentUser = useCallback((userId: string) => {
    setState({ currentUserId: userId });
  }, []);

  return {
    hydrated,
    state,
    currentUser,
    setCurrentUser,
  };
}
