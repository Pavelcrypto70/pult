"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { clientById, memberById, tasks as seedTasks, team } from "@/lib/mock-data";
import {
  PRIORITY_LABELS,
  ROLE_LABELS,
  STATUS_LABELS,
  type TaskItem,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

function priorityClass(priority: string) {
  if (priority === "high") return "bg-[var(--pult-warm)] text-white";
  if (priority === "medium") return "bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]";
  return "bg-secondary text-muted-foreground";
}

const activeTeam = team.filter((m) => m.active);

export default function TasksPage() {
  const [selectedId, setSelectedId] = useState<string>("u1");
  const [items, setItems] = useState<TaskItem[]>(seedTasks);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [assigneeId, setAssigneeId] = useState("u1");

  const selected = memberById(selectedId) ?? activeTeam[0];

  const filtered = useMemo(
    () => items.filter((task) => task.assigneeId === selectedId),
    [items, selectedId],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const member of activeTeam) {
      map.set(
        member.id,
        items.filter((t) => t.assigneeId === member.id && t.status !== "done").length,
      );
    }
    return map;
  }, [items]);

  function resetForm() {
    setTitle("");
    setDueDate("");
    setPriority("medium");
    setStatus("todo");
    setAssigneeId(selectedId);
  }

  function handleCreate() {
    if (!title.trim()) return;
    const next: TaskItem = {
      id: `t_${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      status,
      priority,
      assigneeId,
      dueDate: dueDate || new Date().toISOString().slice(0, 10),
    };
    setItems((prev) => [next, ...prev]);
    setSelectedId(assigneeId);
    setOpen(false);
    resetForm();
  }

  return (
    <div>
      <PageHeader
        title="Задачи"
        description="Вид шефа: выберите сотрудника — свои задачи тоже здесь, у Анны."
        actions={
          <Button
            className="rounded-full bg-[var(--pult-ink)] text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90"
            onClick={() => {
              setAssigneeId(selectedId);
              setOpen(true);
            }}
          >
            <Plus className="size-4" />
            Новая задача
          </Button>
        }
      />

      <Surface className="mb-5 p-3 sm:p-4">
        <div className="mb-3 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          Команда
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {activeTeam.map((member) => {
            const active = member.id === selectedId;
            const openCount = counts.get(member.id) ?? 0;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedId(member.id)}
                className={cn(
                  "flex min-w-[150px] shrink-0 items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all",
                  active
                    ? "border-[var(--pult-accent)]/40 bg-[var(--pult-accent-soft)]/60 shadow-[var(--pult-shadow)]"
                    : "border-[var(--pult-line)] bg-white/80 hover:border-[var(--pult-gold)]/35",
                )}
              >
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-white text-xs font-semibold text-[var(--pult-accent)]">
                  {member.initials}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{member.name}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {ROLE_LABELS[member.role]} · {openCount} в работе
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </Surface>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
            {selected.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {ROLE_LABELS[selected.role]} · {filtered.length} задач
            {selected.role === "owner" ? " · шеф салона" : ""}
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-full"
          onClick={() => {
            setAssigneeId(selectedId);
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          Задача для {selected.initials}
        </Button>
      </div>

      <Surface className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Задача</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="hidden md:table-cell">Приоритет</TableHead>
              <TableHead className="hidden lg:table-cell">Клиент</TableHead>
              <TableHead className="text-right">Срок</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((task) => {
              const client = task.clientId ? clientById(task.clientId) : null;
              return (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{STATUS_LABELS[task.status]}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge className={priorityClass(task.priority)}>
                      {PRIORITY_LABELS[task.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {client?.company ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {task.dueDate}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                  У этого человека пока нет задач — создайте новую.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </Surface>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) resetForm();
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Новая задача</DialogTitle>
            <DialogDescription>
              Назначьте исполнителя и срок. Задача сразу появится в списке шефа.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="task-title">Название</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например, согласовать замер"
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-assignee">Исполнитель</Label>
              <select
                id="task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-[var(--pult-line)] bg-white px-3 text-sm outline-none"
              >
                {activeTeam.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} · {ROLE_LABELS[member.role]}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="task-priority">Приоритет</Label>
                <select
                  id="task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="flex h-9 w-full rounded-lg border border-[var(--pult-line)] bg-white px-3 text-sm outline-none"
                >
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-status">Статус</Label>
                <select
                  id="task-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="flex h-9 w-full rounded-lg border border-[var(--pult-line)] bg-white px-3 text-sm outline-none"
                >
                  <option value="todo">К работе</option>
                  <option value="doing">В работе</option>
                  <option value="blocked">Блок</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-due">Срок</Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button
              className="rounded-full bg-[var(--pult-accent)] text-white hover:bg-[var(--pult-accent)]/90"
              onClick={handleCreate}
              disabled={!title.trim()}
            >
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
