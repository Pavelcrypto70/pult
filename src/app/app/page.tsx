import Link from "next/link";
import { PageHeader, StatCard, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  activity,
  clients,
  deals,
  formatMoney,
  memberById,
  tasks,
} from "@/lib/mock-data";
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/types";

export default function DashboardPage() {
  const openDeals = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const pipelineSum = openDeals.reduce((sum, d) => sum + d.amount, 0);
  const hotTasks = tasks.filter((t) => t.status !== "done");

  return (
    <div>
      <PageHeader
        title="Обзор"
        description="Утренний срез студии: что горит, где деньги и кто перегружен."
        actions={
          <>
            <Button
              variant="outline"
              className="rounded-full border-[var(--pult-line)] bg-white/80"
              render={<Link href="/app/pipeline" />}
            >
              Воронка
            </Button>
            <Button
              className="rounded-full bg-[var(--pult-ink)] px-5 text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90"
              render={<Link href="/app/tasks" />}
            >
              Задачи
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="В воронке" value={formatMoney(pipelineSum)} hint={`${openDeals.length} активных сделок`} />
        <StatCard label="Клиенты" value={String(clients.length)} hint="В рабочем контуре" />
        <StatCard label="Открытые задачи" value={String(hotTasks.length)} hint="Без завершённых" />
        <StatCard label="Горит сегодня" value="3" hint="Дедлайны и блокеры" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Surface className="p-5 sm:p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-lg tracking-tight">Активные сделки</h2>
            <Badge variant="secondary" className="rounded-full">{openDeals.length}</Badge>
          </div>
          <div className="space-y-3">
            {openDeals.map((deal) => {
              const owner = memberById(deal.ownerId);
              return (
                <div
                  key={deal.id}
                  className="flex flex-col gap-2 rounded-2xl border border-[var(--pult-line)] bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(247,248,246,0.9))] px-4 py-3.5 transition-all hover:border-[var(--pult-accent)]/30 hover:shadow-[var(--pult-shadow)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-medium tracking-tight">{deal.title}</div>
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      {STAGE_LABELS[deal.stage]} · {owner?.name}
                    </div>
                  </div>
                  <div className="font-[family-name:var(--font-display)] text-sm tracking-tight">
                    {formatMoney(deal.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </Surface>

        <div className="space-y-4">
          <Surface className="p-5">
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg">Лента</h2>
            <ul className="space-y-4">
              {activity.map((item) => (
                <li key={item.id} className="border-b border-[var(--pult-line)] pb-3 last:border-0 last:pb-0">
                  <p className="text-sm leading-relaxed">{item.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>
                </li>
              ))}
            </ul>
          </Surface>
          <Surface className="p-5">
            <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg">Задачи в работе</h2>
            <div className="space-y-3">
              {hotTasks.slice(0, 4).map((task) => (
                <div key={task.id} className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium">{task.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {STATUS_LABELS[task.status]} · до {task.dueDate}
                    </div>
                  </div>
                  {task.priority === "high" ? (
                    <Badge className="bg-[var(--pult-warm)] text-white">High</Badge>
                  ) : null}
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}
