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

export type CloseOutcome = "won" | "lost" | "cancelled" | "duplicate" | "other";

export const CLOSE_OUTCOME_LABELS: Record<CloseOutcome, string> = {
  won: "Успех",
  lost: "Отказ клиента",
  cancelled: "Отмена",
  duplicate: "Дубль",
  other: "Прочее",
};

export const CLOSE_REASON_PRESETS = [
  "Дорого / бюджет",
  "Выбрали конкурента",
  "Передумал / заморозка объекта",
  "Не прошли по срокам",
  "Дубль заявки",
  "Сорвался поставщик",
  "Иное",
] as const;

export interface CardHistoryEntry {
  id: string;
  at: string;
  userName: string;
  kind: "action" | "manual" | "create" | "archive" | "restore";
  fromBlockId?: string;
  toBlockId: string;
  actionId?: string;
  actionLabel?: string;
  note?: string;
  /** Snapshot for monthly stats — survives restore (docs/LOGIC.md §17.7) */
  closeOutcome?: CloseOutcome;
  closeReason?: string;
  amountSnapshot?: number;
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
  /** Archive passport — see docs/LOGIC.md §17 */
  archivedAt?: string;
  archivedBy?: string;
  closeOutcome?: CloseOutcome;
  closeReason?: string;
  archivedFromDirectionId?: DirectionId;
  archivedFromBlockId?: string;
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
        fromBlockId: "sales_unprocessed",
        actionId: "to_chat_create",
        actionLabel: "Чат создать",
        targetBlockId: "sales_chat_create",
      },
      {
        id: "s2",
        fromBlockId: "sales_chat_create",
        actionId: "to_chat_created",
        actionLabel: "Чат создан",
        targetBlockId: "sales_chat_created",
      },
      {
        id: "s3",
        fromBlockId: "sales_chat_created",
        actionId: "to_offer",
        actionLabel: "Отправили предложение",
        targetBlockId: "sales_offer_sent",
      },
      {
        id: "s4",
        fromBlockId: "sales_offer_sent",
        actionId: "to_thinking",
        actionLabel: "Думает на связи",
        targetBlockId: "sales_thinking",
      },
      {
        id: "s5",
        fromBlockId: "sales_thinking",
        actionId: "to_measure",
        actionLabel: "На замер",
        targetBlockId: "sales_to_measure",
      },
      {
        id: "s6",
        fromBlockId: "sales_to_measure",
        actionId: "to_measurer",
        actionLabel: "Замерщик Кондря",
        targetBlockId: "sales_measurer_kondrya",
      },
      {
        id: "s7",
        fromBlockId: "sales_measurer_kondrya",
        actionId: "measure_done",
        actionLabel: "Замер сделали",
        targetBlockId: "sales_measured",
      },
      {
        id: "s8",
        fromBlockId: "sales_measured",
        actionId: "handoff_fulfillment",
        actionLabel: "Передать в поставку",
        targetBlockId: "ful_not_sent",
      },
      {
        id: "s9",
        fromBlockId: "sales_offer_sent",
        actionId: "offer_day1",
        actionLabel: "Прошло 1 день",
        targetBlockId: "sales_offer_day1",
      },
      {
        id: "s10",
        fromBlockId: "sales_offer_day1",
        actionId: "offer_day2",
        actionLabel: "Прошло 2 дня",
        targetBlockId: "sales_offer_day2",
      },
      {
        id: "s11",
        fromBlockId: "sales_to_measure",
        actionId: "measure_refuse",
        actionLabel: "Отказались от замера",
        targetBlockId: "sales_measure_refused",
      },
      {
        id: "s12",
        fromBlockId: "sales_to_measure",
        actionId: "measure_postpone",
        actionLabel: "Отложить замер",
        targetBlockId: "sales_measure_postponed",
      },
      {
        id: "s13",
        fromBlockId: "sales_chat_created",
        actionId: "to_opener",
        actionLabel: "Открывашка в чат",
        targetBlockId: "sales_opener_chat",
      },
      {
        id: "s14",
        fromBlockId: "sales_thinking",
        actionId: "to_mejka_promo",
        actionLabel: "Межка по акции",
        targetBlockId: "sales_mejka_promo",
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
      {
        id: "f12",
        fromBlockId: "ful_in_work",
        actionId: "to_partial",
        actionLabel: "Частично сформирован",
        targetBlockId: "ful_partial",
      },
      {
        id: "f13",
        fromBlockId: "ful_partial",
        actionId: "to_full",
        actionLabel: "Полностью сформирован",
        targetBlockId: "ful_full",
      },
      {
        id: "f14",
        fromBlockId: "ful_full",
        actionId: "to_delivery",
        actionLabel: "На доставку (Кондря)",
        targetBlockId: "ful_delivery_kondrya",
      },
      {
        id: "f15",
        fromBlockId: "ful_full",
        actionId: "to_pickup",
        actionLabel: "На самовывоз (Кондря)",
        targetBlockId: "ful_pickup_kondrya",
      },
      {
        id: "f16",
        fromBlockId: "ful_delivery_kondrya",
        actionId: "to_mejka_install",
        actionLabel: "На монтаж (межка)",
        targetBlockId: "ful_mejka_install",
      },
      {
        id: "f17",
        fromBlockId: "ful_pickup_kondrya",
        actionId: "to_mejka_install_pickup",
        actionLabel: "На монтаж (межка)",
        targetBlockId: "ful_mejka_install",
      },
      {
        id: "f18",
        fromBlockId: "ful_mejka_install",
        actionId: "to_quality",
        actionLabel: "Опрос по качеству",
        targetBlockId: "ful_quality_survey",
      },
      {
        id: "f19",
        fromBlockId: "ful_quality_survey",
        actionId: "to_review_orion",
        actionLabel: "Собрать отзыв Орион",
        targetBlockId: "ful_review_orion",
      },
      {
        id: "f20",
        fromBlockId: "ful_deadline_over",
        actionId: "back_in_work_deadline",
        actionLabel: "Вернуть в работу",
        targetBlockId: "ful_in_work",
      },
      {
        id: "f21",
        fromBlockId: "ful_mejka_install",
        actionId: "postpone_install",
        actionLabel: "Отложить монтаж",
        targetBlockId: "ful_postponed_install",
      },
      {
        id: "f22",
        fromBlockId: "ful_postponed_install",
        actionId: "resume_mejka",
        actionLabel: "Вернуть на монтаж",
        targetBlockId: "ful_mejka_install",
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
        fromBlockId: "war_unprocessed",
        actionId: "to_interior",
        actionLabel: "В межкомнатку",
        targetBlockId: "war_interior",
      },
      {
        id: "w2",
        fromBlockId: "war_unprocessed",
        actionId: "to_metal_portalle",
        actionLabel: "В Метал Portalle",
        targetBlockId: "war_metal_portalle",
      },
      {
        id: "w3",
        fromBlockId: "war_unprocessed",
        actionId: "to_metal",
        actionLabel: "В Метал",
        targetBlockId: "war_metal",
      },
      {
        id: "w4",
        fromBlockId: "war_unprocessed",
        actionId: "to_favorites",
        actionLabel: "В любимые покупатели",
        targetBlockId: "war_favorites",
      },
      {
        id: "w5",
        fromBlockId: "war_interior",
        actionId: "interior_to_favorites",
        actionLabel: "В любимые покупатели",
        targetBlockId: "war_favorites",
      },
      {
        id: "w6",
        fromBlockId: "war_metal",
        actionId: "metal_to_favorites",
        actionLabel: "В любимые покупатели",
        targetBlockId: "war_favorites",
      },
      {
        id: "w7",
        fromBlockId: "war_metal_portalle",
        actionId: "portalle_to_favorites",
        actionLabel: "В любимые покупатели",
        targetBlockId: "war_favorites",
      },
    ],
  },
];

export const INITIAL_BLOCKS: BoardBlock[] = [
  // sales
  // sales — эталон Bitrix «Продажа»
  {
    id: "sales_unprocessed",
    directionId: "sales",
    title: "Не обработанная карточка",
    color: "#c45c4a",
    order: 0,
  },
  {
    id: "sales_chat_create",
    directionId: "sales",
    title: "Чат создать",
    color: "#c4a035",
    order: 1,
  },
  {
    id: "sales_chat_created",
    directionId: "sales",
    title: "Чат создан",
    color: "#0b6b56",
    order: 2,
  },
  {
    id: "sales_offer_sent",
    directionId: "sales",
    title: "Отправили предложение",
    color: "#2f9e4a",
    order: 3,
  },
  {
    id: "sales_offer_day1",
    directionId: "sales",
    title: "Прошло 1 день с предложения",
    color: "#d45a2a",
    order: 4,
  },
  {
    id: "sales_offer_day2",
    directionId: "sales",
    title: "Прошло 2 дня с предложения",
    color: "#c45c4a",
    order: 5,
  },
  {
    id: "sales_thinking",
    directionId: "sales",
    title: "Думает на связи",
    color: "#5eb3d4",
    order: 6,
  },
  {
    id: "sales_renovation",
    directionId: "sales",
    title: "Делает ремонт на связи",
    color: "#2aa3a0",
    order: 7,
  },
  {
    id: "sales_postponed_buy",
    directionId: "sales",
    title: "Отложил покупку на связи",
    color: "#2f9e4a",
    order: 8,
  },
  {
    id: "sales_no_contact",
    directionId: "sales",
    title: "Не выходит на связь",
    color: "#c45c4a",
    order: 9,
  },
  {
    id: "sales_manager_inactive",
    directionId: "sales",
    title: "Менеджер не активен",
    color: "#c4a035",
    order: 10,
  },
  {
    id: "sales_to_measure",
    directionId: "sales",
    title: "На замер",
    color: "#2f6fed",
    order: 11,
  },
  {
    id: "sales_measurer_kondrya",
    directionId: "sales",
    title: "Замерщик Кондря",
    color: "#2aa3a0",
    order: 12,
    assigneeHint: "Кондря",
  },
  {
    id: "sales_measured",
    directionId: "sales",
    title: "Замер сделали",
    color: "#7cb342",
    order: 13,
  },
  {
    id: "sales_measure_refused",
    directionId: "sales",
    title: "Отказались от замера",
    color: "#9b3a2c",
    order: 14,
  },
  {
    id: "sales_measure_postponed",
    directionId: "sales",
    title: "Отложенный замер",
    color: "#d45a2a",
    order: 15,
  },
  {
    id: "sales_mejka_promo",
    directionId: "sales",
    title: "Межка по акции",
    color: "#c4a035",
    order: 16,
  },
  {
    id: "sales_opener_chat",
    directionId: "sales",
    title: "Открывашка в чат",
    color: "#0b6b56",
    order: 17,
  },
  // fulfillment — эталон Bitrix «Поставка / Доставка / Монтаж»
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
    title: "Требует дор-ки менеджера",
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
  {
    id: "ful_deadline_over",
    directionId: "fulfillment",
    title: "Вышел срок поставки",
    color: "#c45c4a",
    order: 8,
  },
  {
    id: "ful_partial",
    directionId: "fulfillment",
    title: "Частично сформирован",
    color: "#c4a035",
    order: 9,
  },
  {
    id: "ful_full",
    directionId: "fulfillment",
    title: "Полностью сформирован",
    color: "#0b6b56",
    order: 10,
  },
  {
    id: "ful_rek_warehouse",
    directionId: "fulfillment",
    title: "Рекламация на складе",
    color: "#c4a035",
    order: 11,
  },
  {
    id: "ful_paid_storage",
    directionId: "fulfillment",
    title: "Платное хранение",
    color: "#c45c4a",
    order: 12,
  },
  {
    id: "ful_dopnik_storage",
    directionId: "fulfillment",
    title: "По допнику хранение",
    color: "#0b6b56",
    order: 13,
  },
  {
    id: "ful_to_permyakova",
    directionId: "fulfillment",
    title: "Переместить на Пермякова",
    color: "#2aa3a0",
    order: 14,
    assigneeHint: "Пермякова",
  },
  {
    id: "ful_delivery_kondrya",
    directionId: "fulfillment",
    title: "Доставка / Кондря Павел",
    color: "#0b6b56",
    order: 15,
    assigneeHint: "Кондря Павел",
  },
  {
    id: "ful_pickup_kondrya",
    directionId: "fulfillment",
    title: "Самовывоз / Кондря Павел",
    color: "#c4a035",
    order: 16,
    assigneeHint: "Кондря Павел",
  },
  {
    id: "ful_mejka_install",
    directionId: "fulfillment",
    title: "Межка монтаж",
    color: "#2f9e4a",
    order: 17,
  },
  {
    id: "ful_mejka_warranty",
    directionId: "fulfillment",
    title: "Межка гарантия",
    color: "#c45c4a",
    order: 18,
  },
  {
    id: "ful_metal_install",
    directionId: "fulfillment",
    title: "Метал монтаж",
    color: "#2f9e4a",
    order: 19,
  },
  {
    id: "ful_metal_warranty",
    directionId: "fulfillment",
    title: "Метал гарантия",
    color: "#d45a2a",
    order: 20,
  },
  {
    id: "ful_komarov",
    directionId: "fulfillment",
    title: "Комаров Александр межка",
    color: "#2aa3a0",
    order: 21,
    assigneeHint: "Комаров Александр",
  },
  {
    id: "ful_bashikov",
    directionId: "fulfillment",
    title: "Башиков Руслан межка",
    color: "#2f6fed",
    order: 22,
    assigneeHint: "Башиков Руслан",
  },
  {
    id: "ful_nikitin",
    directionId: "fulfillment",
    title: "Никитин Сергей межка",
    color: "#0b6b56",
    order: 23,
    assigneeHint: "Никитин Сергей",
  },
  {
    id: "ful_polukeev",
    directionId: "fulfillment",
    title: "Полукеев Генадий межка",
    color: "#2aa3a0",
    order: 24,
    assigneeHint: "Полукеев Генадий",
  },
  {
    id: "ful_tratsevsky",
    directionId: "fulfillment",
    title: "Трацевский Евгений",
    color: "#c45c4a",
    order: 25,
    assigneeHint: "Трацевский Евгений",
  },
  {
    id: "ful_suslarik",
    directionId: "fulfillment",
    title: "Сусларик Александр межка",
    color: "#d45a2a",
    order: 26,
    assigneeHint: "Сусларик Александр",
  },
  {
    id: "ful_iskaryan",
    directionId: "fulfillment",
    title: "Искарян Евгений межка",
    color: "#c4a035",
    order: 27,
    assigneeHint: "Искарян Евгений",
  },
  {
    id: "ful_talgat",
    directionId: "fulfillment",
    title: "Талгат Танжанов входные",
    color: "#c45c4a",
    order: 28,
    assigneeHint: "Талгат Танжанов",
  },
  {
    id: "ful_quality_survey",
    directionId: "fulfillment",
    title: "Опрос по качеству",
    color: "#2f6fed",
    order: 29,
  },
  {
    id: "ful_review_orion",
    directionId: "fulfillment",
    title: "Отзыв Орион",
    color: "#2aa3a0",
    order: 30,
  },
  {
    id: "ful_review_permyakova",
    directionId: "fulfillment",
    title: "Отзыв Пермякова",
    color: "#0b6b56",
    order: 31,
    assigneeHint: "Пермякова",
  },
  {
    id: "ful_postponed_install",
    directionId: "fulfillment",
    title: "Отложенные монтажи",
    color: "#d45a2a",
    order: 32,
  },
  // warranty — эталон Bitrix «Пост гарантийный сервис»
  {
    id: "war_unprocessed",
    directionId: "warranty",
    title: "Не обработанная карточка",
    color: "#c45c4a",
    order: 0,
  },
  {
    id: "war_interior",
    directionId: "warranty",
    title: "Межкомнатка",
    color: "#2f6fed",
    order: 1,
  },
  {
    id: "war_metal_portalle",
    directionId: "warranty",
    title: "Метал Portalle",
    color: "#2aa3a0",
    order: 2,
  },
  {
    id: "war_metal",
    directionId: "warranty",
    title: "Метал",
    color: "#7cb342",
    order: 3,
  },
  {
    id: "war_favorites",
    directionId: "warranty",
    title: "Любимые покупатели",
    color: "#d45a2a",
    order: 4,
  },
];

export const INITIAL_CARDS: DealCard[] = [];

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

export function isArchived(card: DealCard) {
  return Boolean(card.archivedAt);
}

export function activeCards(cards: DealCard[]) {
  return cards.filter((c) => !isArchived(c));
}

export function archivedCards(cards: DealCard[]) {
  return cards
    .filter(isArchived)
    .slice()
    .sort((a, b) => (b.archivedAt ?? "").localeCompare(a.archivedAt ?? ""));
}

/** YYYY-MM from archivedAt */
export function archiveMonthKey(archivedAt: string) {
  return archivedAt.slice(0, 7);
}

export function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  const date = new Date(y, (m || 1) - 1, 1);
  return date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
}

export type ArchiveMonthStats = {
  month: string;
  wonCount: number;
  lostCount: number;
  cancelledCount: number;
  otherCount: number;
  wonAmount: number;
  lostAmount: number;
  earlyCloseCount: number;
};

/** Monthly stats from archive history events (not current card state). */
export function statsForMonth(cards: DealCard[], month: string): ArchiveMonthStats {
  let wonCount = 0;
  let lostCount = 0;
  let cancelledCount = 0;
  let otherCount = 0;
  let wonAmount = 0;
  let lostAmount = 0;
  let earlyCloseCount = 0;

  for (const card of cards) {
    for (const h of card.history) {
      if (h.kind !== "archive") continue;
      if (archiveMonthKey(h.at) !== month) continue;
      const outcome = h.closeOutcome ?? card.closeOutcome ?? "other";
      const amount = h.amountSnapshot ?? card.amount;
      if (outcome === "won") {
        wonCount += 1;
        wonAmount += amount;
      } else if (outcome === "lost") {
        lostCount += 1;
        lostAmount += amount;
        earlyCloseCount += 1;
      } else if (outcome === "cancelled") {
        cancelledCount += 1;
        lostAmount += amount;
        earlyCloseCount += 1;
      } else {
        otherCount += 1;
        if (outcome !== "duplicate") earlyCloseCount += 1;
      }
    }
  }

  return {
    month,
    wonCount,
    lostCount,
    cancelledCount,
    otherCount,
    wonAmount,
    lostAmount,
    earlyCloseCount,
  };
}

export function availableArchiveMonths(cards: DealCard[]) {
  const set = new Set<string>();
  for (const card of cards) {
    for (const h of card.history) {
      if (h.kind === "archive") set.add(archiveMonthKey(h.at));
    }
    if (card.archivedAt) set.add(archiveMonthKey(card.archivedAt));
  }
  return [...set].sort().reverse();
}

export function winRate(stats: ArchiveMonthStats) {
  const denom = stats.wonCount + stats.lostCount + stats.cancelledCount;
  if (!denom) return null;
  return Math.round((stats.wonCount / denom) * 100);
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
