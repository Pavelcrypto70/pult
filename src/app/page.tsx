import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <main className="min-h-svh">
      <section className="relative isolate min-h-[100svh] overflow-hidden pult-hero">
        <div className="absolute inset-0 pult-grid" aria-hidden />
        <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-6xl flex-col px-5 pb-16 pt-6 sm:px-8">
          <nav className="flex items-center justify-between gap-4 pult-fade">
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--pult-ink)] text-sm font-semibold text-[var(--pult-paper)]">
                P
              </span>
              <span className="font-[family-name:var(--font-display)] text-lg tracking-tight">
                Пульт
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" render={<Link href="/app" />}>
                Войти
              </Button>
              <Button
                className="bg-[var(--pult-ink)] text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90"
                render={<Link href="/app" />}
              >
                Открыть демо
              </Button>
            </div>
          </nav>

          <div className="mt-auto max-w-3xl pb-8 pt-24">
            <p className="font-[family-name:var(--font-display)] text-[clamp(3rem,12vw,7rem)] leading-[0.9] tracking-[-0.04em] pult-rise">
              Пульт
            </p>
            <h1 className="mt-5 max-w-xl text-balance text-2xl font-medium leading-tight sm:text-3xl pult-rise-2">
              Битрикс без боли — для команд, которым нужна ясность
            </h1>
            <p className="mt-4 max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg pult-rise-3">
              Клиенты, короткая воронка, задачи и админка с топовым интерфейсом.
              Без комбайна, роботов на 40 стадий и ощущения портала из 2012.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 pult-rise-3">
              <Button
                size="lg"
                className="bg-[var(--pult-accent)] px-6 text-white hover:bg-[var(--pult-accent)]/90"
                render={<Link href="/app" />}
              >
                Смотреть рабочий кабинет
              </Button>
              <span className="text-sm text-muted-foreground">
                MVP-каркас большого продукта
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--pult-line)] bg-[var(--pult-elevated)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-3">
          {[
            {
              title: "Только нужное",
              text: "Клиенты, сделки, задачи, команда, права. Без склада, телефонии и конструктора вселенной.",
            },
            {
              title: "Интерфейс как продукт",
              text: "Админка и рабочие экраны на одном визуальном языке — быстро, плотно, современно.",
            },
            {
              title: "Для студий 5–30",
              text: "Владелец видит деньги и сроки. Менеджер — воронку. Исполнитель — свои задачи.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h2 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
                {item.title}
              </h2>
              <p className="mt-2 text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
