import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 text-[11px] font-medium tracking-[0.18em] text-[var(--pult-accent)] uppercase">
          Пульт
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-[1.75rem] tracking-tight text-[var(--pult-ink)] sm:text-[2rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Surface({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.35rem] border border-[var(--pult-line)] bg-white/80 shadow-[var(--pult-shadow)] backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Surface className="relative overflow-hidden p-4 sm:p-5">
      <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-[radial-gradient(circle,rgba(11,107,86,0.12),transparent_70%)]" />
      <div className="text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </div>
      <div className="mt-3 font-[family-name:var(--font-display)] text-[1.65rem] tracking-tight text-[var(--pult-ink)]">
        {value}
      </div>
      {hint ? <div className="mt-1.5 text-sm text-muted-foreground">{hint}</div> : null}
    </Surface>
  );
}
