import { PageHeader, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { team } from "@/lib/mock-data";
import { ROLE_LABELS } from "@/lib/types";

const integrations = [
  { name: "Telegram", status: "Подключено", detail: "Алерты и быстрые тикеты" },
  { name: "Почта", status: "Черновик", detail: "Входящие заявки с ящика" },
  { name: "ЮKassa", status: "Скоро", detail: "Статусы оплат по счетам" },
  { name: "Webhooks", status: "Доступно", detail: "Исходящие события API" },
];

export default function AdminPage() {
  return (
    <div>
      <PageHeader
        title="Админка"
        description="Люди, роли, интеграции и журнал — как отдельный продукт, а не подвал."
        actions={
          <Button className="rounded-full bg-[var(--pult-accent)] px-5 text-white shadow-[0_14px_34px_-18px_rgba(11,107,86,0.85)] hover:bg-[var(--pult-accent)]/90">
            Пригласить человека
          </Button>
        }
      />

      <Tabs defaultValue="people">
        <TabsList className="mb-4 rounded-full bg-white/70 p-1 shadow-[var(--pult-shadow)]">
          <TabsTrigger value="people" className="rounded-full">Команда</TabsTrigger>
          <TabsTrigger value="access" className="rounded-full">Права</TabsTrigger>
          <TabsTrigger value="integrations" className="rounded-full">Интеграции</TabsTrigger>
          <TabsTrigger value="audit" className="rounded-full">Журнал</TabsTrigger>
        </TabsList>

        <TabsContent value="people">
          <Surface className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Сотрудник</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="text-right">Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="flex size-8 items-center justify-center rounded-full bg-[var(--pult-accent-soft)] text-xs font-semibold text-[var(--pult-accent)]">
                          {member.initials}
                        </span>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{ROLE_LABELS[member.role]}</TableCell>
                    <TableCell className="hidden text-muted-foreground md:table-cell">
                      {member.email}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        className={
                          member.active
                            ? "bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]"
                            : "bg-secondary text-muted-foreground"
                        }
                      >
                        {member.active ? "Активен" : "Отключён"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Surface>
        </TabsContent>

        <TabsContent value="access">
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                role: "Владелец",
                rights: ["Биллинг", "Удаление пространства", "Все модули", "Аудит"],
              },
              {
                role: "Админ",
                rights: ["Пользователи", "Интеграции", "API-ключи", "Все данные"],
              },
              {
                role: "Менеджер",
                rights: ["Клиенты", "Воронка", "Задачи команды", "Счета"],
              },
              {
                role: "Сотрудник",
                rights: ["Свои задачи", "Назначенные клиенты", "Комментарии"],
              },
            ].map((block) => (
              <Surface key={block.role} className="p-5">
                <h3 className="font-[family-name:var(--font-display)] text-lg">{block.role}</h3>
                <Separator className="my-3" />
                <ul className="space-y-2">
                  {block.rights.map((right) => (
                    <li key={right} className="text-sm text-muted-foreground">
                      · {right}
                    </li>
                  ))}
                </ul>
              </Surface>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <div className="grid gap-3 md:grid-cols-2">
            {integrations.map((item) => (
              <Surface key={item.name} className="flex items-start justify-between gap-4 p-5">
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <Badge variant="secondary">{item.status}</Badge>
              </Surface>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit">
          <Surface className="divide-y divide-[var(--pult-line)]">
            {[
              "Павел выдал Марии доступ к staging",
              "Анна изменила роль Ильи на менеджера",
              "Создан webhook endpoint /api/hooks/deals",
              "Отключён пользователь «Дима архивный»",
            ].map((row) => (
              <div key={row} className="flex items-center justify-between gap-4 px-5 py-4">
                <p className="text-sm">{row}</p>
                <span className="shrink-0 text-xs text-muted-foreground">сегодня</span>
              </div>
            ))}
          </Surface>
        </TabsContent>
      </Tabs>
    </div>
  );
}
