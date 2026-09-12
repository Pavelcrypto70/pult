"use client";

import Link from "next/link";
import { Building2, Lock, Plus, Wand2 } from "lucide-react";
import { PageHeader, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/hooks/use-workspace";
import { canUserCreateCompany } from "@/lib/company";
import { team } from "@/lib/mock-data";

export default function CompaniesPage() {
  const { ready, state, currentUser, deleteCompany } = useWorkspace();
  const canCreate = canUserCreateCompany(
    currentUser.role,
    state.access,
    currentUser.id,
  );

  return (
    <div>
      <PageHeader
        title="Компании"
        description="Создавайте компании конструктором: только нужные модули, поля и процессы."
        actions={
          canCreate ? (
            <Button
              className="rounded-full bg-[var(--pult-accent)] px-5 text-white hover:bg-[var(--pult-accent)]/90"
              render={<Link href="/app/companies/new" />}
            >
              <Plus className="size-4" />
              Создать компанию
            </Button>
          ) : (
            <Badge variant="secondary" className="gap-1.5">
              <Lock className="size-3.5" />
              Нужен доступ от админа
            </Badge>
          )
        }
      />

      {!ready ? (
        <Surface className="p-6 text-sm text-muted-foreground">Загрузка…</Surface>
      ) : !canCreate ? (
        <Surface className="p-6">
          <h2 className="font-[family-name:var(--font-display)] text-xl">
            Пока нельзя создать компанию
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Попросите админа выдать доступ во вкладке «Доступ к компаниям». Сейчас
            вы — {currentUser.name}.
          </p>
          <Button
            className="mt-4 rounded-full"
            variant="outline"
            render={<Link href="/app/admin" />}
          >
            Открыть админку
          </Button>
        </Surface>
      ) : state.companies.length === 0 ? (
        <Surface className="p-8 text-center">
          <Building2 className="mx-auto size-8 text-[var(--pult-accent)]" />
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-xl">
            Компаний ещё нет
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Соберите первую через конструктор: модули, поля, стадии, роли и страницы.
          </p>
          <Button
            className="mt-5 rounded-full bg-[var(--pult-accent)] text-white hover:bg-[var(--pult-accent)]/90"
            render={<Link href="/app/companies/new" />}
          >
            <Wand2 className="size-4" />
            Открыть конструктор
          </Button>
        </Surface>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {state.companies.map((company) => {
            const owner = team.find((m) => m.id === company.ownerId);
            return (
              <Surface key={company.id} className="flex flex-col p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-[family-name:var(--font-display)] text-lg tracking-tight">
                      {company.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {company.industry}
                    </p>
                  </div>
                  <Badge variant="secondary">{company.modules.length} мод.</Badge>
                </div>
                <p className="mb-4 line-clamp-2 flex-1 text-sm text-muted-foreground">
                  {company.description || "Без описания"}
                </p>
                <div className="mb-4 flex flex-wrap gap-1.5">
                  {company.modules.slice(0, 4).map((mod) => (
                    <Badge
                      key={mod.moduleId}
                      className="bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]"
                    >
                      {mod.moduleId.replaceAll("_", " ")}
                    </Badge>
                  ))}
                  {company.modules.length > 4 ? (
                    <Badge variant="secondary">+{company.modules.length - 4}</Badge>
                  ) : null}
                </div>
                <div className="mb-4 text-xs text-muted-foreground">
                  Владелец: {owner?.name ?? "—"} · {company.createdAt}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="rounded-full"
                    render={<Link href={`/app/companies/${company.id}`} />}
                  >
                    Конструктор
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => deleteCompany(company.id)}
                  >
                    Удалить
                  </Button>
                </div>
              </Surface>
            );
          })}
        </div>
      )}
    </div>
  );
}
