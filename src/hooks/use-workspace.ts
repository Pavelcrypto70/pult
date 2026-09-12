"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type Company,
  type CreateCompanyAccess,
  type ModuleConfig,
  MODULE_CATALOG,
  createModuleConfig,
  slugify,
  uid,
} from "@/lib/company";
import { team } from "@/lib/mock-data";

const STORAGE_KEY = "pult-workspace-v1";

export interface WorkspaceState {
  access: CreateCompanyAccess[];
  companies: Company[];
  currentUserId: string;
}

function buildDemoCompany(): Company {
  return {
    id: "co_demo",
    name: "Север Digital",
    slug: "sever-digital",
    industry: "Digital-студия",
    description: "Демо-компания студии: клиенты, воронка и задачи.",
    ownerId: "u1",
    createdAt: "2026-09-01",
    modules: ["crm_clients", "pipeline", "tasks", "analytics"]
      .map((id) => MODULE_CATALOG.find((m) => m.id === id))
      .filter(Boolean)
      .map((def) => createModuleConfig(def!)),
    roles: [
      { id: "r1", name: "Владелец", permissions: ["manage", "billing", "modules"] },
      { id: "r2", name: "Менеджер", permissions: ["clients", "deals", "tasks"] },
    ],
    departments: ["Продажи", "Дизайн", "Разработка"],
    customPages: [
      {
        id: "p1",
        title: "Онбординг клиента",
        description: "Чеклист запуска нового проекта",
      },
    ],
  };
}

const defaultState: WorkspaceState = {
  access: [{ userId: "u2", grantedBy: "u1", grantedAt: "2026-09-10" }],
  companies: [buildDemoCompany()],
  currentUserId: "u1",
};

function loadState(): WorkspaceState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as WorkspaceState;
    if (!Array.isArray(parsed.companies) || !Array.isArray(parsed.access)) {
      return defaultState;
    }
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

export function useWorkspace() {
  const [state, setState] = useState<WorkspaceState>(defaultState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const currentUser = team.find((m) => m.id === state.currentUserId) ?? team[0];

  const grantCreateAccess = useCallback((userId: string) => {
    setState((prev) => {
      if (prev.access.some((a) => a.userId === userId)) return prev;
      return {
        ...prev,
        access: [
          ...prev.access,
          {
            userId,
            grantedBy: prev.currentUserId,
            grantedAt: new Date().toISOString().slice(0, 10),
          },
        ],
      };
    });
  }, []);

  const revokeCreateAccess = useCallback((userId: string) => {
    setState((prev) => ({
      ...prev,
      access: prev.access.filter((a) => a.userId !== userId),
    }));
  }, []);

  const setCurrentUser = useCallback((userId: string) => {
    setState((prev) => ({ ...prev, currentUserId: userId }));
  }, []);

  const createCompany = useCallback(
    (input: {
      name: string;
      industry: string;
      description: string;
      modules: ModuleConfig[];
      roles: Company["roles"];
      departments: string[];
      customPages: Company["customPages"];
    }) => {
      const company: Company = {
        id: uid("co"),
        name: input.name.trim(),
        slug: slugify(input.name),
        industry: input.industry,
        description: input.description.trim(),
        ownerId: state.currentUserId,
        createdAt: new Date().toISOString().slice(0, 10),
        modules: input.modules,
        roles: input.roles,
        departments: input.departments,
        customPages: input.customPages,
      };

      setState((prev) => ({
        ...prev,
        companies: [company, ...prev.companies],
      }));
      return company;
    },
    [state.currentUserId],
  );

  const updateCompany = useCallback((company: Company) => {
    setState((prev) => ({
      ...prev,
      companies: prev.companies.map((c) => (c.id === company.id ? company : c)),
    }));
  }, []);

  const deleteCompany = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      companies: prev.companies.filter((c) => c.id !== id),
    }));
  }, []);

  return {
    ready,
    state,
    currentUser,
    grantCreateAccess,
    revokeCreateAccess,
    setCurrentUser,
    createCompany,
    updateCompany,
    deleteCompany,
  };
}
