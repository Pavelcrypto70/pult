"use client";

import { useMemo, useState } from "react";
import { Archive, RotateCcw, Search } from "lucide-react";
import { DealDetailDialog } from "@/components/board/deal-detail-dialog";
import { RestoreDealDialog } from "@/components/board/restore-deal-dialog";
import { PageHeader, StatCard, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBoard } from "@/hooks/use-board";
import {
  CLOSE_OUTCOME_LABELS,
  archiveMonthKey,
  archivedCards,
  availableArchiveMonths,
  formatBoardMoney,
  monthLabel,
  statsForMonth,
  winRate,
  type CloseOutcome,
  type DealCard,
  type DirectionId,
} from "@/lib/board";

const ALL = "all" as const;

export default function ArchivePage() {
  const board = useBoard();
  const [month, setMonth] = useState<string | typeof ALL>(ALL);
  const [outcome, setOutcome] = useState<CloseOutcome | typeof ALL>(ALL);
  const [directionId, setDirectionId] = useState<DirectionId | typeof ALL>(ALL);
  const [owner, setOwner] = useState<string | typeof ALL>(ALL);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [restoreId, setRestoreId] = useState<string | null>(null);

  const months = useMemo(
    () => availableArchiveMonths(board.state.cards),
    [board.state.cards],
  );
  const defaultMonth = months[0] ?? new Date().toISOString().slice(0, 7);
  const statsMonth = month === ALL ? defaultMonth : month;
  const stats = useMemo(
    () => statsForMonth(board.state.cards, statsMonth),
    [board.state.cards, statsMonth],
  );
  const rate = winRate(stats);

  const owners = useMemo(() => {
    const set = new Set<string>();
    for (const c of archivedCards(board.state.cards)) set.add(c.owner);
    return [...set].sort();
  }, [board.state.cards]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return archivedCards(board.state.cards).filter((c) => {
      if (month !== ALL && (!c.archivedAt || archiveMonthKey(c.archivedAt) !== month)) {
        return false;
      }
      if (outcome !== ALL && c.closeOutcome !== outcome) return false;
      if (directionId !== ALL && c.directionId !== directionId) return false;
      if (owner !== ALL && c.owner !== owner) return false;
      if (!q) return true;
      return (
        c.number.toLowerCase().includes(q) ||
        c.client.toLowerCase().includes(q) ||
        (c.closeReason ?? "").toLowerCase().includes(q)
      );
    });
  }, [board.state.cards, month, outcome, directionId, owner, query]);

  const selected = board.state.cards.find((c) => c.id === selectedId) ?? null;
  const restoreCard = board.state.cards.find((c) => c.id === restoreId) ?? null;
  const selectedBlock = selected
    ? board.state.blocks.find((b) => b.id === selected.blockId)
    : undefined;
  const selectedDirection = selected
    ? board.state.directions.find((d) => d.id === selected.directionId)
    : undefined;

  if (!board.ready) {
    return (
      <div className="rounded-2xl border border-[var(--pult-line)] bg-white/70 px-4 py-16 text-center text-sm text-muted-foreground">
        Загружаем архив…
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Архив"
        description="Закрытые сделки, ранние отказы и статистика по месяцу архивации."
        actions={
          <Button
            variant="outline"
            className="rounded-full"
            onClick={() => board.resetBoard()}
          >
            Сбросить демо-доску
          </Button>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`Выручка · ${monthLabel(statsMonth)}`}
          value={formatBoardMoney(stats.wonAmount)}
          hint={`${stats.wonCount} успехов`}
        />
        <StatCard
          label="Потеряно"
          value={formatBoardMoney(stats.lostAmount)}
          hint={`${stats.lostCount + stats.cancelledCount} отказов/отмен`}
        />
        <StatCard
          label="Конверсия в успех"
          value={rate == null ? "—" : `${rate}%`}
          hint="won / (won+lost+cancelled)"
        />
        <StatCard
          label="Раннее закрытие"
          value={String(stats.earlyCloseCount)}
          hint="Отказы и отмены за месяц"
        />
      </div>

      <Surface className="mb-4 p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <FilterSelect
              label="Месяц"
              value={month}
              onChange={setMonth}
              options={[
                { value: ALL, label: "Все месяцы" },
                ...months.map((m) => ({ value: m, label: monthLabel(m) })),
              ]}
            />
            <FilterSelect
              label="Исход"
              value={outcome}
              onChange={(v) => setOutcome(v as CloseOutcome | typeof ALL)}
              options={[
                { value: ALL, label: "Все исходы" },
                ...Object.entries(CLOSE_OUTCOME_LABELS).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
            />
            <FilterSelect
              label="Направление"
              value={directionId}
              onChange={(v) => setDirectionId(v as DirectionId | typeof ALL)}
              options={[
                { value: ALL, label: "Все направления" },
                ...board.state.directions.map((d) => ({
                  value: d.id,
                  label: d.short,
                })),
              ]}
            />
            <FilterSelect
              label="Ответственный"
              value={owner}
              onChange={setOwner}
              options={[
                { value: ALL, label: "Все" },
                ...owners.map((o) => ({ value: o, label: o })),
              ]}
            />
          </div>
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Номер, клиент, причина…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 rounded-xl border-[var(--pult-line)] bg-white pl-9"
            />
          </div>
        </div>
      </Surface>

      <Surface className="overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-[var(--pult-line)] px-4 py-3">
          <Archive className="size-4 text-[var(--pult-accent)]" />
          <h2 className="font-[family-name:var(--font-display)] text-lg">
            Закрытые сделки
          </h2>
          <Badge variant="secondary" className="rounded-full">
            {list.length}
          </Badge>
        </div>

        {list.length === 0 ? (
          <div className="px-4 py-16 text-center text-sm text-muted-foreground">
            В архиве пока пусто по выбранным фильтрам.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-[var(--pult-canvas)]/70 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Сделка</th>
                  <th className="px-4 py-3 font-medium">Сумма</th>
                  <th className="px-4 py-3 font-medium">Исход</th>
                  <th className="px-4 py-3 font-medium">Причина</th>
                  <th className="px-4 py-3 font-medium">Дата</th>
                  <th className="px-4 py-3 font-medium">Кто</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {list.map((card) => (
                  <ArchiveRow
                    key={card.id}
                    card={card}
                    blockTitle={
                      board.state.blocks.find(
                        (b) => b.id === (card.archivedFromBlockId ?? card.blockId),
                      )?.title ?? "—"
                    }
                    onOpen={() => setSelectedId(card.id)}
                    onRestore={() => setRestoreId(card.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Surface>

      <DealDetailDialog
        card={selected}
        block={selectedBlock}
        direction={selectedDirection}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onAction={() => undefined}
      />

      <RestoreDealDialog
        card={restoreCard}
        directions={board.state.directions}
        blocks={board.state.blocks}
        open={Boolean(restoreCard)}
        onOpenChange={(open) => {
          if (!open) setRestoreId(null);
        }}
        onConfirm={(input) => {
          if (!restoreCard) return;
          board.restoreCard(restoreCard.id, input);
          setRestoreId(null);
          if (selectedId === restoreCard.id) setSelectedId(null);
        }}
      />
    </div>
  );
}

function ArchiveRow({
  card,
  blockTitle,
  onOpen,
  onRestore,
}: {
  card: DealCard;
  blockTitle: string;
  onOpen: () => void;
  onRestore: () => void;
}) {
  const outcome = card.closeOutcome ?? "other";
  return (
    <tr className="border-t border-[var(--pult-line)] hover:bg-white/70">
      <td className="px-4 py-3">
        <button type="button" onClick={onOpen} className="text-left">
          <div className="font-medium">{card.number}</div>
          <div className="text-xs text-muted-foreground">{card.client}</div>
          <div className="mt-0.5 text-[10px] text-muted-foreground">
            из блока «{blockTitle}»
          </div>
        </button>
      </td>
      <td className="px-4 py-3 font-[family-name:var(--font-display)]">
        {formatBoardMoney(card.amount)}
      </td>
      <td className="px-4 py-3">
        <Badge
          className={
            outcome === "won"
              ? "rounded-full bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]"
              : "rounded-full bg-[#fde8e4] text-[#9b3a2c]"
          }
        >
          {CLOSE_OUTCOME_LABELS[outcome]}
        </Badge>
      </td>
      <td className="max-w-[180px] truncate px-4 py-3 text-muted-foreground">
        {card.closeReason || "—"}
      </td>
      <td className="px-4 py-3 text-muted-foreground">{card.archivedAt || "—"}</td>
      <td className="px-4 py-3 text-muted-foreground">{card.archivedBy || "—"}</td>
      <td className="px-4 py-3 text-right">
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={onRestore}
        >
          <RotateCcw className="size-3.5" />
          Вернуть
        </Button>
      </td>
    </tr>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block space-y-1 text-xs">
      <span className="tracking-[0.12em] text-muted-foreground uppercase">{label}</span>
      <select
        className="flex h-9 w-full rounded-xl border border-[var(--pult-line)] bg-white px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
