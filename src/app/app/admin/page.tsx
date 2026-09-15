"use client";

import { useState } from "react";
import { PageHeader, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  { name: "Telegram", status: "Подключено", detail: "Алерты по сделкам и монтажу" },
  { name: "Почта", status: "Черновик", detail: "Заявки с сайта салона" },
  { name: "ЮKassa", status: "Скоро", detail: "Предоплаты по заказам дверей" },
  { name: "Webhooks", status: "Доступно", detail: "Статусы поставки наружу" },
];

export default function AdminPage() {
  const { state, currentUser, setCurrentUser } = useWorkspace();
  const [query, setQuery] = useState("");

  const filtered = team.filter((member) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      member.name.toLowerCase().includes(q) ||
      member.email.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <PageHeader
        title="Админка"
        description="Команда салона, роли и интеграции. Без конструктора компаний — только магазин дверей."
        actions={
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
        }
      />

      <Tabs defaultValue="people">
        <TabsList className="mb-4 rounded-full bg-white/70 p-1 shadow-[var(--pult-shadow)]">
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

        <TabsContent value="people" className="space-y-4">
          <Surface className="overflow-hidden">
            <div className="border-b border-[var(--pult-line)] p-4">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Найти сотрудника…"
                className="max-w-sm bg-white"
              />
            </div>
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
                {filtered.map((member) => (
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
          <Surface className="p-4 text-sm text-muted-foreground">
            Сейчас вы смотрите кабинет как{" "}
            <span className="font-medium text-[var(--pult-ink)]">{currentUser.name}</span>
            {" · "}
            {ROLE_LABELS[currentUser.role]}
          </Surface>
        </TabsContent>

        <TabsContent value="access">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                role: "Владелец",
                rights: ["Биллинг", "Команда", "Все сделки", "Отчёты", "Аудит"],
              },
              {
                role: "Админ",
                rights: ["Пользователи", "Интеграции", "Все данные салона", "Отчёты"],
              },
              {
                role: "Менеджер",
                rights: ["Клиенты", "Сделки", "Заказы дверей", "Замеры", "Счета"],
              },
              {
                role: "Сотрудник",
                rights: ["Свои задачи", "Назначенные сделки", "Монтаж / сервис"],
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
              "Анна открыла направление «Поставка / Доставка / Монтаж»",
              "Илья обновил статус заказа 546-2026",
              "Павел подключил webhook /api/hooks/deals",
              "Мария выгрузила общий отчёт по салону",
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
