import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-svh">
      <section className="relative isolate min-h-[100svh] overflow-hidden pult-hero">
        <div className="absolute inset-0 pult-grid" aria-hidden />
        <div className="absolute inset-0 pult-grain" aria-hidden />
        <div
          className="absolute -right-24 top-10 h-[68vmin] w-[68vmin] rounded-full bg-[radial-gradient(circle,rgba(11,107,86,0.28),transparent_68%)] blur-2xl pult-orbit"
          aria-hidden
        />
        <div
          className="absolute -left-24 bottom-0 h-[52vmin] w-[52vmin] rounded-full bg-[radial-gradient(circle,rgba(154,123,79,0.22),transparent_70%)] blur-2xl pult-orbit-slow"
          aria-hidden
        />

        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col px-5 pb-16 pt-6 sm:px-8">
          <nav className="flex items-center justify-between gap-4 pult-fade">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--pult-ink)] text-sm font-semibold tracking-wide text-[var(--pult-paper)] shadow-[0_10px_30px_-12px_rgba(12,18,16,0.65)]">
                P
              </span>
              <div className="leading-tight">
                <div className="font-[family-name:var(--font-display)] text-lg tracking-tight">
                  Пульт
                </div>
                <div className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                  Door Salon
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="hidden sm:inline-flex" render={<Link href="/app" />}>
                Войти
              </Button>
              <Button
                className="rounded-full bg-[var(--pult-ink)] px-5 text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90"
                render={<Link href="/app/pipeline" />}
              >
                Открыть сделки
              </Button>
            </div>
          </nav>

          <div className="mt-auto grid gap-10 pb-6 pt-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="max-w-3xl">
              <p className="mb-5 text-xs font-medium tracking-[0.22em] text-[var(--pult-accent)] uppercase pult-rise">
                Магазин дверей
              </p>
              <p className="font-[family-name:var(--font-display)] text-[clamp(3.2rem,11vw,6.8rem)] leading-[0.88] tracking-[-0.045em] text-[var(--pult-ink)] pult-rise">
                Пульт
              </p>
              <h1 className="mt-6 max-w-xl text-balance text-2xl font-medium leading-tight text-[var(--pult-ink-soft)] sm:text-[2rem] pult-rise-2">
                Операционка салона дверей — от витрины до монтажа
              </h1>
              <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg pult-rise-3">
                Сделки по трём направлениям, витрина, замеры, конфигуратор и общий отчёт.
                Без лишних модулей и конструктора компаний.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-3 pult-rise-4">
                <Button
                  size="lg"
                  className="rounded-full bg-[var(--pult-accent)] px-7 text-white shadow-[0_16px_40px_-18px_rgba(11,107,86,0.8)] hover:bg-[var(--pult-accent)]/90"
                  render={<Link href="/app/pipeline" />}
                >
                  Смотреть канбан
                </Button>
                <span className="text-sm text-muted-foreground">
                  Продажа · Поставка · Сервис
                </span>
              </div>
            </div>

            <div className="pult-glass rounded-[1.6rem] p-5 sm:p-6 pult-rise-3">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs tracking-[0.16em] text-muted-foreground uppercase">
                  Live preview
                </span>
                <span className="rounded-full bg-[var(--pult-accent-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--pult-accent)]">
                  online
                </span>
              </div>
              <div className="space-y-3">
                {[
                  ["Сделки на досках", "22"],
                  ["Заказы в работе", "3,5 млн ₽"],
                  ["Направления", "3"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-2xl border border-[var(--pult-line)] bg-white/70 px-4 py-3"
                  >
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="font-[family-name:var(--font-display)] text-lg tracking-tight">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--pult-line)] bg-[var(--pult-elevated)]/80">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 md:grid-cols-3">
          {[
            {
              title: "Три направления",
              text: "Продажа, поставка/доставка/монтаж и постгарантийный сервис — каждая со своими столбцами.",
            },
            {
              title: "Салон целиком",
              text: "Витрина, заказы, замеры, конфигуратор и монтаж в одном контуре, без комбайна.",
            },
            {
              title: "Общий отчёт",
              text: "Сводка по деньгам, флагам, ответственным и операциям салона на одном экране.",
            },
          ].map((item) => (
            <div key={item.title} className="group">
              <div className="mb-4 h-px w-10 bg-[var(--pult-accent)] transition-all group-hover:w-16" />
              <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
                {item.title}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
