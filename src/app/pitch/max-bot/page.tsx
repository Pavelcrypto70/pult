"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Slide =
  | {
      id: string;
      kind: "title";
      eyebrow: string;
      title: string;
      subtitle: string;
    }
  | {
      id: string;
      kind: "steps";
      eyebrow: string;
      title: string;
      steps: { n: string; title: string; text: string }[];
    }
  | {
      id: string;
      kind: "split";
      eyebrow: string;
      title: string;
      bullets: string[];
      image: string;
      imageAlt: string;
      imageWide?: boolean;
    }
  | {
      id: string;
      kind: "grid";
      eyebrow: string;
      title: string;
      items: { title: string; text: string }[];
    }
  | {
      id: string;
      kind: "compare";
      eyebrow: string;
      title: string;
      left: { title: string; items: string[] };
      right: { title: string; items: string[] };
    }
  | {
      id: string;
      kind: "decide";
      eyebrow: string;
      title: string;
      mvp: string[];
      later: string[];
      note: string;
    };

const slides: Slide[] = [
  {
    id: "title",
    kind: "title",
    eyebrow: "Пульт · салон дверей",
    title: "Бот Max + канбан",
    subtitle:
      "Клиент пишет в Max → в Пульте появляется сделка → менеджер отвечает из карточки в тот же диалог. Презентация для решения: что берём в первый контур.",
  },
  {
    id: "idea",
    kind: "steps",
    eyebrow: "Идея одной фразой",
    title: "Как у Битрикса, но под двери",
    steps: [
      {
        n: "01",
        title: "Клиент",
        text: "Пишет боту салона в Max: обратная связь, замер, статус, рекламация.",
      },
      {
        n: "02",
        title: "Пульт",
        text: "Создаётся карточка на канбане, диалог привязывается к сделке.",
      },
      {
        n: "03",
        title: "Менеджер",
        text: "Отвечает из сайта. Клиент видит ответ в том же чате с ботом/салоном.",
      },
      {
        n: "04",
        title: "Процесс",
        text: "При смене блока можно слать статусные сообщения по шаблону.",
      },
    ],
  },
  {
    id: "bot-ui",
    kind: "split",
    eyebrow: "Шаг 1 · экран бота",
    title: "Меню, которое видит клиент",
    bullets: [
      "Обратная связь / перезвоните",
      "Статус заказа по номеру",
      "Заявка на замер",
      "Интерес к модели / каталог",
      "Рекламация / гарантия",
      "Всегда просим телефон (кнопка контакта)",
    ],
    image: "/pitch/pitch-bot-phone.png",
    imageAlt: "Макет чата бота Max",
  },
  {
    id: "flow",
    kind: "split",
    eyebrow: "Шаг 2 · связка с канбаном",
    title: "Из сообщения — карточка сделки",
    bullets: [
      "Webhook бота → бэкенд Пульта",
      "Новая сделка в «Новая заявка» (или сервис)",
      "В карточке: клиент, телефон, maxUserId, источник",
      "Дальше ведём заказ столбцами как сейчас",
      "Кнопка «Ответить в Max» пишет в тот же диалог",
    ],
    image: "/pitch/pitch-flow-kanban.png",
    imageAlt: "Схема: чат Max → карточка канбана",
    imageWide: true,
  },
  {
    id: "walk",
    kind: "steps",
    eyebrow: "Сценарий для шефа",
    title: "«Хочу обратную связь» — по шагам",
    steps: [
      {
        n: "1",
        title: "Клиент тыкает кнопку в боте",
        text: "Выбирает тему и удобное время, делится телефоном.",
      },
      {
        n: "2",
        title: "В Пульте появляется сделка",
        text: "Направление Продажа, блок «Новая заявка», ответственный по правилу.",
      },
      {
        n: "3",
        title: "Менеджер открывает карточку",
        text: "Видит суть, телефон, источник. Жмёт «Ответить в Max».",
      },
      {
        n: "4",
        title: "Клиент получает ответ в Max",
        text: "В том же диалоге с ботом салона — не в канале и не в личке менеджера.",
      },
    ],
  },
  {
    id: "modules",
    kind: "grid",
    eyebrow: "Что можно положить в бота",
    title: "Модули на выбор",
    items: [
      {
        title: "Обратная связь",
        text: "Заявка + задача менеджеру + автокарточка.",
      },
      {
        title: "Статус заказа",
        text: "Клиент спрашивает «где мой заказ» — читаемый статус из канбана.",
      },
      {
        title: "Замер",
        text: "Адрес, слот, фото проёма → блок Замер + задача.",
      },
      {
        title: "Каталог-интерес",
        text: "Выбрал модель → doorRef в сделке, без тяжёлого конфигуратора.",
      },
      {
        title: "Оплата / документы",
        text: "Реквизиты, скрин чека, КП файлом в чат.",
      },
      {
        title: "Монтаж",
        text: "Подтверждение даты, чеклист объекта, приёмка работ.",
      },
      {
        title: "Рекламации",
        text: "Фото + тип проблемы → сервисное направление.",
      },
      {
        title: "Автостатусы с доски",
        text: "«У поставщика» / «монтаж назначен» — шаблон с блока.",
      },
    ],
  },
  {
    id: "can-cannot",
    kind: "compare",
    eyebrow: "Честные границы Max",
    title: "Что да / что нет",
    left: {
      title: "Можем",
      items: [
        "Забирать заявки из бота в канбан",
        "Привязать диалог к сделке",
        "Отвечать из Пульта в тот же чат (от бота)",
        "Слать статусы при смене блока",
        "Кнопку «открыть», если есть ссылка чата",
      ],
    },
    right: {
      title: "Не можем / нецелесообразно",
      items: [
        "Открыть чат по одному только телефону как wa.me",
        "Писать с личного акка менеджера в тред бота",
        "Хранить токен Max на GitHub Pages",
        "Без бэкенда или коннектора — живая отправка",
      ],
    },
  },
  {
    id: "paths",
    kind: "compare",
    eyebrow: "Два пути подключения",
    title: "Коннектор или свой бот",
    left: {
      title: "Готовый коннектор",
      items: [
        "Umnico / Wazzup и аналоги",
        "~2–4 тыс. ₽/мес за канал Max",
        "Быстрее «как в Битриксе»",
        "Проще писать первым по телефону",
        "Зависимость от сервиса",
      ],
    },
    right: {
      title: "Свой бот + бэкенд",
      items: [
        "Верифицированный ИП в Max",
        "Подписка коннектору = 0",
        "Полный контроль шаблонов",
        "Клиент обычно сначала пишет боту",
        "Больше разработки и поддержки",
      ],
    },
  },
  {
    id: "decide",
    kind: "decide",
    eyebrow: "Предложение к обсуждению",
    title: "Что решить на встрече",
    mvp: [
      "Бот: обратная связь + телефон + статус заказа",
      "Автокарточка в Продаже",
      "Ответ менеджера из Пульта в тот же диалог",
      "Mock/реальная отправка — после выбора коннектор vs свой",
    ],
    later: [
      "Замер, каталог-интерес, монтаж, рекламации",
      "Автосообщения с блоков канбана",
      "Полный inbox входящих в карточке",
    ],
    note: "Документ логики: docs/LOGIC.md §8. Демо канбана уже в Пульте.",
  },
];

export default function MaxBotPitchPage() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const total = slides.length;

  const go = useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(total - 1, next)));
    },
    [total],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        go(index + 1);
      }
      if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(index - 1);
      }
      if (e.key === "Home") go(0);
      if (e.key === "End") go(total - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, total]);

  return (
    <div className="relative min-h-svh overflow-hidden bg-[var(--pult-ink)] text-[var(--pult-paper)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(11,107,86,0.35),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(154,123,79,0.22),transparent_50%)]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 60L60 0M30 60L60 30M0 30L30 0' stroke='%23fff' stroke-width='1' fill='none'/%3E%3C/svg%3E\")",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--pult-paper)] text-sm font-semibold text-[var(--pult-ink)]">
            P
          </span>
          <div>
            <div className="font-[family-name:var(--font-display)] text-sm tracking-tight">
              Пульт
            </div>
            <div className="text-[10px] tracking-[0.16em] text-white/55 uppercase">
              Pitch · Max + канбан
            </div>
          </div>
        </div>
        <div className="text-xs text-white/55">
          {index + 1} / {total} · ← → или пробел
        </div>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100svh-8rem)] w-full max-w-6xl flex-col justify-center px-5 py-6 sm:px-8">
        <div
          key={slide.id}
          className="animate-in fade-in slide-in-from-right-2 duration-300"
        >
          {slide.kind === "title" ? (
            <div className="max-w-3xl">
              <p className="mb-4 text-[11px] tracking-[0.2em] text-[var(--pult-accent-soft)] uppercase">
                {slide.eyebrow}
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-4xl leading-[1.05] tracking-tight sm:text-6xl">
                {slide.title}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
                {slide.subtitle}
              </p>
            </div>
          ) : null}

          {slide.kind === "steps" ? (
            <div>
              <p className="mb-3 text-[11px] tracking-[0.2em] text-[var(--pult-accent-soft)] uppercase">
                {slide.eyebrow}
              </p>
              <h2 className="mb-8 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
                {slide.title}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {slide.steps.map((step) => (
                  <div
                    key={step.n}
                    className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
                  >
                    <div className="mb-3 text-[11px] tracking-[0.18em] text-[var(--pult-gold,#c4a035)] uppercase">
                      {step.n}
                    </div>
                    <div className="text-lg font-medium">{step.title}</div>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">
                      {step.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {slide.kind === "split" ? (
            <div
              className={cn(
                "grid items-center gap-8",
                slide.imageWide ? "lg:grid-cols-[1fr_1.15fr]" : "lg:grid-cols-[1.05fr_0.95fr]",
              )}
            >
              <div>
                <p className="mb-3 text-[11px] tracking-[0.2em] text-[var(--pult-accent-soft)] uppercase">
                  {slide.eyebrow}
                </p>
                <h2 className="mb-6 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
                  {slide.title}
                </h2>
                <ul className="space-y-3">
                  {slide.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex gap-3 text-sm leading-relaxed text-white/75 sm:text-[15px]"
                    >
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--pult-accent)]" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 p-3 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)] lg:max-w-none">
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  width={slide.imageWide ? 1200 : 720}
                  height={slide.imageWide ? 675 : 1280}
                  className="h-auto w-full rounded-[1.1rem] object-cover"
                  priority
                />
              </div>
            </div>
          ) : null}

          {slide.kind === "grid" ? (
            <div>
              <p className="mb-3 text-[11px] tracking-[0.2em] text-[var(--pult-accent-soft)] uppercase">
                {slide.eyebrow}
              </p>
              <h2 className="mb-8 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
                {slide.title}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {slide.items.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <div className="text-sm font-medium">{item.title}</div>
                    <p className="mt-2 text-xs leading-relaxed text-white/60">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {slide.kind === "compare" ? (
            <div>
              <p className="mb-3 text-[11px] tracking-[0.2em] text-[var(--pult-accent-soft)] uppercase">
                {slide.eyebrow}
              </p>
              <h2 className="mb-8 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
                {slide.title}
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                {[slide.left, slide.right].map((col, i) => (
                  <div
                    key={col.title}
                    className={cn(
                      "rounded-3xl border p-6",
                      i === 0
                        ? "border-[var(--pult-accent)]/35 bg-[var(--pult-accent)]/15"
                        : "border-white/10 bg-white/5",
                    )}
                  >
                    <div className="mb-4 text-[11px] tracking-[0.16em] uppercase text-white/55">
                      {col.title}
                    </div>
                    <ul className="space-y-3">
                      {col.items.map((item) => (
                        <li
                          key={item}
                          className="text-sm leading-relaxed text-white/80"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {slide.kind === "decide" ? (
            <div>
              <p className="mb-3 text-[11px] tracking-[0.2em] text-[var(--pult-accent-soft)] uppercase">
                {slide.eyebrow}
              </p>
              <h2 className="mb-8 font-[family-name:var(--font-display)] text-3xl tracking-tight sm:text-4xl">
                {slide.title}
              </h2>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl border border-[var(--pult-accent)]/40 bg-[var(--pult-accent)]/15 p-6">
                  <div className="mb-4 text-[11px] tracking-[0.16em] uppercase text-[var(--pult-accent-soft)]">
                    Берём в первый контур
                  </div>
                  <ul className="space-y-3">
                    {slide.mvp.map((item) => (
                      <li key={item} className="text-sm leading-relaxed text-white/85">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="mb-4 text-[11px] tracking-[0.16em] uppercase text-white/55">
                    Потом
                  </div>
                  <ul className="space-y-3">
                    {slide.later.map((item) => (
                      <li key={item} className="text-sm leading-relaxed text-white/70">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <p className="mt-6 text-sm text-white/50">{slide.note}</p>
            </div>
          ) : null}
        </div>
      </main>

      <footer className="relative z-10 flex items-center justify-between gap-3 px-5 py-4 sm:px-8">
        <button
          type="button"
          onClick={() => go(index - 1)}
          disabled={index === 0}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
          Назад
        </button>
        <div className="flex gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Слайд ${i + 1}`}
              onClick={() => go(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-6 bg-[var(--pult-accent-soft)]" : "w-1.5 bg-white/25",
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(index + 1)}
          disabled={index === total - 1}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--pult-paper)] px-4 py-2 text-sm font-medium text-[var(--pult-ink)] disabled:opacity-30"
        >
          Дальше
          <ChevronRight className="size-4" />
        </button>
      </footer>
    </div>
  );
}
