/** Board domain — see docs/LOGIC.md */

export type DirectionId = "sales" | "fulfillment" | "warranty";

export type FieldModuleId =
  | "body"
  | "documents"
  | "responsible"
  | "contacts"
  | "measurements"
  | "door"
  | "deadlines"
  | "maxChat"
  | "amount"
  | "workType"
  | "quantity"
  | "manufacturer";

export type CardFlag =
  | "overdue"
  | "viewed"
  | "deadline_changed"
  | "fields_filled"
  | "urgent"
  | "needs_fill";

export interface FieldModuleConfig {
  id: FieldModuleId;
  label: string;
  enabled: boolean;
  requiredOnCreate: boolean;
  requiredOnExit: boolean;
  order: number;
}

export interface TransitionRule {
  id: string;
  fromBlockId: string;
  actionId: string;
  actionLabel: string;
  targetBlockId: string;
}

export interface BoardBlock {
  id: string;
  directionId: DirectionId;
  title: string;
  color: string;
  order: number;
  isTerminal?: boolean;
  strictFlow?: boolean;
  assigneeHint?: string;
  wipLimit?: number;
}

export interface Direction {
  id: DirectionId;
  label: string;
  short: string;
  order: number;
  template: FieldModuleConfig[];
  transitions: TransitionRule[];
}

export interface CardDocument {
  id: string;
  name: string;
  sizeLabel: string;
}

export interface CardContact {
  name: string;
  phone?: string;
  messenger?: string;
}

export interface CardHistoryEntry {
  id: string;
  at: string;
  userName: string;
  kind: "action" | "manual" | "create";
  fromBlockId?: string;
  toBlockId: string;
  actionId?: string;
  actionLabel?: string;
  note?: string;
}

export interface DealCard {
  id: string;
  number: string;
  directionId: DirectionId;
  blockId: string;
  amount: number;
  client: string;
  owner: string;
  ownerInitials: string;
  workType: string;
  quantity: number;
  manufacturer: string;
  body: string;
  deadline: string;
  installDeadline?: string;
  maxChatUrl?: string;
  doorRef?: string;
  measurementRef?: string;
  contacts: CardContact[];
  documents: CardDocument[];
  responsible: string[];
  flags: CardFlag[];
  history: CardHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export const FIELD_MODULE_CATALOG: {
  id: FieldModuleId;
  label: string;
  description: string;
}[] = [
  { id: "body", label: "Текст / суть", description: "Описание и комментарий" },
  { id: "documents", label: "Документы", description: "КП, фото, акты, схемы" },
  { id: "responsible", label: "Ответственные", description: "Кто ведёт карточку" },
  { id: "contacts", label: "Контакты", description: "Клиент, прораб, дизайн" },
  { id: "measurements", label: "Замеры", description: "Ссылка на замер" },
  { id: "door", label: "Ссылка на дверь", description: "Модель / SKU с витрины" },
  { id: "deadlines", label: "Сроки", description: "Поставка и монтаж" },
  { id: "maxChat", label: "Чат в Max", description: "Deep-link переписки" },
  { id: "amount", label: "Сумма", description: "Сумма заказа" },
  { id: "workType", label: "Вид работ", description: "Монтаж, поставка…" },
  { id: "quantity", label: "Количество", description: "Проёмы / позиции" },
  { id: "manufacturer", label: "Производитель", description: "Фабрика / коллекция" },
];

export const FLAG_LABELS: Record<CardFlag, string> = {
  overdue: "Просрочена",
  viewed: "Просмотрена",
  deadline_changed: "Изменён крайний срок",
  fields_filled: "Поля заполнены",
  urgent: "Срочно",
  needs_fill: "Требует заполнения",
};

function defaultTemplate(): FieldModuleConfig[] {
  return FIELD_MODULE_CATALOG.map((mod, index) => ({
    id: mod.id,
    label: mod.label,
    enabled: true,
    requiredOnCreate: ["body", "contacts", "amount"].includes(mod.id),
    requiredOnExit: ["deadlines", "door"].includes(mod.id),
    order: index,
  }));
}

export const DIRECTIONS: Direction[] = [
  {
    id: "sales",
    label: "Продажа",
    short: "Продажа",
    order: 0,
    template: defaultTemplate(),
    transitions: [
      {
        id: "s1",
        fromBlockId: "sales_new",
        actionId: "to_measure",
        actionLabel: "Назначить замер",
        targetBlockId: "sales_measure",
      },
      {
        id: "s2",
        fromBlockId: "sales_measure",
        actionId: "to_quote",
        actionLabel: "Сформировать КП",
        targetBlockId: "sales_quote",
      },
      {
        id: "s3",
        fromBlockId: "sales_quote",
        actionId: "to_talk",
        actionLabel: "В переговоры",
        targetBlockId: "sales_talk",
      },
      {
        id: "s4",
        fromBlockId: "sales_talk",
        actionId: "to_deposit",
        actionLabel: "Получена предоплата",
        targetBlockId: "sales_deposit",
      },
      {
        id: "s5",
        fromBlockId: "sales_deposit",
        actionId: "to_production",
        actionLabel: "В производство / поставку",
        targetBlockId: "sales_won",
      },
      {
        id: "s6",
        fromBlockId: "sales_won",
        actionId: "handoff_fulfillment",
        actionLabel: "Передать в поставку",
        targetBlockId: "ful_not_sent",
      },
    ],
  },
  {
    id: "fulfillment",
    label: "Поставка / Доставка / Монтаж",
    short: "Поставка",
    order: 1,
    template: defaultTemplate(),
    transitions: [
      {
        id: "f1",
        fromBlockId: "ful_not_sent",
        actionId: "to_ksenia",
        actionLabel: "Взять в обработку (Ксения)",
        targetBlockId: "ful_ksenia",
      },
      {
        id: "f2",
        fromBlockId: "ful_ksenia",
        actionId: "to_supplier",
        actionLabel: "Отправить поставщику",
        targetBlockId: "ful_supplier",
      },
      {
        id: "f3",
        fromBlockId: "ful_ksenia",
        actionId: "to_manager_fix",
        actionLabel: "Нужна доработка менеджера",
        targetBlockId: "ful_manager_fix",
      },
      {
        id: "f4",
        fromBlockId: "ful_supplier",
        actionId: "to_in_work",
        actionLabel: "Поставщик подтвердил / в работу",
        targetBlockId: "ful_in_work",
      },
      {
        id: "f5",
        fromBlockId: "ful_supplier",
        actionId: "to_rek_supplier",
        actionLabel: "Открыть рекламацию",
        targetBlockId: "ful_rek_supplier",
      },
      {
        id: "f6",
        fromBlockId: "ful_rek_supplier",
        actionId: "to_rek_katya",
        actionLabel: "Передать Кате",
        targetBlockId: "ful_rek_katya",
      },
      {
        id: "f7",
        fromBlockId: "ful_rek_katya",
        actionId: "back_rek_supplier",
        actionLabel: "Вернуть поставщику",
        targetBlockId: "ful_rek_supplier",
      },
      {
        id: "f8",
        fromBlockId: "ful_rek_katya",
        actionId: "to_rek_work",
        actionLabel: "В работу по рекламации",
        targetBlockId: "ful_rek_work",
      },
      {
        id: "f9",
        fromBlockId: "ful_manager_fix",
        actionId: "back_ksenia",
        actionLabel: "Исправлено → к Ксении",
        targetBlockId: "ful_ksenia",
      },
      {
        id: "f10",
        fromBlockId: "ful_in_work",
        actionId: "open_rek_work",
        actionLabel: "Открыть рекламацию",
        targetBlockId: "ful_rek_work",
      },
      {
        id: "f11",
        fromBlockId: "ful_rek_work",
        actionId: "close_rek",
        actionLabel: "Закрыть рекламацию",
        targetBlockId: "ful_in_work",
      },
    ],
  },
  {
    id: "warranty",
    label: "Пост гарантийный сервис",
    short: "Сервис",
    order: 2,
    template: defaultTemplate(),
    transitions: [
      {
        id: "w1",
        fromBlockId: "war_intake",
        actionId: "to_diag",
        actionLabel: "На диагностику",
        targetBlockId: "war_diag",
      },
      {
        id: "w2",
        fromBlockId: "war_diag",
        actionId: "to_agree",
        actionLabel: "На согласование",
        targetBlockId: "war_agree",
      },
      {
        id: "w3",
        fromBlockId: "war_agree",
        actionId: "to_service",
        actionLabel: "В работу",
        targetBlockId: "war_service",
      },
      {
        id: "w4",
        fromBlockId: "war_service",
        actionId: "to_parts",
        actionLabel: "Ждём запчасть",
        targetBlockId: "war_parts",
      },
      {
        id: "w5",
        fromBlockId: "war_parts",
        actionId: "back_service",
        actionLabel: "Запчасть получена",
        targetBlockId: "war_service",
      },
      {
        id: "w6",
        fromBlockId: "war_service",
        actionId: "to_closed",
        actionLabel: "Закрыть обращение",
        targetBlockId: "war_closed",
      },
    ],
  },
];

export const INITIAL_BLOCKS: BoardBlock[] = [
  // sales
  { id: "sales_new", directionId: "sales", title: "Новая заявка", color: "#7a8f84", order: 0 },
  { id: "sales_measure", directionId: "sales", title: "Замер", color: "#2f6fed", order: 1 },
  { id: "sales_quote", directionId: "sales", title: "КП", color: "#9a7b4f", order: 2 },
  { id: "sales_talk", directionId: "sales", title: "Переговоры", color: "#b86a3d", order: 3 },
  { id: "sales_deposit", directionId: "sales", title: "Предоплата", color: "#0b6b56", order: 4 },
  { id: "sales_won", directionId: "sales", title: "В производство", color: "#1f7a4d", order: 5 },
  // fulfillment
  {
    id: "ful_not_sent",
    directionId: "fulfillment",
    title: "Не отправленные в работу",
    color: "#c45c4a",
    order: 0,
  },
  {
    id: "ful_ksenia",
    directionId: "fulfillment",
    title: "В обработке у Ксении",
    color: "#c4a035",
    order: 1,
    assigneeHint: "Ксения",
  },
  {
    id: "ful_supplier",
    directionId: "fulfillment",
    title: "Заявка у поставщика",
    color: "#d4a017",
    order: 2,
  },
  {
    id: "ful_rek_katya",
    directionId: "fulfillment",
    title: "Рек в обработке у Кати",
    color: "#2aa3a0",
    order: 3,
    assigneeHint: "Катя",
  },
  {
    id: "ful_rek_supplier",
    directionId: "fulfillment",
    title: "Рекламация у поставщика",
    color: "#c45c4a",
    order: 4,
  },
  {
    id: "ful_manager_fix",
    directionId: "fulfillment",
    title: "Требует доработки менеджера",
    color: "#b8a04a",
    order: 5,
  },
  {
    id: "ful_in_work",
    directionId: "fulfillment",
    title: "Заказ в работе",
    color: "#0b6b56",
    order: 6,
  },
  {
    id: "ful_rek_work",
    directionId: "fulfillment",
    title: "Рекламация в работе",
    color: "#3d8b5a",
    order: 7,
  },
  // warranty
  { id: "war_intake", directionId: "warranty", title: "Новое обращение", color: "#7a8f84", order: 0 },
  { id: "war_diag", directionId: "warranty", title: "Диагностика", color: "#2f6fed", order: 1 },
  { id: "war_agree", directionId: "warranty", title: "Согласование", color: "#9a7b4f", order: 2 },
  { id: "war_service", directionId: "warranty", title: "В работе", color: "#0b6b56", order: 3 },
  { id: "war_parts", directionId: "warranty", title: "Ожидает запчасть", color: "#b86a3d", order: 4 },
  {
    id: "war_closed",
    directionId: "warranty",
    title: "Закрыто",
    color: "#1f7a4d",
    order: 5,
    isTerminal: true,
  },
];

function hist(
  to: string,
  kind: CardHistoryEntry["kind"] = "create",
  from?: string,
): CardHistoryEntry {
  return {
    id: `h_${Math.random().toString(36).slice(2, 8)}`,
    at: "2026-09-10T10:00:00",
    userName: "Анна Крылова",
    kind,
    fromBlockId: from,
    toBlockId: to,
    note: kind === "create" ? "Карточка создана" : undefined,
  };
}

export const INITIAL_CARDS: DealCard[] = [
  {
    id: "kd1",
    number: "546-2026",
    directionId: "fulfillment",
    blockId: "ful_not_sent",
    amount: 565430,
    client: "Семья Ковалёвых",
    owner: "Илья Морозов",
    ownerInitials: "ИМ",
    workType: "Установка дверей",
    quantity: 7,
    manufacturer: "Atelier",
    body: "Пишем общее количество дверей и комплектацию по проёмам.",
    deadline: "2026-06-30",
    installDeadline: "2026-09-14",
    maxChatUrl: "https://max.ru/chat/kovalevy",
    doorRef: "ATL-42-OAK",
    measurementRef: "ms_2",
    contacts: [{ name: "Ковалёв А.", phone: "+7 903 111-22-33", messenger: "Max" }],
    documents: [{ id: "doc1", name: "spec-546.pdf", sizeLabel: "420 КБ" }],
    responsible: ["Илья Морозов"],
    flags: ["overdue"],
    history: [hist("ful_not_sent")],
    createdAt: "2026-08-20",
    updatedAt: "2026-09-12",
    createdBy: "Анна Крылова",
  },
  {
    id: "kd2",
    number: "512-2026",
    directionId: "fulfillment",
    blockId: "ful_not_sent",
    amount: 132000,
    client: "Артём Белов",
    owner: "Анна Крылова",
    ownerInitials: "АК",
    workType: "Доставка + монтаж",
    quantity: 2,
    manufacturer: "Noir",
    body: "Эмаль Graphite, скрытый короб.",
    deadline: "2026-09-18",
    doorRef: "NOI-90-GR",
    contacts: [{ name: "Артём Белов", phone: "+7 916 880-02-19" }],
    documents: [],
    responsible: ["Анна Крылова"],
    flags: ["viewed"],
    history: [hist("ful_not_sent")],
    createdAt: "2026-09-01",
    updatedAt: "2026-09-11",
    createdBy: "Анна Крылова",
  },
  {
    id: "kd3",
    number: "498-2026",
    directionId: "fulfillment",
    blockId: "ful_supplier",
    amount: 812000,
    client: "ООО «Север Девелопмент»",
    owner: "Мария Соколова",
    ownerInitials: "МС",
    workType: "Поставка Invisible",
    quantity: 18,
    manufacturer: "Invisible Pro",
    body: "Офис на Павелецкой, высота 2400.",
    deadline: "2026-10-12",
    doorRef: "INV-40-AL",
    measurementRef: "ms_3",
    maxChatUrl: "https://max.ru/chat/sever-dev",
    contacts: [{ name: "Закупщик Север", phone: "+7 495 100-20-30" }],
    documents: [{ id: "doc2", name: "kp-invisible.pdf", sizeLabel: "1.1 МБ" }],
    responsible: ["Мария Соколова", "Ксения"],
    flags: ["fields_filled"],
    history: [hist("ful_supplier", "action", "ful_ksenia")],
    createdAt: "2026-08-15",
    updatedAt: "2026-09-10",
    createdBy: "Мария Соколова",
  },
  {
    id: "kd4",
    number: "501-2026",
    directionId: "fulfillment",
    blockId: "ful_supplier",
    amount: 521070,
    client: "Студия «Форма»",
    owner: "Илья Морозов",
    ownerInitials: "ИМ",
    workType: "Поставка Atelier",
    quantity: 6,
    manufacturer: "Atelier",
    body: "Шоурум клиента, ночной доступ.",
    deadline: "2026-10-05",
    doorRef: "ATL-28-WS",
    contacts: [{ name: "Куратор Форма", messenger: "Max" }],
    documents: [],
    responsible: ["Илья Морозов"],
    flags: ["deadline_changed"],
    history: [hist("ful_supplier", "action", "ful_ksenia")],
    createdAt: "2026-08-22",
    updatedAt: "2026-09-09",
    createdBy: "Илья Морозов",
  },
  {
    id: "kd5",
    number: "477-2026",
    directionId: "fulfillment",
    blockId: "ful_rek_supplier",
    amount: 198400,
    client: "Елена Орлова",
    owner: "Анна Крылова",
    ownerInitials: "АК",
    workType: "Рекламация фурнитуры",
    quantity: 1,
    manufacturer: "Crystal",
    body: "Магнитный замок — люфт после монтажа.",
    deadline: "2026-09-20",
    doorRef: "CRY-FL-CL",
    contacts: [{ name: "Елена Орлова", phone: "+7 903 555-01-01" }],
    documents: [{ id: "doc3", name: "photo-lock.jpg", sizeLabel: "2.4 МБ" }],
    responsible: ["Анна Крылова"],
    flags: ["urgent", "overdue"],
    history: [hist("ful_rek_supplier", "action", "ful_supplier")],
    createdAt: "2026-09-01",
    updatedAt: "2026-09-12",
    createdBy: "Анна Крылова",
  },
  {
    id: "kd6",
    number: "460-2026",
    directionId: "fulfillment",
    blockId: "ful_manager_fix",
    amount: 106560,
    client: "Игорь Савельев",
    owner: "Павел Орлов",
    ownerInitials: "ПО",
    workType: "Уточнение комплектации",
    quantity: 4,
    manufacturer: "Natura",
    body: "Нужны доборы под кирпич 380 мм.",
    deadline: "2026-09-22",
    doorRef: "NAT-WL-01",
    contacts: [{ name: "Игорь Савельев" }],
    documents: [],
    responsible: ["Павел Орлов"],
    flags: ["viewed"],
    history: [hist("ful_manager_fix", "action", "ful_ksenia")],
    createdAt: "2026-09-02",
    updatedAt: "2026-09-11",
    createdBy: "Ксения",
  },
  {
    id: "kd7",
    number: "440-2026",
    directionId: "fulfillment",
    blockId: "ful_in_work",
    amount: 2480000,
    client: "ЖК «Резиденции Парк»",
    owner: "Илья Морозов",
    ownerInitials: "ИМ",
    workType: "Монтаж партии",
    quantity: 24,
    manufacturer: "Atelier",
    body: "Корпус 3, слот бригады «Север».",
    deadline: "2026-09-28",
    installDeadline: "2026-09-14",
    doorRef: "ATL-42-OAK",
    measurementRef: "ms_2",
    contacts: [{ name: "Прораб ЖК", phone: "+7 495 777-00-11" }],
    documents: [],
    responsible: ["Илья Морозов", "Бригада «Север»"],
    flags: ["fields_filled"],
    history: [hist("ful_in_work", "action", "ful_supplier")],
    createdAt: "2026-08-10",
    updatedAt: "2026-09-12",
    createdBy: "Анна Крылова",
  },
  {
    id: "kd8",
    number: "441-2026",
    directionId: "fulfillment",
    blockId: "ful_in_work",
    amount: 3150958,
    client: "Таунхаус, Рублёвка",
    owner: "Анна Крылова",
    ownerInitials: "АК",
    workType: "Монтаж Noir",
    quantity: 9,
    manufacturer: "Noir",
    body: "Защитная плёнка до чистовой.",
    deadline: "2026-09-28",
    doorRef: "NOI-90-GR",
    contacts: [{ name: "Артём Белов" }],
    documents: [],
    responsible: ["Анна Крылова", "Бригада «Премиум»"],
    flags: ["viewed"],
    history: [hist("ful_in_work", "action", "ful_supplier")],
    createdAt: "2026-08-12",
    updatedAt: "2026-09-11",
    createdBy: "Анна Крылова",
  },
  {
    id: "kd9",
    number: "420-2026",
    directionId: "fulfillment",
    blockId: "ful_rek_work",
    amount: 486404,
    client: "Семья Ковалёвых",
    owner: "Сервис",
    ownerInitials: "СР",
    workType: "Гарантийный выезд",
    quantity: 1,
    manufacturer: "Atelier",
    body: "Подтяжка доводчика на кухне.",
    deadline: "2026-10-05",
    doorRef: "ATL-42-OAK",
    contacts: [{ name: "Ковалёв А." }],
    documents: [],
    responsible: ["Сервис"],
    flags: ["deadline_changed"],
    history: [hist("ful_rek_work", "action", "ful_in_work")],
    createdAt: "2026-09-05",
    updatedAt: "2026-09-12",
    createdBy: "Илья Морозов",
  },
  {
    id: "kd10",
    number: "419-2026",
    directionId: "fulfillment",
    blockId: "ful_rek_work",
    amount: 500000,
    client: "ООО «Север Девелопмент»",
    owner: "Сервис",
    ownerInitials: "СР",
    workType: "Перезамер + довоз",
    quantity: 3,
    manufacturer: "Invisible Pro",
    body: "После сдвига перегородок архитектором.",
    deadline: "2026-10-15",
    doorRef: "INV-40-AL",
    measurementRef: "ms_3",
    contacts: [{ name: "Архитектор Север" }],
    documents: [],
    responsible: ["Сервис", "Мария Соколова"],
    flags: ["urgent"],
    history: [hist("ful_rek_work", "manual", "ful_in_work")],
    createdAt: "2026-09-06",
    updatedAt: "2026-09-12",
    createdBy: "Мария Соколова",
  },
  // sales samples
  {
    id: "ks1",
    number: "610-2026",
    directionId: "sales",
    blockId: "sales_new",
    amount: 0,
    client: "Дизайн-бюро «Линия»",
    owner: "Анна Крылова",
    ownerInitials: "АК",
    workType: "Консультация в салоне",
    quantity: 5,
    manufacturer: "—",
    body: "Интерес к Invisible и Crystal.",
    deadline: "2026-09-16",
    contacts: [{ name: "Дизайнер Линия", messenger: "Max" }],
    documents: [],
    responsible: ["Анна Крылова"],
    flags: ["viewed"],
    history: [hist("sales_new")],
    createdAt: "2026-09-12",
    updatedAt: "2026-09-12",
    createdBy: "Анна Крылова",
  },
  {
    id: "ks3",
    number: "590-2026",
    directionId: "sales",
    blockId: "sales_quote",
    amount: 1540000,
    client: "ООО «Север Девелопмент»",
    owner: "Мария Соколова",
    ownerInitials: "МС",
    workType: "КП офис",
    quantity: 18,
    manufacturer: "Invisible Pro",
    body: "PDF КП после подтверждения высоты.",
    deadline: "2026-09-20",
    doorRef: "INV-40-AL",
    contacts: [{ name: "Закупщик Север" }],
    documents: [{ id: "doc4", name: "draft-kp.pdf", sizeLabel: "800 КБ" }],
    responsible: ["Мария Соколова"],
    flags: ["deadline_changed"],
    history: [hist("sales_quote", "action", "sales_measure")],
    createdAt: "2026-09-05",
    updatedAt: "2026-09-11",
    createdBy: "Мария Соколова",
  },
  {
    id: "ks5",
    number: "570-2026",
    directionId: "sales",
    blockId: "sales_deposit",
    amount: 392000,
    client: "Игорь Савельев",
    owner: "Анна Крылова",
    ownerInitials: "АК",
    workType: "Предоплата 30%",
    quantity: 4,
    manufacturer: "Natura",
    body: "Ждём поступление на расчётный.",
    deadline: "2026-09-25",
    doorRef: "NAT-WL-01",
    contacts: [{ name: "Игорь Савельев" }],
    documents: [],
    responsible: ["Анна Крылова"],
    flags: ["fields_filled"],
    history: [hist("sales_deposit", "action", "sales_talk")],
    createdAt: "2026-09-01",
    updatedAt: "2026-09-10",
    createdBy: "Анна Крылова",
  },
  // warranty
  {
    id: "kw1",
    number: "S-102",
    directionId: "warranty",
    blockId: "war_intake",
    amount: 0,
    client: "Семья Ковалёвых",
    owner: "Сервис",
    ownerInitials: "СР",
    workType: "Гарантия · доводчик",
    quantity: 1,
    manufacturer: "Atelier",
    body: "Заявка через WhatsApp / Max.",
    deadline: "2026-10-05",
    maxChatUrl: "https://max.ru/chat/kovalevy",
    doorRef: "ATL-42-OAK",
    contacts: [{ name: "Ковалёв А." }],
    documents: [],
    responsible: ["Сервис"],
    flags: ["viewed"],
    history: [hist("war_intake")],
    createdAt: "2026-09-12",
    updatedAt: "2026-09-12",
    createdBy: "Анна Крылова",
  },
  {
    id: "kw4",
    number: "S-084",
    directionId: "warranty",
    blockId: "war_service",
    amount: 0,
    client: "Студия «Форма»",
    owner: "Бригада «Центр»",
    ownerInitials: "БЦ",
    workType: "Регулировка петель",
    quantity: 2,
    manufacturer: "Atelier",
    body: "Выезд согласован на 11:00.",
    deadline: "2026-09-17",
    doorRef: "ATL-28-WS",
    contacts: [{ name: "Куратор Форма" }],
    documents: [],
    responsible: ["Бригада «Центр»"],
    flags: ["urgent"],
    history: [hist("war_service", "action", "war_agree")],
    createdAt: "2026-09-08",
    updatedAt: "2026-09-12",
    createdBy: "Павел Орлов",
  },
];

export function formatBoardMoney(value: number): string {
  if (!value) return "—";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function blocksForDirection(blocks: BoardBlock[], directionId: DirectionId) {
  return blocks
    .filter((b) => b.directionId === directionId)
    .sort((a, b) => a.order - b.order);
}

export function missingRequiredFields(
  card: DealCard,
  template: FieldModuleConfig[],
  mode: "create" | "exit",
): string[] {
  const missing: string[] = [];
  for (const field of template) {
    if (!field.enabled) continue;
    const required = mode === "create" ? field.requiredOnCreate : field.requiredOnExit;
    if (!required) continue;
    const ok = (() => {
      switch (field.id) {
        case "body":
          return Boolean(card.body?.trim());
        case "documents":
          return card.documents.length > 0;
        case "responsible":
          return card.responsible.length > 0;
        case "contacts":
          return card.contacts.length > 0 && Boolean(card.contacts[0]?.name?.trim());
        case "measurements":
          return Boolean(card.measurementRef?.trim());
        case "door":
          return Boolean(card.doorRef?.trim());
        case "deadlines":
          return Boolean(card.deadline?.trim());
        case "maxChat":
          return Boolean(card.maxChatUrl?.trim());
        case "amount":
          return card.amount > 0;
        case "workType":
          return Boolean(card.workType?.trim());
        case "quantity":
          return card.quantity > 0;
        case "manufacturer":
          return Boolean(card.manufacturer?.trim()) && card.manufacturer !== "—";
        default:
          return true;
      }
    })();
    if (!ok) missing.push(field.label);
  }
  return missing;
}

export type BoardState = {
  directions: Direction[];
  blocks: BoardBlock[];
  cards: DealCard[];
};

export function createInitialBoardState(): BoardState {
  return {
    directions: structuredClone(DIRECTIONS),
    blocks: structuredClone(INITIAL_BLOCKS),
    cards: structuredClone(INITIAL_CARDS),
  };
}
