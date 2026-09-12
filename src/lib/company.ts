import type { Role } from "./types";

export type FieldType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "phone"
  | "email"
  | "file"
  | "checkbox"
  | "textarea"
  | "money";

export type ModuleCategory =
  | "sales"
  | "work"
  | "finance"
  | "people"
  | "content"
  | "ops"
  | "custom";

export interface CustomField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[];
}

export interface PipelineStageConfig {
  id: string;
  name: string;
  color: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: "kpi" | "list" | "chart" | "calendar";
}

export interface CompanyRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface ModuleConfig {
  moduleId: string;
  enabled: boolean;
  customFields: CustomField[];
  stages: PipelineStageConfig[];
  widgets: DashboardWidget[];
  automations: AutomationRule[];
  settings: Record<string, string | boolean | number>;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  industry: string;
  description: string;
  ownerId: string;
  createdAt: string;
  modules: ModuleConfig[];
  roles: CompanyRole[];
  departments: string[];
  customPages: { id: string; title: string; description: string }[];
}

export interface CreateCompanyAccess {
  userId: string;
  grantedBy: string;
  grantedAt: string;
}

export interface ModuleDefinition {
  id: string;
  title: string;
  description: string;
  category: ModuleCategory;
  icon: string;
  defaultFields: Omit<CustomField, "id">[];
  defaultStages?: Omit<PipelineStageConfig, "id">[];
  defaultWidgets?: Omit<DashboardWidget, "id">[];
  settingKeys: { key: string; label: string; kind: "toggle" | "text" | "number" }[];
}

export const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  sales: "Продажи",
  work: "Работа",
  finance: "Финансы",
  people: "Люди",
  content: "Контент",
  ops: "Операции",
  custom: "Своё",
};

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Текст",
  number: "Число",
  date: "Дата",
  select: "Список",
  phone: "Телефон",
  email: "Email",
  file: "Файл",
  checkbox: "Чекбокс",
  textarea: "Длинный текст",
  money: "Деньги",
};

export const MODULE_CATALOG: ModuleDefinition[] = [
  {
    id: "crm_clients",
    title: "Клиенты",
    description: "Карточки компаний и контактов",
    category: "sales",
    icon: "users",
    defaultFields: [
      { name: "Компания", type: "text", required: true },
      { name: "Контакт", type: "text", required: true },
      { name: "Телефон", type: "phone", required: false },
      { name: "Email", type: "email", required: false },
    ],
    settingKeys: [
      { key: "requirePhone", label: "Телефон обязателен", kind: "toggle" },
      { key: "duplicateCheck", label: "Проверка дублей", kind: "toggle" },
    ],
  },
  {
    id: "pipeline",
    title: "Воронка продаж",
    description: "Сделки по стадиям с суммами",
    category: "sales",
    icon: "kanban",
    defaultFields: [
      { name: "Название сделки", type: "text", required: true },
      { name: "Сумма", type: "money", required: true },
      { name: "Дедлайн", type: "date", required: false },
    ],
    defaultStages: [
      { name: "Лид", color: "#7a8f84" },
      { name: "Квалификация", color: "#2f6fed" },
      { name: "Предложение", color: "#9a7b4f" },
      { name: "Переговоры", color: "#0b6b56" },
      { name: "Успех", color: "#0b6b56" },
    ],
    settingKeys: [
      { key: "showAmount", label: "Показывать суммы", kind: "toggle" },
      { key: "probability", label: "Вероятность закрытия", kind: "toggle" },
    ],
  },
  {
    id: "tasks",
    title: "Задачи",
    description: "Дедлайны, приоритеты, исполнители",
    category: "work",
    icon: "check",
    defaultFields: [
      { name: "Задача", type: "text", required: true },
      { name: "Срок", type: "date", required: true },
      { name: "Описание", type: "textarea", required: false },
    ],
    settingKeys: [
      { key: "subtasks", label: "Подзадачи", kind: "toggle" },
      { key: "timeTracking", label: "Учёт времени", kind: "toggle" },
    ],
  },
  {
    id: "invoices",
    title: "Счета и оплаты",
    description: "Выставление счетов и статусы оплат",
    category: "finance",
    icon: "receipt",
    defaultFields: [
      { name: "Номер счёта", type: "text", required: true },
      { name: "Сумма", type: "money", required: true },
      { name: "Срок оплаты", type: "date", required: true },
    ],
    settingKeys: [
      { key: "autoNumber", label: "Автонумерация", kind: "toggle" },
      { key: "vat", label: "НДС по умолчанию, %", kind: "number" },
    ],
  },
  {
    id: "support",
    title: "Поддержка / тикеты",
    description: "Входящие обращения клиентов",
    category: "work",
    icon: "life-buoy",
    defaultFields: [
      {
        name: "Тема",
        type: "text",
        required: true,
      },
      {
        name: "Приоритет",
        type: "select",
        required: true,
        options: ["Низкий", "Средний", "Высокий"],
      },
      {
        name: "Канал",
        type: "select",
        required: false,
        options: ["Telegram", "Почта", "Телефон"],
      },
    ],
    defaultStages: [
      { name: "Новый", color: "#2f6fed" },
      { name: "В работе", color: "#9a7b4f" },
      { name: "Ждём клиента", color: "#7a8f84" },
      { name: "Закрыт", color: "#0b6b56" },
    ],
    settingKeys: [
      { key: "slaHours", label: "SLA, часов", kind: "number" },
      { key: "publicPortal", label: "Клиентский портал", kind: "toggle" },
    ],
  },
  {
    id: "calendar",
    title: "Календарь",
    description: "Встречи, релизы, дедлайны",
    category: "work",
    icon: "calendar",
    defaultFields: [
      { name: "Событие", type: "text", required: true },
      { name: "Дата", type: "date", required: true },
      { name: "Место / ссылка", type: "text", required: false },
    ],
    settingKeys: [
      { key: "reminders", label: "Напоминания", kind: "toggle" },
      { key: "weekStartsOn", label: "Неделя с понедельника", kind: "toggle" },
    ],
  },
  {
    id: "documents",
    title: "Документы",
    description: "Файлы, версии, доступы",
    category: "content",
    icon: "file",
    defaultFields: [
      { name: "Название", type: "text", required: true },
      { name: "Файл", type: "file", required: true },
      { name: "Теги", type: "text", required: false },
    ],
    settingKeys: [
      { key: "versioning", label: "Версии файлов", kind: "toggle" },
      { key: "clientShare", label: "Шаринг клиенту", kind: "toggle" },
    ],
  },
  {
    id: "knowledge",
    title: "База знаний",
    description: "Регламенты, FAQ, онбординг",
    category: "content",
    icon: "book",
    defaultFields: [
      { name: "Заголовок", type: "text", required: true },
      {
        name: "Раздел",
        type: "select",
        required: false,
        options: ["Онбординг", "Продажи", "Доставка"],
      },
      { name: "Текст", type: "textarea", required: true },
    ],
    settingKeys: [
      { key: "publicRead", label: "Публичное чтение", kind: "toggle" },
      { key: "comments", label: "Комментарии", kind: "toggle" },
    ],
  },
  {
    id: "forms",
    title: "Формы заявок",
    description: "Лендинг-формы и опросники",
    category: "sales",
    icon: "form",
    defaultFields: [
      { name: "Имя", type: "text", required: true },
      { name: "Контакт", type: "text", required: true },
      { name: "Комментарий", type: "textarea", required: false },
    ],
    settingKeys: [
      { key: "notifyTelegram", label: "Уведомлять в Telegram", kind: "toggle" },
      { key: "createDeal", label: "Создавать сделку", kind: "toggle" },
    ],
  },
  {
    id: "analytics",
    title: "Аналитика",
    description: "KPI, отчёты, дашборды",
    category: "ops",
    icon: "chart",
    defaultFields: [],
    defaultWidgets: [
      { title: "Выручка месяца", type: "kpi" },
      { title: "Конверсия воронки", type: "chart" },
      { title: "Загрузка команды", type: "list" },
    ],
    settingKeys: [{ key: "weeklyDigest", label: "Недельный дайджест", kind: "toggle" }],
  },
  {
    id: "hr",
    title: "Команда / HR",
    description: "Сотрудники, роли, отпуска",
    category: "people",
    icon: "badge",
    defaultFields: [
      { name: "ФИО", type: "text", required: true },
      { name: "Должность", type: "text", required: true },
      { name: "Дата выхода", type: "date", required: false },
    ],
    settingKeys: [
      { key: "vacation", label: "Учёт отпусков", kind: "toggle" },
      { key: "orgChart", label: "Оргструктура", kind: "toggle" },
    ],
  },
  {
    id: "access_vault",
    title: "Доступы и секреты",
    description: "Логины, ключи, ротация",
    category: "ops",
    icon: "key",
    defaultFields: [
      { name: "Сервис", type: "text", required: true },
      { name: "Логин", type: "text", required: true },
      { name: "Ссылка", type: "text", required: false },
    ],
    settingKeys: [
      { key: "rotationDays", label: "Ротация, дней", kind: "number" },
      { key: "auditLog", label: "Журнал просмотров", kind: "toggle" },
    ],
  },
  {
    id: "inventory",
    title: "Склад / активы",
    description: "Оборудование, лицензии, остатки",
    category: "ops",
    icon: "box",
    defaultFields: [
      { name: "Название", type: "text", required: true },
      { name: "Количество", type: "number", required: true },
      { name: "Ответственный", type: "text", required: false },
    ],
    settingKeys: [{ key: "lowStock", label: "Порог низкого остатка", kind: "number" }],
  },
  {
    id: "chat",
    title: "Внутренний чат",
    description: "Каналы по проектам и клиентам",
    category: "people",
    icon: "message",
    defaultFields: [],
    settingKeys: [
      { key: "threads", label: "Ветки обсуждений", kind: "toggle" },
      { key: "clientRooms", label: "Комнаты с клиентом", kind: "toggle" },
    ],
  },
  {
    id: "automations",
    title: "Автоматизации",
    description: "Правила: если → то",
    category: "ops",
    icon: "zap",
    defaultFields: [],
    settingKeys: [{ key: "maxRules", label: "Лимит правил", kind: "number" }],
  },
  {
    id: "custom_module",
    title: "Свой модуль",
    description: "Пустой модуль под ваш процесс",
    category: "custom",
    icon: "puzzle",
    defaultFields: [{ name: "Название", type: "text", required: true }],
    settingKeys: [{ key: "title", label: "Название модуля", kind: "text" }],
  },
];

export function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-zа-я0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "company"
  );
}

export function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createModuleConfig(def: ModuleDefinition): ModuleConfig {
  const settings: Record<string, string | boolean | number> = {};
  for (const key of def.settingKeys) {
    settings[key.key] =
      key.kind === "toggle" ? true : key.kind === "number" ? 1 : def.title;
  }
  return {
    moduleId: def.id,
    enabled: true,
    customFields: def.defaultFields.map((field) => ({
      ...field,
      id: uid("field"),
    })),
    stages: (def.defaultStages ?? []).map((stage) => ({
      ...stage,
      id: uid("stage"),
    })),
    widgets: (def.defaultWidgets ?? []).map((widget) => ({
      ...widget,
      id: uid("widget"),
    })),
    automations: [],
    settings,
  };
}

export function canUserCreateCompany(
  role: Role,
  accessList: CreateCompanyAccess[],
  userId: string,
): boolean {
  if (role === "owner" || role === "admin") return true;
  return accessList.some((item) => item.userId === userId);
}

export const INDUSTRIES = [
  "Digital-студия",
  "Агентство",
  "Продуктовая команда",
  "Консалтинг",
  "E-commerce",
  "Образование",
  "Другое",
];

export const AUTOMATION_TRIGGERS = [
  "Новая сделка",
  "Сделка проиграна",
  "Задача просрочена",
  "Новый тикет",
  "Счёт оплачен",
];

export const AUTOMATION_ACTIONS = [
  "Создать задачу",
  "Написать в Telegram",
  "Сменить ответственного",
  "Добавить тег",
  "Отправить email",
];
