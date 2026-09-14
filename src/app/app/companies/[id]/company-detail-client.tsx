"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  CompanyBuilder,
  draftFromCompany,
  type CompanyDraft,
} from "@/components/companies/company-builder";
import { useWorkspace } from "@/hooks/use-workspace";
import { slugify } from "@/lib/company";

export function CompanyDetailClient() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { state, updateCompany } = useWorkspace();
  const company = state.companies.find((item) => item.id === params.id);

  function handleSubmit(draft: CompanyDraft) {
    if (!company) return;
    updateCompany({
      ...company,
      name: draft.name.trim(),
      slug: slugify(draft.name),
      industry: draft.industry,
      description: draft.description.trim(),
      modules: draft.modules,
      roles: draft.roles,
      departments: draft.departments,
      customPages: draft.customPages,
    });
    router.push("/app/companies");
  }

  if (!company) {
    return (
      <div>
        <PageHeader title="Компания не найдена" />
        <Button className="rounded-full" render={<Link href="/app/companies" />}>
          К списку
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={company.name}
        description="Дорабатывайте конструктор: модули, поля, автоматизации и страницы."
        actions={
          <Button variant="outline" className="rounded-full" render={<Link href="/app/companies" />}>
            К списку
          </Button>
        }
      />
      <CompanyBuilder
        key={company.id}
        initial={draftFromCompany(company)}
        submitLabel="Сохранить изменения"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
