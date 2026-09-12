"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageHeader, Surface } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  CompanyBuilder,
  type CompanyDraft,
} from "@/components/companies/company-builder";
import { useWorkspace } from "@/hooks/use-workspace";
import { canUserCreateCompany } from "@/lib/company";

export default function NewCompanyPage() {
  const router = useRouter();
  const { state, currentUser, createCompany } = useWorkspace();
  const canCreate = canUserCreateCompany(
    currentUser.role,
    state.access,
    currentUser.id,
  );

  function handleSubmit(draft: CompanyDraft) {
    const company = createCompany({
      name: draft.name,
      industry: draft.industry,
      description: draft.description,
      modules: draft.modules,
      roles: draft.roles,
      departments: draft.departments,
      customPages: draft.customPages,
    });
    router.push(`/app/companies/${company.id}`);
  }

  if (!canCreate) {
    return (
      <div>
        <PageHeader
          title="Создание компании"
          description="Нужен доступ от администратора."
        />
        <Surface className="p-6">
          <p className="text-sm text-muted-foreground">
            У {currentUser.name} пока нет права создавать компании.
          </p>
          <Button
            className="mt-4 rounded-full"
            variant="outline"
            render={<Link href="/app/admin" />}
          >
            Запросить в админке
          </Button>
        </Surface>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Конструктор компании"
        description="Соберите только нужные модули, поля, стадии, роли и страницы."
        actions={
          <Button variant="outline" className="rounded-full" render={<Link href="/app/companies" />}>
            К списку
          </Button>
        }
      />
      <CompanyBuilder submitLabel="Создать компанию" onSubmit={handleSubmit} />
    </div>
  );
}
