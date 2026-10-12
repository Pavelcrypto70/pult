"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const { login, ready, isAuthenticated } = useAuth();
  const router = useRouter();
  const [loginName, setLoginName] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace("/app/");
    }
  }, [ready, isAuthenticated, router]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = login(loginName, password);
    setPending(false);
    if (!result.ok) {
      setError("Неверный логин или пароль");
      return;
    }
    router.replace("/app/");
  }

  return (
    <main className="relative isolate flex min-h-svh items-center justify-center overflow-hidden bg-[var(--pult-canvas)] px-4">
      <div className="pointer-events-none absolute inset-0 pult-grid opacity-60" aria-hidden />
      <div
        className="pointer-events-none absolute -right-20 top-10 h-[50vmin] w-[50vmin] rounded-full bg-[radial-gradient(circle,rgba(11,107,86,0.2),transparent_68%)] blur-2xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-[40vmin] w-[40vmin] rounded-full bg-[radial-gradient(circle,rgba(154,123,79,0.18),transparent_70%)] blur-2xl"
        aria-hidden
      />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[var(--pult-ink)] text-sm font-semibold text-[var(--pult-paper)]">
              P
            </span>
            <span className="text-left leading-tight">
              <span className="block font-[family-name:var(--font-display)] text-xl tracking-tight">
                Пульт
              </span>
              <span className="block text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                Door Salon
              </span>
            </span>
          </Link>
        </div>

        <form
          onSubmit={submit}
          className="rounded-[1.5rem] border border-[var(--pult-line)] bg-white/90 p-6 shadow-[var(--pult-shadow-lg)] backdrop-blur-sm sm:p-8"
        >
          <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
            Вход
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Закрытый контур салона. Демо-админ создан для команды.
          </p>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login">Логин</Label>
              <Input
                id="login"
                autoComplete="username"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl bg-[#fde8e4] px-3 py-2 text-sm text-[#9b3a2c]">
              {error}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={pending || !loginName.trim() || !password}
            className="mt-6 w-full rounded-full bg-[var(--pult-ink)] text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90"
          >
            Войти
          </Button>

          <div className="mt-5 rounded-2xl bg-[var(--pult-canvas)]/90 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            <div className="font-medium text-[var(--pult-ink)]">Демо-доступ</div>
            <div className="mt-1">
              логин <code className="text-[var(--pult-accent)]">admin</code>
              {" · "}
              пароль <code className="text-[var(--pult-accent)]">pult-admin</code>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
