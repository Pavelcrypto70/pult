"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  COLLECTION_LABELS,
  HARDWARE_PACKS,
  doorCatalog,
  estimateDoorConfig,
  formatDoorMoney,
  type GlassOption,
  type OpeningSide,
} from "@/lib/doors";

const openings: OpeningSide[] = ["левое", "правое", "маятник", "раздвижное"];
const glasses: GlassOption[] = [
  "нет",
  "прозрачное",
  "матовое",
  "рифлёное",
  "зеркальное",
];

export default function DoorConfiguratorPage() {
  const [modelId, setModelId] = useState(doorCatalog[0]?.id ?? "");
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(2000);
  const [opening, setOpening] = useState<OpeningSide>("левое");
  const [glass, setGlass] = useState<GlassOption>("нет");
  const [hardwareId, setHardwareId] =
    useState<(typeof HARDWARE_PACKS)[number]["id"]>("quiet");
  const [extensions, setExtensions] = useState(true);
  const [casing, setCasing] = useState(false);

  const model = doorCatalog.find((d) => d.id === modelId) ?? doorCatalog[0];
  const quote = useMemo(
    () =>
      estimateDoorConfig({
        basePrice: model?.priceFrom ?? 0,
        width,
        height,
        glass,
        hardwareId,
        extensions,
        casing,
      }),
    [model?.priceFrom, width, height, glass, hardwareId, extensions, casing],
  );

  return (
    <div>
      <PageHeader
        title="Конфигуратор"
        description="Соберите дверь под проём: размер, открывание, стекло, фурнитура — живая смета для салона."
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
              В заказы
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Surface className="space-y-5 p-5 sm:p-6">
          <div>
            <div className="mb-3 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
              Модель
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {doorCatalog.map((door) => (
                <button
                  key={door.id}
                  type="button"
                  onClick={() => setModelId(door.id)}
                  className={`rounded-2xl border px-3.5 py-3 text-left transition-all ${
                    modelId === door.id
                      ? "border-[var(--pult-gold)]/50 bg-[linear-gradient(135deg,rgba(154,123,79,0.14),rgba(255,255,255,0.95))] shadow-[var(--pult-shadow)]"
                      : "border-[var(--pult-line)] bg-white/80 hover:border-[var(--pult-gold)]/30"
                  }`}
                >
                  <div className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                    {COLLECTION_LABELS[door.collection]}
                  </div>
                  <div className="mt-0.5 text-sm font-medium">{door.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    от {formatDoorMoney(door.priceFrom)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="door-width">Ширина, мм</Label>
              <Input
                id="door-width"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value) || 0)}
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="door-height">Высота, мм</Label>
              <Input
                id="door-height"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value) || 0)}
                className="bg-white"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">Открывание</div>
            <div className="flex flex-wrap gap-2">
              {openings.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setOpening(item)}
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    opening === item
                      ? "bg-[var(--pult-ink)] text-[var(--pult-paper)]"
                      : "bg-[var(--pult-canvas)] text-muted-foreground"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">Стекло</div>
            <div className="flex flex-wrap gap-2">
              {glasses.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setGlass(item)}
                  className={`rounded-full px-3 py-1.5 text-sm ${
                    glass === item
                      ? "bg-[var(--pult-ink)] text-[var(--pult-paper)]"
                      : "bg-[var(--pult-canvas)] text-muted-foreground"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">Фурнитура</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {HARDWARE_PACKS.map((pack) => (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => setHardwareId(pack.id)}
                  className={`rounded-2xl border px-3 py-3 text-left ${
                    hardwareId === pack.id
                      ? "border-[var(--pult-accent)]/40 bg-[var(--pult-accent-soft)]/50"
                      : "border-[var(--pult-line)] bg-white"
                  }`}
                >
                  <div className="text-sm font-medium">{pack.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {pack.price ? `+ ${formatDoorMoney(pack.price)}` : "в базе"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setExtensions((v) => !v)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                extensions
                  ? "bg-[var(--pult-gold)]/20 text-[var(--pult-ink)]"
                  : "bg-[var(--pult-canvas)] text-muted-foreground"
              }`}
            >
              Доборы
            </button>
            <button
              type="button"
              onClick={() => setCasing((v) => !v)}
              className={`rounded-full px-3 py-1.5 text-sm ${
                casing
                  ? "bg-[var(--pult-gold)]/20 text-[var(--pult-ink)]"
                  : "bg-[var(--pult-canvas)] text-muted-foreground"
              }`}
            >
              Наличники
            </button>
          </div>
        </Surface>

        <Surface className="relative overflow-hidden p-5 sm:p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(145deg,rgba(26,33,30,0.92),rgba(154,123,79,0.55))]" />
          <div className="relative">
            <div className="mb-6 text-white">
              <div className="text-[11px] tracking-[0.16em] text-white/70 uppercase">
                Коммерческое
              </div>
              <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-tight">
                {model?.name}
              </h2>
              <p className="mt-1 text-sm text-white/75">
                {COLLECTION_LABELS[model?.collection ?? "atelier"]} · {width}×{height} ·{" "}
                {opening}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge className="bg-white/15 text-white">{model?.finish}</Badge>
                <Badge className="bg-white/15 text-white">{model?.sku}</Badge>
                <Badge className="bg-white/15 text-white">срок {model?.leadDays} дн.</Badge>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--pult-line)] bg-white/95 p-4 shadow-[var(--pult-shadow-lg)]">
              <div className="mb-3 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                Смета позиции
              </div>
              <ul className="space-y-2">
                {quote.lines.map((line) => (
                  <li
                    key={line.label}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="text-muted-foreground">{line.label}</span>
                    <span className="font-medium">{formatDoorMoney(line.amount)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-end justify-between border-t border-[var(--pult-line)] pt-4">
                <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                  Итого
                </div>
                <div className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
                  {formatDoorMoney(quote.total)}
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Цена без доставки и монтажа. После замера инженер подтверждает доборы и
                скрытый короб.
              </p>
              <Button
                className="mt-4 w-full rounded-full bg-[var(--pult-accent)] text-white hover:bg-[var(--pult-accent)]/90"
                render={<Link href="/app/doors/orders" />}
              >
                Сохранить в заказ
              </Button>
            </div>
          </div>
        </Surface>
      </div>
    </div>
  );
}
