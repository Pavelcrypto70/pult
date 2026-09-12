export type DoorCollection =
  | "atelier"
  | "noir"
  | "natura"
  | "crystal"
  | "invisible";

export type DoorFinish =
  | "шпон дуб"
  | "эмаль"
  | "плёнка ПВХ"
  | "стекло"
  | "скрытый алюминий";

export type OrderStatus =
  | "lead"
  | "measure"
  | "quote"
  | "deposit"
  | "production"
  | "delivery"
  | "install"
  | "warranty"
  | "done"
  | "lost";

export interface DoorModel {
  id: string;
  name: string;
  collection: DoorCollection;
  finish: DoorFinish;
  sku: string;
  priceFrom: number;
  leadDays: number;
  inShowroom: boolean;
  stock: number;
  tags: string[];
  note: string;
}

export interface DoorOrder {
  id: string;
  client: string;
  object: string;
  modelId: string;
  status: OrderStatus;
  amount: number;
  deposit: number;
  measureDate?: string;
  installDate?: string;
  manager: string;
  city: string;
}

export interface DoorMeasurement {
  id: string;
  client: string;
  address: string;
  date: string;
  engineer: string;
  openings: number;
  width: string;
  height: string;
  wall: string;
  status: "scheduled" | "done" | "rework";
  notes: string;
}

export const COLLECTION_LABELS: Record<DoorCollection, string> = {
  atelier: "Atelier",
  noir: "Noir",
  natura: "Natura",
  crystal: "Crystal",
  invisible: "Invisible",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  lead: "Заявка",
  measure: "Замер",
  quote: "КП",
  deposit: "Предоплата",
  production: "Производство",
  delivery: "Доставка",
  install: "Монтаж",
  warranty: "Гарантия",
  done: "Закрыт",
  lost: "Отказ",
};

export const ORDER_STATUS_ORDER: OrderStatus[] = [
  "lead",
  "measure",
  "quote",
  "deposit",
  "production",
  "delivery",
  "install",
  "warranty",
  "done",
];

export const doorCatalog: DoorModel[] = [
  {
    id: "door_1",
    name: "Atelier 42 Oak Soft",
    collection: "atelier",
    finish: "шпон дуб",
    sku: "ATL-42-OAK",
    priceFrom: 78400,
    leadDays: 21,
    inShowroom: true,
    stock: 4,
    tags: ["премиум", "межкомнатная", "глухая"],
    note: "Мягкий дуб, скрытые петли, магнитный замок.",
  },
  {
    id: "door_2",
    name: "Noir Graphite 90",
    collection: "noir",
    finish: "эмаль",
    sku: "NOI-90-GR",
    priceFrom: 91200,
    leadDays: 28,
    inShowroom: true,
    stock: 2,
    tags: ["премиум", "эмаль", "матовая"],
    note: "Глубокий графит, алюминиевая кромка, тихая доводка.",
  },
  {
    id: "door_3",
    name: "Natura Walnut Line",
    collection: "natura",
    finish: "шпон дуб",
    sku: "NAT-WL-01",
    priceFrom: 65800,
    leadDays: 18,
    inShowroom: true,
    stock: 7,
    tags: ["орех", "вертикаль", "дизайнерская"],
    note: "Вертикальный шпон, тёплый орех, под заказ по высоте.",
  },
  {
    id: "door_4",
    name: "Crystal Flute Clear",
    collection: "crystal",
    finish: "стекло",
    sku: "CRY-FL-CL",
    priceFrom: 102500,
    leadDays: 35,
    inShowroom: true,
    stock: 1,
    tags: ["стекло", "рифлёное", "свет"],
    note: "Рифлёное стекло, чёрный анодированный профиль.",
  },
  {
    id: "door_5",
    name: "Invisible Pro 40",
    collection: "invisible",
    finish: "скрытый алюминий",
    sku: "INV-40-AL",
    priceFrom: 118900,
    leadDays: 30,
    inShowroom: false,
    stock: 0,
    tags: ["скрытый короб", "под покраску", "архитектурная"],
    note: "Скрытый монтаж в одну плоскость со стеной.",
  },
  {
    id: "door_6",
    name: "Atelier 28 White Silk",
    collection: "atelier",
    finish: "эмаль",
    sku: "ATL-28-WS",
    priceFrom: 72400,
    leadDays: 21,
    inShowroom: true,
    stock: 5,
    tags: ["белый", "шёлк", "классика"],
    note: "Шелковистая эмаль, капитель опционально.",
  },
];

export const doorOrders: DoorOrder[] = [
  {
    id: "ord_1",
    client: "Семья Ковалёвых",
    object: "ЖК «Резиденции Парк»",
    modelId: "door_1",
    status: "install",
    amount: 486000,
    deposit: 243000,
    measureDate: "2026-08-28",
    installDate: "2026-09-14",
    manager: "Илья Морозов",
    city: "Москва",
  },
  {
    id: "ord_2",
    client: "Артём Белов",
    object: "Таунхаус, Рублёвка",
    modelId: "door_2",
    status: "production",
    amount: 812000,
    deposit: 400000,
    measureDate: "2026-09-02",
    installDate: "2026-09-28",
    manager: "Анна Крылова",
    city: "Москва",
  },
  {
    id: "ord_3",
    client: "ООО «Север Девелопмент»",
    object: "Офис на Павелецкой",
    modelId: "door_5",
    status: "quote",
    amount: 1540000,
    deposit: 0,
    measureDate: "2026-09-10",
    manager: "Мария Соколова",
    city: "Москва",
  },
  {
    id: "ord_4",
    client: "Елена Орлова",
    object: "Квартира, Хамовники",
    modelId: "door_4",
    status: "measure",
    amount: 0,
    deposit: 0,
    measureDate: "2026-09-13",
    manager: "Илья Морозов",
    city: "Москва",
  },
  {
    id: "ord_5",
    client: "Игорь Савельев",
    object: "Дом, Истра",
    modelId: "door_3",
    status: "deposit",
    amount: 392000,
    deposit: 120000,
    measureDate: "2026-09-05",
    installDate: "2026-09-25",
    manager: "Анна Крылова",
    city: "МО",
  },
  {
    id: "ord_6",
    client: "Студия «Форма»",
    object: "Шоурум клиента",
    modelId: "door_6",
    status: "delivery",
    amount: 268000,
    deposit: 268000,
    measureDate: "2026-08-20",
    installDate: "2026-09-12",
    manager: "Павел Орлов",
    city: "Москва",
  },
];

export const doorMeasurements: DoorMeasurement[] = [
  {
    id: "ms_1",
    client: "Елена Орлова",
    address: "Хамовники, ул. Усачёва 12",
    date: "2026-09-13 · 11:00",
    engineer: "Сергей Н.",
    openings: 5,
    width: "800–900",
    height: "2100–2300",
    wall: "280–320 мм",
    status: "scheduled",
    notes: "Нужны скрытые короба, тёплый пол у порога.",
  },
  {
    id: "ms_2",
    client: "Семья Ковалёвых",
    address: "ЖК «Резиденции Парк», корпус 3",
    date: "2026-08-28 · 16:30",
    engineer: "Сергей Н.",
    openings: 7,
    width: "700–900",
    height: "2200",
    wall: "100–250 мм",
    status: "done",
    notes: "Все проёмы готовы, чистовая после монтажа.",
  },
  {
    id: "ms_3",
    client: "ООО «Север Девелопмент»",
    address: "Павелецкая наб., 2",
    date: "2026-09-10 · 10:00",
    engineer: "Андрей К.",
    openings: 18,
    width: "900–1200",
    height: "2400",
    wall: "150 мм гипсокартон",
    status: "rework",
    notes: "Перезамер после сдвига перегородок архитектором.",
  },
  {
    id: "ms_4",
    client: "Игорь Савельев",
    address: "Истра, КП «Лесной»",
    date: "2026-09-05 · 13:00",
    engineer: "Андрей К.",
    openings: 4,
    width: "800–1000",
    height: "2300",
    wall: "кирпич 380 мм",
    status: "done",
    notes: "Входная группа отдельно, межкомнатные Atelier/Natura.",
  },
];

export function doorById(id: string) {
  return doorCatalog.find((d) => d.id === id);
}

export function formatDoorMoney(value: number): string {
  if (!value) return "—";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(value);
}

export type InstallStatus = "planned" | "in_progress" | "done" | "warranty";

export interface DoorInstallJob {
  id: string;
  orderId: string;
  client: string;
  address: string;
  date: string;
  crew: string;
  openings: number;
  hours: number;
  status: InstallStatus;
  notes: string;
}

export const INSTALL_STATUS_LABELS: Record<InstallStatus, string> = {
  planned: "Слот",
  in_progress: "В работе",
  done: "Сдан",
  warranty: "Гарантия",
};

export const doorInstallJobs: DoorInstallJob[] = [
  {
    id: "inst_1",
    orderId: "ord_1",
    client: "Семья Ковалёвых",
    address: "ЖК «Резиденции Парк», корп. 3",
    date: "2026-09-14 · 10:00–18:00",
    crew: "Бригада «Север»",
    openings: 7,
    hours: 8,
    status: "planned",
    notes: "Скрытые петли, магнитные замки, фотофиксация до/после.",
  },
  {
    id: "inst_2",
    orderId: "ord_6",
    client: "Студия «Форма»",
    address: "Шоурум клиента, Тверская",
    date: "2026-09-12 · 09:00–14:00",
    crew: "Бригада «Центр»",
    openings: 3,
    hours: 5,
    status: "in_progress",
    notes: "Ночной доступ согласован, лифт бронирован.",
  },
  {
    id: "inst_3",
    orderId: "ord_5",
    client: "Игорь Савельев",
    address: "Истра, КП «Лесной»",
    date: "2026-09-25 · 11:00–17:00",
    crew: "Бригада «Север»",
    openings: 4,
    hours: 6,
    status: "planned",
    notes: "Доборы под кирпич 380 мм, отдельный входной проём позже.",
  },
  {
    id: "inst_4",
    orderId: "ord_2",
    client: "Артём Белов",
    address: "Таунхаус, Рублёвка",
    date: "2026-09-28 · 10:00–19:00",
    crew: "Бригада «Премиум»",
    openings: 9,
    hours: 9,
    status: "planned",
    notes: "Эмаль Noir — защитная плёнка до сдачи чистовой.",
  },
  {
    id: "inst_5",
    orderId: "ord_1",
    client: "Семья Ковалёвых",
    address: "ЖК «Резиденции Парк», корп. 3",
    date: "2026-10-05 · гарантийный",
    crew: "Сервис",
    openings: 1,
    hours: 2,
    status: "warranty",
    notes: "Подтяжка доводчика на кухне через 3 недели после сдачи.",
  },
];

export type OpeningSide = "левое" | "правое" | "маятник" | "раздвижное";
export type GlassOption =
  | "нет"
  | "прозрачное"
  | "матовое"
  | "рифлёное"
  | "зеркальное";

export const HARDWARE_PACKS = [
  { id: "basic", label: "Базовый", price: 0 },
  { id: "quiet", label: "Тихий магнит", price: 8900 },
  { id: "atelier", label: "Atelier Brass", price: 18400 },
  { id: "invisible", label: "Скрытый комплект", price: 24600 },
] as const;

export function estimateDoorConfig(input: {
  basePrice: number;
  width: number;
  height: number;
  glass: GlassOption;
  hardwareId: (typeof HARDWARE_PACKS)[number]["id"];
  extensions: boolean;
  casing: boolean;
}): {
  total: number;
  lines: { label: string; amount: number }[];
} {
  const lines: { label: string; amount: number }[] = [
    { label: "Базовая модель", amount: input.basePrice },
  ];

  const sizeFactor =
    Math.max(0, input.width - 800) * 18 + Math.max(0, input.height - 2000) * 22;
  if (sizeFactor > 0) {
    lines.push({ label: "Нестандартный размер", amount: sizeFactor });
  }

  const glassMap: Record<GlassOption, number> = {
    нет: 0,
    прозрачное: 12600,
    матовое: 14800,
    рифлёное: 18600,
    зеркальное: 21400,
  };
  if (glassMap[input.glass] > 0) {
    lines.push({ label: `Стекло · ${input.glass}`, amount: glassMap[input.glass] });
  }

  const pack = HARDWARE_PACKS.find((p) => p.id === input.hardwareId) ?? HARDWARE_PACKS[0];
  if (pack.price > 0) {
    lines.push({ label: `Фурнитура · ${pack.label}`, amount: pack.price });
  }

  if (input.extensions) {
    lines.push({ label: "Доборы под толщину стены", amount: 9800 });
  }
  if (input.casing) {
    lines.push({ label: "Наличники / капитель", amount: 7200 });
  }

  return {
    total: lines.reduce((sum, line) => sum + line.amount, 0),
    lines,
  };
}

export const DOOR_STORE_MODULE_IDS = [
  "crm_clients",
  "pipeline",
  "door_catalog",
  "door_configurator",
  "door_measurements",
  "door_orders",
  "door_install",
  "inventory",
  "invoices",
  "documents",
  "analytics",
  "automations",
] as const;

export const DOOR_STORE_PRESET = {
  name: "Atelier Doors",
  industry: "Магазин дверей",
  description:
    "Премиальный салон дверей: витрина, замер, конфигуратор, производство, монтаж и гарантия.",
  moduleIds: [...DOOR_STORE_MODULE_IDS],
  departments: ["Шоурум", "Замер", "Продажи", "Логистика", "Монтаж", "Сервис"],
  roles: [
    { name: "Владелец салона", permissions: ["manage", "billing", "modules"] },
    { name: "Дизайнер-консультант", permissions: ["catalog", "clients", "quotes"] },
    { name: "Замерщик", permissions: ["measurements", "photos"] },
    { name: "Монтажная бригада", permissions: ["install", "acts"] },
  ],
  pages: [
    {
      title: "Скрипт консультации",
      description: "Как вести клиента от входа в салон до предоплаты",
    },
    {
      title: "Стандарт монтажа",
      description: "Допуски, фотофиксация, акт сдачи",
    },
    {
      title: "Гарантийный регламент",
      description: "Сроки, исключения, выезд сервиса",
    },
  ],
};
