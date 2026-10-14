"use client";

import { useCallback, useEffect, useState } from "react";
import type { DirectionId } from "@/lib/board";
import { team } from "@/lib/mock-data";

const STORAGE_KEY = "pult-door-salon-v1";

type VisibleBlocksByUser = Record<
  string,
  Partial<Record<DirectionId, string[]>>
>;

interface SalonState {
  currentUserId: string;
  /** Per-account visible kanban blocks by direction. Missing key = show all. */
  visibleBlocksByUser: VisibleBlocksByUser;
}

function defaultState(): SalonState {
  return { currentUserId: "u1", visibleBlocksByUser: {} };
}

function loadState(): SalonState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<SalonState>;
    const currentUserId =
      typeof parsed.currentUserId === "string" &&
      team.some((m) => m.id === parsed.currentUserId)
        ? parsed.currentUserId
        : "u1";
    const visibleBlocksByUser =
      parsed.visibleBlocksByUser &&
      typeof parsed.visibleBlocksByUser === "object"
        ? (parsed.visibleBlocksByUser as VisibleBlocksByUser)
        : {};
    return { currentUserId, visibleBlocksByUser };
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
    setState((prev) => ({ ...prev, currentUserId: userId }));
  }, []);

  /** `null` means show every block for this direction. */
  const getVisibleBlockIds = useCallback(
    (directionId: DirectionId): string[] | null => {
      const saved =
        state.visibleBlocksByUser[state.currentUserId]?.[directionId];
      if (!saved) return null;
      return saved;
    },
    [state.currentUserId, state.visibleBlocksByUser],
  );

  const setVisibleBlockIds = useCallback(
    (directionId: DirectionId, blockIds: string[] | null) => {
      setState((prev) => {
        const userId = prev.currentUserId;
        const userMap = { ...(prev.visibleBlocksByUser[userId] ?? {}) };
        if (blockIds === null) {
          delete userMap[directionId];
        } else {
          userMap[directionId] = blockIds;
        }
        return {
          ...prev,
          visibleBlocksByUser: {
            ...prev.visibleBlocksByUser,
            [userId]: userMap,
          },
        };
      });
    },
    [],
  );

  const showAllBlocks = useCallback(
    (directionId: DirectionId) => {
      setVisibleBlockIds(directionId, null);
    },
    [setVisibleBlockIds],
  );

  const toggleVisibleBlock = useCallback(
    (directionId: DirectionId, blockId: string, allBlockIds: string[]) => {
      setState((prev) => {
        const userId = prev.currentUserId;
        const current = prev.visibleBlocksByUser[userId]?.[directionId];
        const baseline = current ?? allBlockIds;
        const exists = baseline.includes(blockId);
        const next = exists
          ? baseline.filter((id) => id !== blockId)
          : [...baseline, blockId];
        // Keep board order
        const ordered = allBlockIds.filter((id) => next.includes(id));
        const userMap = { ...(prev.visibleBlocksByUser[userId] ?? {}) };
        // If selection equals full set — clear preference (show all)
        if (ordered.length === allBlockIds.length) {
          delete userMap[directionId];
        } else {
          userMap[directionId] = ordered;
        }
        return {
          ...prev,
          visibleBlocksByUser: {
            ...prev.visibleBlocksByUser,
            [userId]: userMap,
          },
        };
      });
    },
    [],
  );

  return {
    hydrated,
    state,
    currentUser,
    setCurrentUser,
    getVisibleBlockIds,
    setVisibleBlockIds,
    showAllBlocks,
    toggleVisibleBlock,
  };
}
