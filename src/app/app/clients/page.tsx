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
import { clients, memberById } from "@/lib/mock-data";

export default function ClientsPage() {
  return (
    <div>
      <PageHeader
        title="Клиенты"
        description="Карточки компаний и контактов без CRM-зоопарка."
        actions={
          <Button className="bg-[var(--pult-ink)] text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90">
            Добавить клиента
          </Button>
        }
      />

      <Surface className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Компания</TableHead>
              <TableHead>Контакт</TableHead>
              <TableHead className="hidden md:table-cell">Ответственный</TableHead>
              <TableHead className="hidden lg:table-cell">Теги</TableHead>
              <TableHead className="text-right">Обновлён</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => {
              const owner = memberById(client.ownerId);
              return (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="font-medium">{client.company}</div>
                    <div className="text-xs text-muted-foreground md:hidden">
                      {client.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="hidden md:block">{client.name}</div>
                    <div className="text-xs text-muted-foreground">{client.email}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{owner?.name}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {client.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {client.updatedAt}
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
