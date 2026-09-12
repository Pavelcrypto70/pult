"use client";

import Link from "next/link";
import { CalendarClock, MapPin, Ruler } from "lucide-react";
import { PageHeader, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { doorMeasurements } from "@/lib/doors";

const statusLabel = {
  scheduled: "Назначен",
  done: "Выполнен",
  rework: "Перезамер",
} as const;

const statusClass = {
  scheduled: "bg-sky-100 text-sky-900",
  done: "bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]",
  rework: "bg-[var(--pult-gold)]/20 text-[var(--pult-ink)]",
} as const;

export default function DoorMeasurementsPage() {
  const scheduled = doorMeasurements.filter((m) => m.status === "scheduled").length;
  const openings = doorMeasurements.reduce((sum, m) => sum + m.openings, 0);

  return (
    <div>
      <PageHeader
        title="Замеры"
        description="Выезды инженеров, размеры проёмов и готовность объекта к монтажу."
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
              className="rounded-full bg-[var(--pult-ink)] text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90"
              render={<Link href="/app/doors/orders" />}
            >
              К заказам
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Surface className="p-4">
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Ближайшие выезды
          </div>
          <div className="mt-2 font-[family-name:var(--font-display)] text-2xl">
            {scheduled}
          </div>
        </Surface>
        <Surface className="p-4">
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Проёмов в работе
          </div>
          <div className="mt-2 font-[family-name:var(--font-display)] text-2xl">
            {openings}
          </div>
        </Surface>
        <Surface className="p-4">
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Стандарт
          </div>
          <div className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Фото + размеры + толщина стены + заметки по полу и коробу.
          </div>
        </Surface>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {doorMeasurements.map((item) => (
          <Surface key={item.id} className="p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-lg tracking-tight">
                  {item.client}
                </h3>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-3.5" />
                  {item.address}
                </p>
              </div>
              <Badge className={statusClass[item.status]}>
                {statusLabel[item.status]}
              </Badge>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 rounded-2xl bg-[var(--pult-canvas)]/80 p-3 text-sm">
              <div>
                <div className="text-[11px] text-muted-foreground uppercase">Ширина</div>
                <div className="font-medium">{item.width}</div>
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground uppercase">Высота</div>
                <div className="font-medium">{item.height}</div>
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground uppercase">Стена</div>
                <div className="font-medium">{item.wall}</div>
              </div>
              <div>
                <div className="text-[11px] text-muted-foreground uppercase">Проёмы</div>
                <div className="font-medium">{item.openings}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-3.5" />
                {item.date}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Ruler className="size-3.5" />
                {item.engineer}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {item.notes}
            </p>
          </Surface>
        ))}
      </div>
    </div>
  );
}
