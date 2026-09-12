"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Kanban,
  CheckSquare,
  Settings2,
  Search,
  Command,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

const nav = [
  { href: "/app", label: "Обзор", icon: LayoutDashboard },
  { href: "/app/clients", label: "Клиенты", icon: Users },
  { href: "/app/pipeline", label: "Воронка", icon: Kanban },
  { href: "/app/tasks", label: "Задачи", icon: CheckSquare },
  { href: "/app/admin", label: "Админка", icon: Settings2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar variant="inset" className="border-none">
        <SidebarHeader className="gap-3 px-3 pt-3">
          <Link href="/" className="flex items-center gap-2.5 px-1 py-1">
            <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--pult-ink)] text-sm font-semibold text-[var(--pult-paper)]">
              P
            </span>
            <div className="leading-tight">
              <div className="font-[family-name:var(--font-display)] text-[15px] tracking-tight">
                Пульт
              </div>
              <div className="text-[11px] text-muted-foreground">Studio OS</div>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Рабочее пространство</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((item) => {
                  const active =
                    item.href === "/app"
                      ? pathname === "/app"
                      : pathname.startsWith(item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={active}
                        render={<Link href={item.href} />}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="px-3 pb-3">
          <div className="flex items-center gap-3 rounded-xl border border-[var(--pult-line)] bg-[var(--pult-elevated)] p-2.5">
            <Avatar className="size-8">
              <AvatarFallback className="bg-[var(--pult-accent-soft)] text-[var(--pult-accent)] text-xs">
                АК
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">Анна Крылова</div>
              <div className="truncate text-xs text-muted-foreground">Владелец</div>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-[var(--pult-canvas)]">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[var(--pult-line)] bg-[var(--pult-canvas)]/85 px-4 backdrop-blur-md sm:px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск клиентов, сделок, задач…"
              className="h-9 border-[var(--pult-line)] bg-[var(--pult-elevated)] pl-9"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden border-[var(--pult-line)] bg-[var(--pult-elevated)] sm:inline-flex"
            >
              <Command className="size-3.5" />
              ⌘K
            </Button>
            <Button size="sm" className="bg-[var(--pult-ink)] text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90">
              Создать
            </Button>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
