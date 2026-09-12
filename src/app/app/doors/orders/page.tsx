"use client";

import Link from "next/link";
import { PageHeader, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_ORDER,
  doorById,
  doorOrders,
  formatDoorMoney,
  type OrderStatus,
} from "@/lib/doors";

const activeStatuses: OrderStatus[] = ORDER_STATUS_ORDER.filter(
  (status) => status !== "done" && status !== "lost",
);

function statusTone(status: OrderStatus): string {
  if (status === "install" || status === "delivery") {
    return "bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]";
  }
  if (status === "production" || status === "deposit") {
    return "bg-[var(--pult-gold)]/20 text-[var(--pult-ink)]";
  }
  if (status === "quote" || status === "measure") {
    return "bg-sky-100 text-sky-900";
  }
  return "bg-secondary text-muted-foreground";
}

export default function DoorOrdersPage() {
  const pipelineSum = doorOrders
    .filter((o) => o.status !== "done" && o.status !== "lost")
    .reduce((sum, o) => sum + o.amount, 0);
  const deposits = doorOrders.reduce((sum, o) => sum + o.deposit, 0);

  return (
    <div>
      <PageHeader
        title="Заказы дверей"
        description="Полный цикл: заявка → замер → КП → предоплата → производство → монтаж."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              render={<Link href="/app/doors" />}
            >
              Витрина
            </Button>
            <Button
              className="rounded-full bg-[var(--pult-accent)] text-white hover:bg-[var(--pult-accent)]/90"
              render={<Link href="/app/doors/measurements" />}
            >
              Замеры
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Surface className="p-4">
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            В работе
          </div>
          <div className="mt-2 font-[family-name:var(--font-display)] text-2xl">
            {formatDoorMoney(pipelineSum)}
          </div>
        </Surface>
        <Surface className="p-4">
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Собрано предоплат
          </div>
          <div className="mt-2 font-[family-name:var(--font-display)] text-2xl">
            {formatDoorMoney(deposits)}
          </div>
        </Surface>
        <Surface className="p-4">
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Активных заказов
          </div>
          <div className="mt-2 font-[family-name:var(--font-display)] text-2xl">
            {doorOrders.filter((o) => o.status !== "done" && o.status !== "lost").length}
          </div>
        </Surface>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {activeStatuses.map((status) => {
          const column = doorOrders.filter((order) => order.status === status);
          const sum = column.reduce((acc, order) => acc + order.amount, 0);
          return (
            <Surface key={status} className="min-w-[260px] flex-1 p-3">
              <div className="mb-3 flex items-center justify-between gap-2 px-1">
                <div>
                  <div className="text-sm font-medium">{ORDER_STATUS_LABELS[status]}</div>
                  <div className="text-xs text-muted-foreground">{formatDoorMoney(sum)}</div>
                </div>
                <Badge variant="secondary">{column.length}</Badge>
              </div>
              <div className="space-y-2">
                {column.map((order) => {
                  const model = doorById(order.modelId);
                  return (
                    <article
                      key={order.id}
                      className="rounded-2xl border border-[var(--pult-line)] bg-[linear-gradient(180deg,#fff,rgba(247,248,246,0.92))] p-3.5 transition-all hover:-translate-y-0.5 hover:border-[var(--pult-gold)]/40 hover:shadow-[var(--pult-shadow)]"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h3 className="text-sm font-medium leading-snug">{order.client}</h3>
                        <Badge className={statusTone(order.status)}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{order.object}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {model?.name ?? "Модель уточняется"} · {order.city}
                      </p>
                      <div className="mt-3 flex items-end justify-between gap-2">
                        <div>
                          <div className="font-[family-name:var(--font-display)] text-sm">
                            {formatDoorMoney(order.amount)}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            предоплата {formatDoorMoney(order.deposit)}
                          </div>
                        </div>
                        <div className="text-right text-[11px] text-muted-foreground">
                          <div>{order.manager}</div>
                          {order.installDate ? <div>монтаж {order.installDate}</div> : null}
                        </div>
                      </div>
                    </article>
                  );
                })}
                {column.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-[var(--pult-line)] px-3 py-8 text-center text-xs text-muted-foreground">
                    Пусто
                  </div>
                ) : null}
              </div>
            </Surface>
          );
        })}
      </div>
    </div>
  );
}
