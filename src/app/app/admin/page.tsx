"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Building2, Check, ShieldCheck, Wand2 } from "lucide-react";
import { PageHeader, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspace } from "@/hooks/use-workspace";
import { team } from "@/lib/mock-data";
import { ROLE_LABELS } from "@/lib/types";

const integrations = [
  { name: "Telegram", status: "Подключено", detail: "Алерты и быстрые тикеты" },
  { name: "Почта", status: "Черновик", detail: "Входящие заявки с ящика" },
  { name: "ЮKassa", status: "Скоро", detail: "Статусы оплат по счетам" },
  { name: "Webhooks", status: "Доступно", detail: "Исходящие события API" },
];

export default function AdminPage() {
  const {
    state,
    currentUser,
    grantCreateAccess,
    revokeCreateAccess,
    setCurrentUser,
  } = useWorkspace();

  const [query, setQuery] = useState("");

  const accessIds = useMemo(
    () => new Set(state.access.map((item) => item.userId)),
    [state.access],
  );

  const filtered = team.filter((member) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      member.name.toLowerCase().includes(q) ||
      member.email.toLowerCase().includes(q)
    );
  });

  const isAdmin = currentUser.role === "owner" || currentUser.role === "admin";

  return (
    <div>
      <PageHeader
        title="Админка"
        description="Выдавайте доступ на создание компаний и управляйте командой пространства."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-full border border-[var(--pult-line)] bg-white/80 px-3 py-1.5 text-sm">
              <span className="text-xs text-muted-foreground">Я:</span>
              <select
                className="bg-transparent outline-none"
                value={state.currentUserId}
                onChange={(event) => setCurrentUser(event.target.value)}
              >
                {team.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
            <Button
              className="rounded-full bg-[var(--pult-accent)] px-5 text-white hover:bg-[var(--pult-accent)]/90"
              render={<Link href="/app/companies" />}
            >
              <Building2 className="size-4" />
              Компании
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="companies">
        <TabsList className="mb-4 rounded-full bg-white/70 p-1 shadow-[var(--pult-shadow)]">
          <TabsTrigger value="companies" className="rounded-full">
            Доступ к компаниям
          </TabsTrigger>
          <TabsTrigger value="people" className="rounded-full">
            Команда
          </TabsTrigger>
          <TabsTrigger value="access" className="rounded-full">
            Роли
          </TabsTrigger>
          <TabsTrigger value="integrations" className="rounded-full">
            Интеграции
          </TabsTrigger>
          <TabsTrigger value="audit" className="rounded-full">
            Журнал
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="space-y-4">
          <Surface className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <div className="mb-2 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.14em] text-[var(--pult-accent)] uppercase">
                  <ShieldCheck className="size-3.5" />
                  Право на создание
                </div>
                <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
                  Кому можно создавать компании
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Админ выдаёт доступ. Потом у человека появляется конструктор:
                  он включает только нужные модули, поля, стадии, роли и
                  автоматизации.
                </p>
              </div>
              <Badge
                className={
                  isAdmin
                    ? "bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]"
                    : "bg-secondary text-muted-foreground"
                }
              >
                Вы: {ROLE_LABELS[currentUser.role]}
              </Badge>
            </div>
          </Surface>

          {!isAdmin ? (
            <Surface className="p-5 text-sm text-muted-foreground">
              Переключитесь на владельца или админа, чтобы выдавать доступ.
              Сейчас вы — {currentUser.name}.
            </Surface>
          ) : (
            <Surface className="overflow-hidden">
              <div className="border-b border-[var(--pult-line)] p-4">
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Найти человека…"
                  className="max-w-sm bg-white"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Сотрудник</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="text-right">Создание компаний</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((member) => {
                    const hasAccess =
                      member.role === "owner" ||
                      member.role === "admin" ||
                      accessIds.has(member.id);
                    const locked =
                      member.role === "owner" || member.role === "admin";
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="flex size-8 items-center justify-center rounded-full bg-[var(--pult-accent-soft)] text-xs font-semibold text-[var(--pult-accent)]">
                              {member.initials}
                            </span>
                            <span className="font-medium">{member.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{ROLE_LABELS[member.role]}</TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {member.email}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-3">
                            {hasAccess ? (
                              <Badge className="bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]">
                                <Check className="size-3" />
                                Можно
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Нет</Badge>
                            )}
                            <Label className="inline-flex cursor-pointer items-center gap-2 text-sm">
                              <Checkbox
                                checked={hasAccess}
                                disabled={locked || !member.active}
                                onCheckedChange={(checked) => {
                                  if (locked) return;
                                  if (checked) grantCreateAccess(member.id);
                                  else revokeCreateAccess(member.id);
                                }}
                              />
                              {locked ? "По роли" : "Выдать"}
                            </Label>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Surface>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <Surface className="p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <Building2 className="size-4 text-[var(--pult-accent)]" />
                Компании в пространстве
              </div>
              <p className="text-sm text-muted-foreground">
                Сейчас: {state.companies.length}. Откройте список или соберите
                новую через конструктор.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="rounded-full"
                  render={<Link href="/app/companies" />}
                >
                  Все компании
                </Button>
                <Button
                  className="rounded-full bg-[var(--pult-ink)] text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90"
                  render={<Link href="/app/companies/new" />}
                >
                  <Wand2 className="size-4" />
                  Конструктор
                </Button>
              </div>
            </Surface>
            <Surface className="p-5">
              <div className="mb-2 text-sm font-medium">Как это работает</div>
              <ol className="space-y-2 text-sm text-muted-foreground">
                <li>1. Админ выдаёт человеку право «создание компаний».</li>
                <li>2. Человек создаёт компанию и включает только нужные модули.</li>
                <li>3. В конструкторе добавляет поля, стадии, роли, страницы и автоматизации.</li>
              </ol>
            </Surface>
          </div>
        </TabsContent>

          <TabsContent value="people">
            <Surface className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Сотрудник</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="text-right">Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {team.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 items-center justify-center rounded-full bg-[var(--pult-accent-soft)] text-xs font-semibold text-[var(--pult-accent)]">
                            {member.initials}
                          </span>
                          <span className="font-medium">{member.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{ROLE_LABELS[member.role]}</TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {member.email}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          className={
                            member.active
                              ? "bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]"
                              : "bg-secondary text-muted-foreground"
                          }
                        >
                          {member.active ? "Активен" : "Отключён"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Surface>
          </TabsContent>

          <TabsContent value="access">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  role: "Владелец",
                  rights: [
                    "Биллинг",
                    "Удаление пространства",
                    "Все модули",
                    "Аудит",
                    "Выдача создания компаний",
                  ],
                },
                {
                  role: "Админ",
                  rights: [
                    "Пользователи",
                    "Интеграции",
                    "API-ключи",
                    "Все данные",
                    "Выдача создания компаний",
                  ],
                },
                {
                  role: "Менеджер",
                  rights: [
                    "Клиенты",
                    "Воронка",
                    "Задачи команды",
                    "Счета",
                    "Создание компаний — по доступу",
                  ],
                },
                {
                  role: "Сотрудник",
                  rights: [
                    "Свои задачи",
                    "Назначенные клиенты",
                    "Комментарии",
                    "Создание компаний — по доступу",
                  ],
                },
              ].map((block) => (
                <Surface key={block.role} className="p-5">
                  <h3 className="font-[family-name:var(--font-display)] text-lg">
                    {block.role}
                  </h3>
                  <Separator className="my-3" />
                  <ul className="space-y-2">
                    {block.rights.map((right) => (
                      <li key={right} className="text-sm text-muted-foreground">
                        · {right}
                      </li>
                    ))}
                  </ul>
                </Surface>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="integrations">
            <div className="grid gap-3 md:grid-cols-2">
              {integrations.map((item) => (
                <Surface
                  key={item.name}
                  className="flex items-start justify-between gap-4 p-5"
                >
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                  <Badge variant="secondary">{item.status}</Badge>
                </Surface>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="audit">
            <Surface className="divide-y divide-[var(--pult-line)]">
              {[
                ...state.access.map((item) => {
                  const user = team.find((member) => member.id === item.userId);
                  return `Выдан доступ на создание компаний: ${user?.name ?? item.userId}`;
                }),
                "Павел выдал Марии доступ к staging",
                "Анна изменила роль Ильи на менеджера",
                "Создан webhook endpoint /api/hooks/deals",
              ].map((row) => (
                <div
                  key={row}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <p className="text-sm">{row}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">сегодня</span>
                </div>
              ))}
            </Surface>
          </TabsContent>
        </Tabs>
    </div>
  );
}
