"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated) {
      router.replace("/login/");
    }
  }, [ready, isAuthenticated, router]);

  if (!ready) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[var(--pult-canvas)] text-sm text-muted-foreground">
        Проверяем сессию…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-[var(--pult-canvas)] text-sm text-muted-foreground">
        Переход ко входу…
      </div>
    );
  }

  return <>{children}</>;
}
