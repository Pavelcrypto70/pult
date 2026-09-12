import Link from "next/link";
import { PageHeader, StatCard, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  activity,
  deals,
  formatMoney,
  memberById,
  tasks,
} from "@/lib/mock-data";
import {
  ORDER_STATUS_LABELS,
  doorInstallJobs,
  doorMeasurements,
  doorOrders,
  formatDoorMoney,
} from "@/lib/doors";
import { STAGE_LABELS, STATUS_LABELS } from "@/lib/types";

export default function DashboardPage() {
  const openDeals = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const pipelineSum = openDeals.reduce((sum, d) => sum + d.amount, 0);
  const hotTasks = tasks.filter((t) => t.status !== "done");
  const doorPipeline = doorOrders
    .filter((o) => o.status !== "done" && o.status !== "lost")
    .reduce((sum, o) => sum + o.amount, 0);
  const measuresSoon = doorMeasurements.filter((m) => m.status === "scheduled").length;
  const installsSoon = doorInstallJobs.filter((j) => j.status === "planned").length;

  return (
    <div>
      <PageHeader
        title="Обзор"
        description="Утренний срез студии и салона дверей: деньги, замеры, монтаж."
        actions={
          <>
            <Button
              variant="outline"
              className="rounded-full border-[var(--pult-line)] bg-white/80"
              render={<Link href="/app/doors" />}
            >
              Витрина
            </Button>
            <Button
              className="rounded-full bg-[var(--pult-ink)] px-5 text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90"
              render={<Link href="/app/doors/orders" />}
            >
              Заказы дверей
            </Button>
          </>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="В воронке" value={formatMoney(pipelineSum)} hint={`${openDeals.length} активных сделок`} />
        <StatCard label="Заказы дверей" value={formatDoorMoney(doorPipeline)} hint="Активный контур салона" />
        <StatCard label="Замеры" value={String(measuresSoon)} hint="Ближайшие выезды" />
        <StatCard label="Слоты монтажа" value={String(installsSoon)} hint="Бригады впереди" />
      </div>

      <Surface className="mb-6 overflow-hidden p-0">
        <div className="bg-[linear-gradient(120deg,#1a211e_0%,#3d4a43_48%,#9a7b4f_100%)] px-5 py-5 text-white sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[11px] tracking-[0.16em] text-white/70 uppercase">
                Atelier Doors · салон
              </div>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-tight">
                Операционный день магазина дверей
              </h2>
              <p className="mt-1 max-w-xl text-sm text-white/75">
                Витрина → замер → конфигуратор → предоплата → производство → монтаж.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="rounded-full border-white/25 bg-white/10 text-white hover:bg-white/15"
                render={<Link href="/app/doors/configurator" />}
              >
                Конфигуратор
              </Button>
              <Button
                className="rounded-full bg-white text-[var(--pult-ink)] hover:bg-white/90"
                render={<Link href="/app/doors/install" />}
              >
                Монтаж
              </Button>
            </div>
          </div>
        </div>
        <div className="grid gap-0 sm:grid-cols-3">
          {doorOrders
            .filter((o) => o.status === "measure" || o.status === "install" || o.status === "production")
            .slice(0, 3)
            .map((order) => (
              <div
                key={order.id}
                className="border-t border-[var(--pult-line)] p-4 sm:border-t-0 sm:border-l first:sm:border-l-0"
              >
                <div className="text-sm font-medium">{order.client}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {ORDER_STATUS_LABELS[order.status]} · {order.object}
                </div>
                <div className="mt-2 font-[family-name:var(--font-display)] text-sm">
                  {formatDoorMoney(order.amount)}
                </div>
              </div>
            ))}
        </div>
      </Surface>

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
