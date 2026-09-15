"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Kanban,
  CheckSquare,
  Settings2,
  Building2,
  Search,
  Command,
  Sparkles,
  DoorOpen,
  Package,
  Ruler,
  SlidersHorizontal,
  Wrench,
  ChartColumnIncreasing,
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
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  hint?: string;
};

const opsNav: NavItem[] = [
  { href: "/app", label: "Обзор", icon: LayoutDashboard, exact: true },
  {
    href: "/app/pipeline",
    label: "Сделки",
    icon: Kanban,
    hint: "Канбан · 3 направления",
  },
  {
    href: "/app/reports",
    label: "Отчёт",
    icon: ChartColumnIncreasing,
    hint: "Общие данные",
  },
  { href: "/app/clients", label: "Клиенты", icon: Users },
  { href: "/app/tasks", label: "Задачи", icon: CheckSquare },
];

const doorNav: NavItem[] = [
  { href: "/app/doors", label: "Витрина", icon: DoorOpen, exact: true },
  { href: "/app/doors/orders", label: "Заказы", icon: Package },
  { href: "/app/doors/measurements", label: "Замеры", icon: Ruler },
  { href: "/app/doors/configurator", label: "Конфигуратор", icon: SlidersHorizontal },
  { href: "/app/doors/install", label: "Монтаж", icon: Wrench },
];

const systemNav: NavItem[] = [
  { href: "/app/companies", label: "Компании", icon: Building2 },
  { href: "/app/admin", label: "Админка", icon: Settings2 },
];

function isActive(pathname: string, item: NavItem) {
  if (item.exact || item.href === "/app") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavGroup({
  label,
  items,
  pathname,
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="tracking-[0.14em] text-[10px] uppercase">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = isActive(pathname, item);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={active}
                  className={cn(
                    "h-auto min-h-8 py-2",
                    active && "pult-nav-active font-medium",
                    item.hint && "items-start",
                  )}
                  render={<Link href={item.href} />}
                >
                  <item.icon className={cn(item.hint && "mt-0.5")} />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span>{item.label}</span>
                    {item.hint ? (
                      <span
                        className={cn(
                          "text-[10px] font-normal tracking-normal",
                          active ? "text-[var(--pult-accent)]/80" : "text-muted-foreground",
                        )}
                      >
                        {item.hint}
                      </span>
                    ) : null}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar
        variant="inset"
        className="border-none **:data-[slot=sidebar-inner]:bg-[rgba(247,248,246,0.86)] **:data-[slot=sidebar-inner]:backdrop-blur-xl **:data-[slot=sidebar-inner]:shadow-[var(--pult-shadow)]"
      >
        <SidebarHeader className="gap-3 px-3 pt-3">
          <Link href="/" className="flex items-center gap-3 rounded-2xl px-1.5 py-1.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--pult-ink)] text-sm font-semibold text-[var(--pult-paper)] shadow-[0_12px_28px_-14px_rgba(12,18,16,0.8)]">
              P
            </span>
            <div className="leading-tight">
              <div className="font-[family-name:var(--font-display)] text-[15px] tracking-tight">
                Пульт
              </div>
              <div className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                Studio OS
              </div>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <NavGroup label="Операции" items={opsNav} pathname={pathname} />
          <NavGroup label="Салон дверей" items={doorNav} pathname={pathname} />
          <NavGroup label="Система" items={systemNav} pathname={pathname} />
        </SidebarContent>
        <SidebarFooter className="px-3 pb-3">
          <div className="rounded-2xl border border-[var(--pult-line)] bg-white/70 p-3 shadow-[var(--pult-shadow)]">
            <div className="mb-3 flex items-center gap-2 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              <Sparkles className="size-3.5 text-[var(--pult-gold)]" />
              Première
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback className="bg-[var(--pult-accent-soft)] text-[var(--pult-accent)] text-xs font-semibold">
                  АК
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">Анна Крылова</div>
                <div className="truncate text-xs text-muted-foreground">Владелец · Север</div>
              </div>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-transparent">
        <header className="sticky top-0 z-20 mx-2 mt-2 flex h-14 items-center gap-3 rounded-2xl border border-[var(--pult-line)] bg-white/70 px-3 shadow-[var(--pult-shadow)] backdrop-blur-xl sm:mx-3 sm:px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск клиентов, сделок, задач…"
              className="h-9 border-transparent bg-[var(--pult-canvas)]/80 pl-9 focus-visible:border-[var(--pult-line-strong)]"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="hidden rounded-full border-[var(--pult-line)] bg-white/80 sm:inline-flex"
            >
              <Command className="size-3.5" />
              ⌘K
            </Button>
            <Button
              size="sm"
              className="rounded-full bg-[var(--pult-ink)] px-4 text-[var(--pult-paper)] hover:bg-[var(--pult-ink)]/90"
            >
              Создать
            </Button>
          </div>
        </header>
        <div className="flex-1 p-4 sm:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
