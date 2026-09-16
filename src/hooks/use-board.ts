"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type BoardBlock,
  type BoardState,
  type CardHistoryEntry,
  type DealCard,
  type Direction,
  type DirectionId,
  type FieldModuleConfig,
  type TransitionRule,
  blocksForDirection,
  createInitialBoardState,
  missingRequiredFields,
  uid,
} from "@/lib/board";

const STORAGE_KEY = "pult-board-v1";

function loadBoard(): BoardState {
  if (typeof window === "undefined") return createInitialBoardState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialBoardState();
    const parsed = JSON.parse(raw) as BoardState;
    if (!parsed?.blocks?.length || !parsed?.cards || !parsed?.directions) {
      return createInitialBoardState();
    }
    return parsed;
  } catch {
    return createInitialBoardState();
  }
}

function pushHistory(
  card: DealCard,
  entry: Omit<CardHistoryEntry, "id" | "at"> & { at?: string },
): DealCard {
  return {
    ...card,
    updatedAt: new Date().toISOString().slice(0, 10),
    history: [
      {
        id: uid("h"),
        at: entry.at ?? new Date().toISOString(),
        ...entry,
      },
      ...card.history,
    ],
  };
}

export function useBoard() {
  const [state, setState] = useState<BoardState>(createInitialBoardState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadBoard());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);

  const resetBoard = useCallback(() => {
    const next = createInitialBoardState();
    setState(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const moveCard = useCallback(
    (
      cardId: string,
      targetBlockId: string,
      meta: { kind: "manual" | "action"; actionId?: string; actionLabel?: string; userName?: string },
    ) => {
      setState((prev) => {
        const card = prev.cards.find((c) => c.id === cardId);
        const target = prev.blocks.find((b) => b.id === targetBlockId);
        if (!card || !target) return prev;

        // handoff sales → fulfillment changes direction
        const nextDirection = target.directionId;
        const direction = prev.directions.find((d) => d.id === nextDirection)!;
        let nextCard: DealCard = {
          ...card,
          blockId: targetBlockId,
          directionId: nextDirection,
        };

        if (meta.kind === "manual") {
          const missing = missingRequiredFields(nextCard, direction.template, "exit");
          const flags = new Set(nextCard.flags);
          if (missing.length) flags.add("needs_fill");
          else flags.delete("needs_fill");
          nextCard = { ...nextCard, flags: [...flags] };
        }

        nextCard = pushHistory(nextCard, {
          userName: meta.userName ?? "Анна Крылова",
          kind: meta.kind,
          fromBlockId: card.blockId,
          toBlockId: targetBlockId,
          actionId: meta.actionId,
          actionLabel: meta.actionLabel,
          note:
            meta.kind === "manual"
              ? "Перенесено вручную"
              : meta.actionLabel ?? "Действие",
        });

        return {
          ...prev,
          cards: prev.cards.map((c) => (c.id === cardId ? nextCard : c)),
        };
      });
    },
    [],
  );

  const runAction = useCallback(
    (cardId: string, actionId: string): { ok: true } | { ok: false; missing: string[] } => {
      const card = state.cards.find((c) => c.id === cardId);
      if (!card) return { ok: false, missing: ["Карточка не найдена"] };
      const direction = state.directions.find((d) => d.id === card.directionId)!;
      const rule = direction.transitions.find(
        (t) => t.fromBlockId === card.blockId && t.actionId === actionId,
      );
      if (!rule) return { ok: false, missing: ["Действие недоступно"] };

      // Special: handoff to fulfillment first block
      let targetBlockId = rule.targetBlockId;
      if (actionId === "handoff_fulfillment") {
        const first = blocksForDirection(state.blocks, "fulfillment")[0];
        targetBlockId = first?.id ?? targetBlockId;
      }

      const missing = missingRequiredFields(card, direction.template, "exit");
      if (missing.length) return { ok: false, missing };

      moveCard(cardId, targetBlockId, {
        kind: "action",
        actionId: rule.actionId,
        actionLabel: rule.actionLabel,
      });
      return { ok: true };
    },
    [moveCard, state.blocks, state.cards, state.directions],
  );

  const reorderBlocks = useCallback((directionId: DirectionId, fromId: string, toId: string) => {
    if (fromId === toId) return;
    setState((prev) => {
      const list = blocksForDirection(prev.blocks, directionId);
      const fromIndex = list.findIndex((b) => b.id === fromId);
      const toIndex = list.findIndex((b) => b.id === toId);
      if (fromIndex < 0 || toIndex < 0) return prev;
      const nextList = [...list];
      const [item] = nextList.splice(fromIndex, 1);
      nextList.splice(toIndex, 0, item);
      const orderMap = new Map(nextList.map((b, i) => [b.id, i]));
      return {
        ...prev,
        blocks: prev.blocks.map((b) =>
          b.directionId === directionId ? { ...b, order: orderMap.get(b.id) ?? b.order } : b,
        ),
      };
    });
  }, []);

  const createCard = useCallback((input: Omit<DealCard, "id" | "history" | "createdAt" | "updatedAt" | "flags"> & { flags?: DealCard["flags"] }) => {
    const card: DealCard = {
      ...input,
      id: uid("card"),
      flags: input.flags ?? [],
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      history: [
        {
          id: uid("h"),
          at: new Date().toISOString(),
          userName: input.createdBy,
          kind: "create",
          toBlockId: input.blockId,
          note: "Карточка создана",
        },
      ],
    };
    setState((prev) => ({ ...prev, cards: [card, ...prev.cards] }));
    return card;
  }, []);

  const updateCard = useCallback((card: DealCard) => {
    setState((prev) => ({
      ...prev,
      cards: prev.cards.map((c) =>
        c.id === card.id ? { ...card, updatedAt: new Date().toISOString().slice(0, 10) } : c,
      ),
    }));
  }, []);

  const upsertBlock = useCallback((block: BoardBlock) => {
    setState((prev) => {
      const exists = prev.blocks.some((b) => b.id === block.id);
      if (exists) {
        return { ...prev, blocks: prev.blocks.map((b) => (b.id === block.id ? block : b)) };
      }
      const siblings = blocksForDirection(prev.blocks, block.directionId);
      return {
        ...prev,
        blocks: [
          ...prev.blocks,
          { ...block, order: siblings.length },
        ],
      };
    });
  }, []);

  const deleteBlock = useCallback((blockId: string) => {
    setState((prev) => {
      const block = prev.blocks.find((b) => b.id === blockId);
      if (!block) return prev;
      const hasCards = prev.cards.some((c) => c.blockId === blockId);
      if (hasCards) return prev;
      const remaining = prev.blocks.filter((b) => b.id !== blockId);
      const ordered = blocksForDirection(remaining, block.directionId).map((b, i) => ({
        ...b,
        order: i,
      }));
      const orderMap = new Map(ordered.map((b) => [b.id, b]));
      return {
        ...prev,
        blocks: remaining.map((b) => orderMap.get(b.id) ?? b),
        directions: prev.directions.map((d) =>
          d.id === block.directionId
            ? {
                ...d,
                transitions: d.transitions.filter(
                  (t) => t.fromBlockId !== blockId && t.targetBlockId !== blockId,
                ),
              }
            : d,
        ),
      };
    });
  }, []);

  const updateDirectionTemplate = useCallback(
    (directionId: DirectionId, template: FieldModuleConfig[]) => {
      setState((prev) => ({
        ...prev,
        directions: prev.directions.map((d) =>
          d.id === directionId ? { ...d, template } : d,
        ),
      }));
    },
    [],
  );

  const updateTransitions = useCallback(
    (directionId: DirectionId, transitions: TransitionRule[]) => {
      setState((prev) => ({
        ...prev,
        directions: prev.directions.map((d) =>
          d.id === directionId ? { ...d, transitions } : d,
        ),
      }));
    },
    [],
  );

  return {
    ready,
    state,
    resetBoard,
    moveCard,
    runAction,
    reorderBlocks,
    createCard,
    updateCard,
    upsertBlock,
    deleteBlock,
    updateDirectionTemplate,
    updateTransitions,
  };
}

export type UseBoardReturn = ReturnType<typeof useBoard>;
