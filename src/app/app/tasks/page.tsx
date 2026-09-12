import { PageHeader, Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { clientById, memberById, tasks } from "@/lib/mock-data";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/types";

function priorityClass(priority: string) {
  if (priority === "high") return "bg-[var(--pult-warm)] text-white";
  if (priority === "medium") return "bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]";
  return "bg-secondary text-muted-foreground";
}

export default function TasksPage() {
  return (
    <div>
      <PageHeader
        title="Задачи"
        description="Исполнитель видит только работу, а не весь CRM-комбайн."
        actions={
          <Button className="bg-[var(--pult-ink)] text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90">
            Новая задача
          </Button>
        }
      />

      <Surface className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Задача</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="hidden md:table-cell">Приоритет</TableHead>
              <TableHead className="hidden lg:table-cell">Клиент</TableHead>
              <TableHead>Исполнитель</TableHead>
              <TableHead className="text-right">Срок</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const assignee = memberById(task.assigneeId);
              const client = task.clientId ? clientById(task.clientId) : null;
              return (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{STATUS_LABELS[task.status]}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge className={priorityClass(task.priority)}>
                      {PRIORITY_LABELS[task.priority]}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {client?.company ?? "—"}
                  </TableCell>
                  <TableCell>{assignee?.name}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {task.dueDate}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Surface>
    </div>
  );
}
