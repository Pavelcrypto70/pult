/** Demo auth — see docs/NOTES.md §7. Not for production secrets. */

export type AuthUser = {
  id: string;
  login: string;
  name: string;
  role: "admin" | "manager" | "operator";
  initials: string;
};

export const DEMO_ACCOUNTS: {
  login: string;
  password: string;
  user: AuthUser;
}[] = [
  {
    login: "admin",
    password: "pult-admin",
    user: {
      id: "u_admin",
      login: "admin",
      name: "Президент",
      role: "admin",
      initials: "ПР",
    },
  },
];

const STORAGE_KEY = "pult-auth-v1";

export function authenticate(login: string, password: string): AuthUser | null {
  const normalized = login.trim().toLowerCase();
  const found = DEMO_ACCOUNTS.find(
    (a) => a.login === normalized && a.password === password,
  );
  return found ? { ...found.user } : null;
}

export function loadSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.id || !parsed?.login) return null;
    // Migrate old demo name from earlier builds
    if (parsed.name === "Анна Крылова" || parsed.initials === "АК") {
      const demo = DEMO_ACCOUNTS.find((a) => a.login === "admin")?.user;
      const next: AuthUser = {
        ...parsed,
        name: demo?.name ?? "Президент",
        initials: demo?.initials ?? "ПР",
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(user: AuthUser) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export const ROLE_LABELS_AUTH: Record<AuthUser["role"], string> = {
  admin: "Админ / шеф",
  manager: "Менеджер",
  operator: "Оператор",
};
