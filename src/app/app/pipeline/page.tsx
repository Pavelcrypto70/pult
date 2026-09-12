import { PageHeader, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { clientById, deals, formatMoney, memberById } from "@/lib/mock-data";
import { STAGE_LABELS, type DealStage } from "@/lib/types";

const boardStages: DealStage[] = [
  "lead",
  "qualify",
  "proposal",
  "negotiation",
  "won",
];

export default function PipelinePage() {
  return (
    <div>
      <PageHeader
        title="Воронка"
        description="Короткая воронка без 40 стадий. Видно сумму и следующего ответственного."
      />

      <div className="flex gap-3 overflow-x-auto pb-2">
        {boardStages.map((stage) => {
          const column = deals.filter((d) => d.stage === stage);
          const sum = column.reduce((acc, d) => acc + d.amount, 0);
          return (
            <Surface key={stage} className="min-w-[260px] flex-1 p-3">
              <div className="mb-3 flex items-center justify-between gap-2 px-1">
                <div>
                  <div className="text-sm font-medium">{STAGE_LABELS[stage]}</div>
                  <div className="text-xs text-muted-foreground">{formatMoney(sum)}</div>
                </div>
                <Badge variant="secondary">{column.length}</Badge>
              </div>
              <div className="space-y-2">
                {column.map((deal) => {
                  const client = clientById(deal.clientId);
                  const owner = memberById(deal.ownerId);
                  return (
                    <article
                      key={deal.id}
                      className="rounded-xl border border-[var(--pult-line)] bg-[var(--pult-canvas)] p-3 transition-colors hover:border-[var(--pult-accent)]/35"
                    >
                      <h3 className="text-sm font-medium leading-snug">{deal.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {client?.company}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{formatMoney(deal.amount)}</span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {owner?.initials}
                        </span>
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
