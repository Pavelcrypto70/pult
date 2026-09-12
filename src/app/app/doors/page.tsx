"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DoorOpen, Sparkles, Warehouse } from "lucide-react";
import { PageHeader, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  COLLECTION_LABELS,
  doorCatalog,
  formatDoorMoney,
  type DoorCollection,
} from "@/lib/doors";

const collections = Object.keys(COLLECTION_LABELS) as DoorCollection[];

export default function DoorShowroomPage() {
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState<"all" | DoorCollection>("all");
  const [showroomOnly, setShowroomOnly] = useState(false);

  const items = useMemo(() => {
    return doorCatalog.filter((door) => {
      if (collection !== "all" && door.collection !== collection) return false;
      if (showroomOnly && !door.inShowroom) return false;
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        door.name.toLowerCase().includes(q) ||
        door.sku.toLowerCase().includes(q) ||
        door.tags.some((tag) => tag.includes(q))
      );
    });
  }, [collection, query, showroomOnly]);

  const showroomCount = doorCatalog.filter((d) => d.inShowroom).length;
  const avgPrice = Math.round(
    doorCatalog.reduce((sum, d) => sum + d.priceFrom, 0) / doorCatalog.length,
  );

  return (
    <div>
      <PageHeader
        title="Витрина дверей"
        description="Премиальные коллекции салона: модель, покрытие, срок и наличие на экспозиции."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="rounded-full"
              render={<Link href="/app/doors/configurator" />}
            >
              Конфигуратор
            </Button>
            <Button
              className="rounded-full bg-[var(--pult-ink)] text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90"
              render={<Link href="/app/doors/orders" />}
            >
              Заказы
            </Button>
          </div>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Surface className="p-4">
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Моделей
          </div>
          <div className="mt-2 font-[family-name:var(--font-display)] text-2xl">
            {doorCatalog.length}
          </div>
        </Surface>
        <Surface className="p-4">
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            На витрине
          </div>
          <div className="mt-2 font-[family-name:var(--font-display)] text-2xl">
            {showroomCount}
          </div>
        </Surface>
        <Surface className="p-4">
          <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            Средний чек от
          </div>
          <div className="mt-2 font-[family-name:var(--font-display)] text-2xl">
            {formatDoorMoney(avgPrice)}
          </div>
        </Surface>
      </div>

      <Surface className="mb-5 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по модели, артикулу, тегу…"
            className="bg-white lg:max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCollection("all")}
              className={`rounded-full px-3 py-1.5 text-sm ${
                collection === "all"
                  ? "bg-[var(--pult-ink)] text-[var(--pult-paper)]"
                  : "bg-white text-muted-foreground"
              }`}
            >
              Все
            </button>
            {collections.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCollection(item)}
                className={`rounded-full px-3 py-1.5 text-sm ${
                  collection === item
                    ? "bg-[var(--pult-ink)] text-[var(--pult-paper)]"
                    : "bg-white text-muted-foreground"
                }`}
              >
                {COLLECTION_LABELS[item]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowroomOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ${
                showroomOnly
                  ? "bg-[var(--pult-gold)]/20 text-[var(--pult-ink)]"
                  : "bg-white text-muted-foreground"
              }`}
            >
              <Sparkles className="size-3.5" />
              Только витрина
            </button>
          </div>
        </div>
      </Surface>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((door) => (
          <Surface
            key={door.id}
            className="group overflow-hidden p-0 transition-shadow hover:shadow-[var(--pult-shadow-lg)]"
          >
            <div className="relative h-36 bg-[linear-gradient(145deg,#1a211e_0%,#3d4a43_45%,#c4a574_100%)]">
              <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(90deg,transparent_0,rgba(255,255,255,0.2)_50%,transparent_100%)]" />
              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                <div>
                  <div className="text-[11px] tracking-[0.16em] text-white/70 uppercase">
                    {COLLECTION_LABELS[door.collection]}
                  </div>
                  <div className="font-[family-name:var(--font-display)] text-lg text-white">
                    {door.name}
                  </div>
                </div>
                <DoorOpen className="size-5 text-white/80" />
              </div>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary">{door.finish}</Badge>
                <Badge variant="secondary">{door.sku}</Badge>
                {door.inShowroom ? (
                  <Badge className="bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]">
                    Витрина
                  </Badge>
                ) : (
                  <Badge variant="secondary">Под заказ</Badge>
                )}
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{door.note}</p>
              <div className="flex items-end justify-between gap-3 border-t border-[var(--pult-line)] pt-3">
                <div>
                  <div className="text-[11px] text-muted-foreground uppercase">от</div>
                  <div className="font-[family-name:var(--font-display)] text-xl tracking-tight">
                    {formatDoorMoney(door.priceFrom)}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div className="inline-flex items-center gap-1">
                    <Warehouse className="size-3.5" />
                    склад: {door.stock}
                  </div>
                  <div>срок {door.leadDays} дн.</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {door.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--pult-canvas)] px-2 py-0.5 text-[11px] text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </Surface>
        ))}
      </div>
    </div>
  );
}
