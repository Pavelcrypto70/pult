"use client";

import Link from "next/link";
import { Clock3, HardHat, Wrench } from "lucide-react";
import { PageHeader, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  INSTALL_STATUS_LABELS,
  doorById,
  doorInstallJobs,
  doorOrders,
  type InstallStatus,
} from "@/lib/doors";

const tone: Record<InstallStatus, string> = {
  planned: "bg-sky-100 text-sky-900",
  in_progress: "bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]",
  done: "bg-secondary text-muted-foreground",
  warranty: "bg-[var(--pult-gold)]/20 text-[var(--pult-ink)]",
};

export default function DoorInstallPage() {
  const planned = doorInstallJobs.filter((j) => j.status === "planned").length;
  const hours = doorInstallJobs
    .filter((j) => j.status !== "done")
    .reduce((sum, j) => sum + j.hours, 0);
  const warranty = doorInstallJobs.filter((j) => j.status === "warranty").length;

  return (
    <div>
      <PageHeader
        title="Монтаж и сервис"
        description="Слоты бригад, часы на объекте, акты сдачи и гарантийные выезды."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              render={<Link href="/app/doors/orders" />}
            >
              Заказы
            </Button>
            <Button
              className="rounded-full bg-[var(--pult-ink)] text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90"
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
            Слотов впереди
          </div>
          <div className="mt-2 font-[family-name:var(--font-display)] text-2xl">
            {planned}
          </div>
        </Surface>
        <Surface className="p-4">
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Часов бригад
          </div>
          <div className="mt-2 font-[family-name:var(--font-display)] text-2xl">
            {hours}
          </div>
        </Surface>
        <Surface className="p-4">
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Гарантия
          </div>
          <div className="mt-2 font-[family-name:var(--font-display)] text-2xl">
            {warranty}
          </div>
        </Surface>
      </div>

      <div className="grid gap-3">
        {doorInstallJobs.map((job) => {
          const order = doorOrders.find((o) => o.id === job.orderId);
          const model = order ? doorById(order.modelId) : undefined;
          return (
            <Surface
              key={job.id}
              className="grid gap-4 p-5 transition-shadow hover:shadow-[var(--pult-shadow-lg)] lg:grid-cols-[1.2fr_0.8fr]"
            >
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h3 className="font-[family-name:var(--font-display)] text-lg tracking-tight">
                    {job.client}
                  </h3>
                  <Badge className={tone[job.status]}>
                    {INSTALL_STATUS_LABELS[job.status]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{job.address}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {model?.name ?? "Модель уточняется"} · {job.openings} проёмов
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {job.notes}
                </p>
              </div>
              <div className="grid gap-2 rounded-2xl bg-[var(--pult-canvas)]/80 p-4 text-sm sm:grid-cols-3 lg:grid-cols-1">
                <div className="inline-flex items-center gap-2">
                  <Clock3 className="size-4 text-[var(--pult-gold)]" />
                  <span>{job.date}</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <HardHat className="size-4 text-[var(--pult-accent)]" />
                  <span>{job.crew}</span>
                </div>
                <div className="inline-flex items-center gap-2">
                  <Wrench className="size-4 text-muted-foreground" />
                  <span>{job.hours} ч на объекте</span>
                </div>
              </div>
            </Surface>
          );
        })}
      </div>
    </div>
  );
}
