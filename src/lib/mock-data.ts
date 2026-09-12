import type { ActivityItem, Client, Deal, TaskItem, TeamMember } from "./types";

export const team: TeamMember[] = [
  {
    id: "u1",
    name: "Анна Крылова",
    email: "anna@studio.ru",
    role: "owner",
    initials: "АК",
    active: true,
  },
  {
    id: "u2",
    name: "Илья Морозов",
    email: "ilya@studio.ru",
    role: "manager",
    initials: "ИМ",
    active: true,
  },
  {
    id: "u3",
    name: "Мария Соколова",
    email: "maria@studio.ru",
    role: "member",
    initials: "МС",
    active: true,
  },
  {
    id: "u4",
    name: "Павел Орлов",
    email: "pavel@studio.ru",
    role: "admin",
    initials: "ПО",
    active: true,
  },
  {
    id: "u5",
    name: "Дима архивный",
    email: "dima@studio.ru",
    role: "member",
    initials: "ДА",
    active: false,
  },
];

export const clients: Client[] = [
  {
    id: "c1",
    name: "Елена В.",
    company: "Север Маркет",
    email: "elena@sever.ru",
    phone: "+7 903 120-44-11",
    ownerId: "u2",
    tags: ["ecom", "поддержка"],
    updatedAt: "2026-09-11",
  },
  {
    id: "c2",
    name: "Артём К.",
    company: "Лофт Клиник",
    email: "artem@loft.clinic",
    phone: "+7 916 880-02-19",
    ownerId: "u1",
    tags: ["сайт", "новый"],
    updatedAt: "2026-09-12",
  },
  {
    id: "c3",
    name: "Ольга Н.",
    company: "Кафе «Дым»",
    email: "olga@dym.cafe",
    phone: "+7 926 441-77-30",
    ownerId: "u2",
    tags: ["бот"],
    updatedAt: "2026-09-10",
  },
  {
    id: "c4",
    name: "Сергей П.",
    company: "Индустрия Плюс",
    email: "sp@indplus.ru",
    phone: "+7 495 221-09-88",
    ownerId: "u3",
    tags: ["интеграции", "B2B"],
    updatedAt: "2026-09-09",
  },
  {
    id: "c5",
    name: "Наталья Р.",
    company: "Школа «Вектор»",
    email: "nr@vector.school",
    phone: "+7 981 333-55-01",
    ownerId: "u1",
    tags: ["education"],
    updatedAt: "2026-09-08",
  },
];

export const deals: Deal[] = [
  {
    id: "d1",
    title: "Редизайн витрины",
    clientId: "c1",
    stage: "proposal",
    amount: 420000,
    ownerId: "u2",
    dueDate: "2026-09-20",
  },
  {
    id: "d2",
    title: "Корпоративный сайт",
    clientId: "c2",
    stage: "negotiation",
    amount: 680000,
    ownerId: "u1",
    dueDate: "2026-09-18",
  },
  {
    id: "d3",
    title: "Telegram-бот заказов",
    clientId: "c3",
    stage: "qualify",
    amount: 180000,
    ownerId: "u2",
    dueDate: "2026-09-25",
  },
  {
    id: "d4",
    title: "CRM + 1С связка",
    clientId: "c4",
    stage: "lead",
    amount: 950000,
    ownerId: "u3",
    dueDate: "2026-10-01",
  },
  {
    id: "d5",
    title: "Лендинг набора",
    clientId: "c5",
    stage: "won",
    amount: 140000,
    ownerId: "u1",
    dueDate: "2026-09-05",
  },
  {
    id: "d6",
    title: "Поддержка магазина",
    clientId: "c1",
    stage: "lost",
    amount: 90000,
    ownerId: "u2",
    dueDate: "2026-08-28",
  },
];

export const tasks: TaskItem[] = [
  {
    id: "t1",
    title: "Собрать бриф по витрине",
    status: "doing",
    priority: "high",
    assigneeId: "u2",
    clientId: "c1",
    dueDate: "2026-09-12",
  },
  {
    id: "t2",
    title: "Прототип главной Лофт Клиник",
    status: "todo",
    priority: "high",
    assigneeId: "u3",
    clientId: "c2",
    dueDate: "2026-09-14",
  },
  {
    id: "t3",
    title: "Выставить счёт на предоплату",
    status: "todo",
    priority: "medium",
    assigneeId: "u1",
    clientId: "c2",
    dueDate: "2026-09-13",
  },
  {
    id: "t4",
    title: "Починить вебхук оплаты",
    status: "blocked",
    priority: "high",
    assigneeId: "u3",
    clientId: "c3",
    dueDate: "2026-09-12",
  },
  {
    id: "t5",
    title: "Обновить доступы к staging",
    status: "done",
    priority: "low",
    assigneeId: "u4",
    dueDate: "2026-09-10",
  },
  {
    id: "t6",
    title: "Согласовать ТЗ интеграций",
    status: "doing",
    priority: "medium",
    assigneeId: "u3",
    clientId: "c4",
    dueDate: "2026-09-16",
  },
];

export const activity: ActivityItem[] = [
  {
    id: "a1",
    text: "Илья перевёл «Редизайн витрины» в предложение",
    time: "12 мин назад",
    type: "deal",
  },
  {
    id: "a2",
    text: "Мария взяла в работу прототип Лофт Клиник",
    time: "38 мин назад",
    type: "task",
  },
  {
    id: "a3",
    text: "Добавлен клиент «Кафе Дым»",
    time: "2 ч назад",
    type: "client",
  },
  {
    id: "a4",
    text: "Павел выдал доступ к staging для Марии",
    time: "вчера",
    type: "system",
  },
];

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function memberById(id: string) {
  return team.find((m) => m.id === id);
}

export function clientById(id: string) {
  return clients.find((c) => c.id === id);
}
