export type Role = "owner" | "manager" | "member" | "admin";

export type DealStage =
  | "lead"
  | "qualify"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type TaskStatus = "todo" | "doing" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
  active: boolean;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  ownerId: string;
  tags: string[];
  updatedAt: string;
}

export interface Deal {
  id: string;
  title: string;
  clientId: string;
  stage: DealStage;
  amount: number;
  ownerId: string;
  dueDate: string;
}

export interface TaskDocument {
  id: string;
  name: string;
  sizeLabel: string;
}

export interface TaskItem {
  id: string;
  title: string;
  body?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  clientId?: string;
  dueDate: string;
  documents?: TaskDocument[];
  /** Optional link to a deal card on the board (docs/LOGIC.md §5.5) */
  linkedDealCardId?: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  time: string;
  type: "deal" | "task" | "client" | "system";
}

export const STAGE_LABELS: Record<DealStage, string> = {
  lead: "Лид",
  qualify: "Квалификация",
  proposal: "Предложение",
  negotiation: "Переговоры",
  won: "Успех",
  lost: "Отказ",
};

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Владелец",
  admin: "Админ",
  manager: "Менеджер",
  member: "Сотрудник",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "К работе",
  doing: "В работе",
  done: "Готово",
  blocked: "Блок",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};
