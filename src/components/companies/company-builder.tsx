"use client";

import { useMemo, useState } from "react";
import {
  FileStack,
  Layers3,
  Plus,
  Settings2,
  Trash2,
  UsersRound,
  Workflow,
} from "lucide-react";
import { Surface } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AUTOMATION_ACTIONS,
  AUTOMATION_TRIGGERS,
  CATEGORY_LABELS,
  FIELD_TYPE_LABELS,
  INDUSTRIES,
  MODULE_CATALOG,
  buildDoorStoreDraftModules,
  type Company,
  type CustomField,
  type FieldType,
  type ModuleConfig,
  type ModuleDefinition,
  createModuleConfig,
  uid,
} from "@/lib/company";
import { DOOR_STORE_PRESET } from "@/lib/doors";

export interface CompanyDraft {
  name: string;
  industry: string;
  description: string;
  moduleIds: string[];
  modules: ModuleConfig[];
  roles: Company["roles"];
  departments: string[];
  customPages: Company["customPages"];
}

const DEFAULT_MODULES = ["crm_clients", "pipeline", "tasks"];

export function emptyDraft(): CompanyDraft {
  const moduleIds = [...DEFAULT_MODULES];
  return {
    name: "",
    industry: INDUSTRIES[0],
    description: "",
    moduleIds,
    modules: moduleIds
      .map((id) => MODULE_CATALOG.find((m) => m.id === id)!)
      .map((def) => createModuleConfig(def)),
    roles: [
      {
        id: uid("role"),
        name: "Владелец",
        permissions: ["manage", "billing", "modules"],
      },
      {
        id: uid("role"),
        name: "Сотрудник",
        permissions: ["read", "tasks"],
      },
    ],
    departments: ["Продажи"],
    customPages: [],
  };
}

export function draftFromCompany(company: Company): CompanyDraft {
  return {
    name: company.name,
    industry: company.industry,
    description: company.description,
    moduleIds: company.modules.map((m) => m.moduleId),
    modules: company.modules,
    roles: company.roles,
    departments: company.departments,
    customPages: company.customPages,
  };
}

function syncModules(moduleIds: string[], current: ModuleConfig[]): ModuleConfig[] {
  return moduleIds.map((id) => {
    const existing = current.find((m) => m.moduleId === id);
    if (existing) return existing;
    return createModuleConfig(MODULE_CATALOG.find((m) => m.id === id)!);
  });
}

export function CompanyBuilder({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: CompanyDraft;
  submitLabel: string;
  onSubmit: (draft: CompanyDraft) => void;
}) {
  const [draft, setDraft] = useState<CompanyDraft>(initial ?? emptyDraft());
  const [activeModuleId, setActiveModuleId] = useState(
    draft.moduleIds[0] ?? MODULE_CATALOG[0].id,
  );
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState<FieldType>("text");
  const [stageName, setStageName] = useState("");
  const [deptName, setDeptName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [pageDesc, setPageDesc] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [ruleTrigger, setRuleTrigger] = useState(AUTOMATION_TRIGGERS[0]);
  const [ruleAction, setRuleAction] = useState(AUTOMATION_ACTIONS[0]);

  const activeModule = draft.modules.find((m) => m.moduleId === activeModuleId);
  const activeDef = MODULE_CATALOG.find((m) => m.id === activeModuleId);

  const grouped = useMemo(() => {
    const map = new Map<string, ModuleDefinition[]>();
    for (const mod of MODULE_CATALOG) {
      const list = map.get(mod.category) ?? [];
      list.push(mod);
      map.set(mod.category, list);
    }
    return Array.from(map.entries());
  }, []);

  function toggleModule(id: string) {
    setDraft((prev) => {
      const exists = prev.moduleIds.includes(id);
      const moduleIds = exists
        ? prev.moduleIds.filter((x) => x !== id)
        : [...prev.moduleIds, id];
      return {
        ...prev,
        moduleIds,
        modules: syncModules(moduleIds, prev.modules),
      };
    });
    setActiveModuleId(id);
  }

  function updateActiveModule(updater: (mod: ModuleConfig) => ModuleConfig) {
    setDraft((prev) => ({
      ...prev,
      modules: prev.modules.map((mod) =>
        mod.moduleId === activeModuleId ? updater(mod) : mod,
      ),
    }));
  }

  function addField() {
    if (!fieldName.trim() || !activeModule) return;
    const field: CustomField = {
      id: uid("field"),
      name: fieldName.trim(),
      type: fieldType,
      required: false,
      options: fieldType === "select" ? ["Вариант 1", "Вариант 2"] : undefined,
    };
    updateActiveModule((mod) => ({
      ...mod,
      customFields: [...mod.customFields, field],
    }));
    setFieldName("");
  }

  function addStage() {
    if (!stageName.trim() || !activeModule) return;
    updateActiveModule((mod) => ({
      ...mod,
      stages: [
        ...mod.stages,
        { id: uid("stage"), name: stageName.trim(), color: "#0b6b56" },
      ],
    }));
    setStageName("");
  }

  function addAutomation() {
    if (!ruleName.trim() || !activeModule) return;
    updateActiveModule((mod) => ({
      ...mod,
      automations: [
        ...mod.automations,
        {
          id: uid("auto"),
          name: ruleName.trim(),
          trigger: ruleTrigger,
          action: ruleAction,
          enabled: true,
        },
      ],
    }));
    setRuleName("");
  }

  const canSubmit = draft.name.trim().length > 1 && draft.moduleIds.length > 0;

  function applyDoorPreset() {
    const moduleIds = [...DOOR_STORE_PRESET.moduleIds];
    setDraft({
      name: DOOR_STORE_PRESET.name,
      industry: DOOR_STORE_PRESET.industry,
      description: DOOR_STORE_PRESET.description,
      moduleIds,
      modules: buildDoorStoreDraftModules(),
      roles: DOOR_STORE_PRESET.roles.map((role) => ({
        id: uid("role"),
        name: role.name,
        permissions: role.permissions,
      })),
      departments: [...DOOR_STORE_PRESET.departments],
      customPages: DOOR_STORE_PRESET.pages.map((page) => ({
        id: uid("page"),
        title: page.title,
        description: page.description,
      })),
    });
    setActiveModuleId(moduleIds[0] ?? MODULE_CATALOG[0].id);
  }

  return (
    <div className="space-y-4">
      <Surface className="p-5 sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="text-[11px] font-medium tracking-[0.16em] text-[var(--pult-accent)] uppercase">
            Шаг 1 · Компания
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border-[var(--pult-gold)]/40 bg-[linear-gradient(135deg,rgba(154,123,79,0.12),rgba(255,255,255,0.8))]"
            onClick={applyDoorPreset}
          >
            Пресет: салон дверей
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="company-name">Название</Label>
            <Input
              id="company-name"
              value={draft.name}
              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
              placeholder="Например, Ателье Север"
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>Отрасль</Label>
            <Select
              value={draft.industry}
              onValueChange={(value) => {
                if (value) setDraft((p) => ({ ...p, industry: value }));
              }}
            >
              <SelectTrigger className="w-full bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="company-desc">Описание</Label>
            <textarea
              id="company-desc"
              value={draft.description}
              onChange={(e) =>
                setDraft((p) => ({ ...p, description: e.target.value }))
              }
              placeholder="Что делает компания и для кого"
              className="min-h-24 w-full rounded-xl border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </div>
      </Surface>

      <Surface className="p-5 sm:p-6">
        <div className="mb-1 flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-[var(--pult-accent)] uppercase">
          <Layers3 className="size-3.5" />
          Шаг 2 · Модули
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Включайте только нужное. Остальное можно добавить позже.
        </p>
        <div className="space-y-5">
          {grouped.map(([category, mods]) => (
            <div key={category}>
              <div className="mb-2 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {mods.map((mod) => {
                  const on = draft.moduleIds.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className={`rounded-2xl border p-3.5 text-left transition-all ${
                        on
                          ? "border-[var(--pult-accent)]/40 bg-[var(--pult-accent-soft)]/70 shadow-[var(--pult-shadow)]"
                          : "border-[var(--pult-line)] bg-white/70 hover:border-[var(--pult-accent)]/25"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-medium">{mod.title}</div>
                        <Checkbox checked={on} tabIndex={-1} />
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {mod.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Surface>

      <Surface className="p-5 sm:p-6">
        <div className="mb-1 flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] text-[var(--pult-accent)] uppercase">
          <Settings2 className="size-3.5" />
          Шаг 3 · Настройка выбранного
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Поля, стадии, опции и автоматизации для каждого модуля.
        </p>

        {draft.moduleIds.length === 0 ? (
          <p className="text-sm text-muted-foreground">Сначала выберите модули выше.</p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <div className="space-y-1">
              {draft.moduleIds.map((id) => {
                const def = MODULE_CATALOG.find((m) => m.id === id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveModuleId(id)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm transition-colors ${
                      activeModuleId === id
                        ? "bg-[var(--pult-ink)] text-[var(--pult-paper)]"
                        : "bg-white/70 hover:bg-white"
                    }`}
                  >
                    {def?.title ?? id}
                  </button>
                );
              })}
            </div>

            {activeModule && activeDef ? (
              <div className="rounded-2xl border border-[var(--pult-line)] bg-white/70 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-[family-name:var(--font-display)] text-lg">
                      {activeDef.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{activeDef.description}</p>
                  </div>
                  <Badge variant="secondary">
                    {activeModule.customFields.length} полей
                  </Badge>
                </div>

                <Tabs defaultValue="fields">
                  <TabsList className="mb-3 rounded-full bg-[var(--pult-canvas)] p-1">
                    <TabsTrigger value="fields" className="rounded-full">
                      Поля
                    </TabsTrigger>
                    <TabsTrigger value="stages" className="rounded-full">
                      Стадии
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-full">
                      Опции
                    </TabsTrigger>
                    <TabsTrigger value="automations" className="rounded-full">
                      Авто
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="fields" className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={fieldName}
                        onChange={(e) => setFieldName(e.target.value)}
                        placeholder="Название поля"
                        className="bg-white"
                      />
                      <Select
                        value={fieldType}
                        onValueChange={(value) => {
                          if (value) setFieldType(value as FieldType);
                        }}
                      >
                        <SelectTrigger className="w-full bg-white sm:w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(FIELD_TYPE_LABELS) as FieldType[]).map(
                            (type) => (
                              <SelectItem key={type} value={type}>
                                {FIELD_TYPE_LABELS[type]}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                      <Button type="button" onClick={addField} className="rounded-full">
                        <Plus className="size-4" />
                        Поле
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {activeModule.customFields.map((field) => (
                        <div
                          key={field.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-[var(--pult-line)] px-3 py-2"
                        >
                          <div>
                            <div className="text-sm font-medium">{field.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {FIELD_TYPE_LABELS[field.type]}
                              {field.required ? " · обязательное" : ""}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="flex items-center gap-2 text-xs">
                              <Checkbox
                                checked={field.required}
                                onCheckedChange={(checked) => {
                                  updateActiveModule((mod) => ({
                                    ...mod,
                                    customFields: mod.customFields.map((f) =>
                                      f.id === field.id
                                        ? { ...f, required: Boolean(checked) }
                                        : f,
                                    ),
                                  }));
                                }}
                              />
                              Обяз.
                            </Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                updateActiveModule((mod) => ({
                                  ...mod,
                                  customFields: mod.customFields.filter(
                                    (f) => f.id !== field.id,
                                  ),
                                }))
                              }
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="stages" className="space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={stageName}
                        onChange={(e) => setStageName(e.target.value)}
                        placeholder="Новая стадия"
                        className="bg-white"
                      />
                      <Button type="button" onClick={addStage} className="rounded-full">
                        <Plus className="size-4" />
                        Стадия
                      </Button>
                    </div>
                    {activeModule.stages.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Стадий пока нет — добавьте, если нужна воронка или статусы.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {activeModule.stages.map((stage) => (
                          <Badge
                            key={stage.id}
                            className="gap-2 border bg-white text-[var(--pult-ink)]"
                            style={{ borderColor: stage.color }}
                          >
                            <span
                              className="size-2 rounded-full"
                              style={{ background: stage.color }}
                            />
                            {stage.name}
                            <button
                              type="button"
                              className="opacity-60 hover:opacity-100"
                              onClick={() =>
                                updateActiveModule((mod) => ({
                                  ...mod,
                                  stages: mod.stages.filter((s) => s.id !== stage.id),
                                }))
                              }
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-3">
                    {activeDef.settingKeys.map((setting) => (
                      <div
                        key={setting.key}
                        className="flex items-center justify-between gap-3 rounded-xl border border-[var(--pult-line)] px-3 py-2.5"
                      >
                        <span className="text-sm">{setting.label}</span>
                        {setting.kind === "toggle" ? (
                          <Checkbox
                            checked={Boolean(activeModule.settings[setting.key])}
                            onCheckedChange={(checked) => {
                              updateActiveModule((mod) => ({
                                ...mod,
                                settings: {
                                  ...mod.settings,
                                  [setting.key]: Boolean(checked),
                                },
                              }));
                            }}
                          />
                        ) : (
                          <Input
                            type={setting.kind === "number" ? "number" : "text"}
                            className="h-8 w-28 bg-white"
                            value={String(activeModule.settings[setting.key] ?? "")}
                            onChange={(e) => {
                              const value =
                                setting.kind === "number"
                                  ? Number(e.target.value || 0)
                                  : e.target.value;
                              updateActiveModule((mod) => ({
                                ...mod,
                                settings: {
                                  ...mod.settings,
                                  [setting.key]: value,
                                },
                              }));
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="automations" className="space-y-3">
                    <div className="grid gap-2 md:grid-cols-4">
                      <Input
                        value={ruleName}
                        onChange={(e) => setRuleName(e.target.value)}
                        placeholder="Название правила"
                        className="bg-white md:col-span-2"
                      />
                      <Select
                        value={ruleTrigger}
                        onValueChange={(value) => {
                          if (value) setRuleTrigger(value);
                        }}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AUTOMATION_TRIGGERS.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={ruleAction}
                        onValueChange={(value) => {
                          if (value) setRuleAction(value);
                        }}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AUTOMATION_ACTIONS.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      onClick={addAutomation}
                      className="rounded-full"
                    >
                      <Workflow className="size-4" />
                      Добавить правило
                    </Button>
                    <div className="space-y-2">
                      {activeModule.automations.map((rule) => (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between gap-3 rounded-xl border border-[var(--pult-line)] px-3 py-2"
                        >
                          <div>
                            <div className="text-sm font-medium">{rule.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Если «{rule.trigger}» → «{rule.action}»
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              updateActiveModule((mod) => ({
                                ...mod,
                                automations: mod.automations.filter(
                                  (a) => a.id !== rule.id,
                                ),
                              }))
                            }
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : null}
          </div>
        )}
      </Surface>

      <div className="grid gap-4 lg:grid-cols-2">
        <Surface className="p-5">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-medium tracking-[0.14em] text-[var(--pult-accent)] uppercase">
            <UsersRound className="size-3.5" />
            Роли и отделы
          </div>
          <div className="mb-3 flex gap-2">
            <Input
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Новая роль"
              className="bg-white"
            />
            <Button
              type="button"
              className="rounded-full"
              onClick={() => {
                if (!roleName.trim()) return;
                setDraft((p) => ({
                  ...p,
                  roles: [
                    ...p.roles,
                    {
                      id: uid("role"),
                      name: roleName.trim(),
                      permissions: ["read"],
                    },
                  ],
                }));
                setRoleName("");
              }}
            >
              <Plus className="size-4" />
            </Button>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {draft.roles.map((role) => (
              <Badge key={role.id} variant="secondary" className="gap-2">
                {role.name}
                <button
                  type="button"
                  onClick={() =>
                    setDraft((p) => ({
                      ...p,
                      roles: p.roles.filter((r) => r.id !== role.id),
                    }))
                  }
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
          <Separator className="my-3" />
          <div className="mb-3 flex gap-2">
            <Input
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              placeholder="Новый отдел"
              className="bg-white"
            />
            <Button
              type="button"
              className="rounded-full"
              onClick={() => {
                if (!deptName.trim()) return;
                setDraft((p) => ({
                  ...p,
                  departments: [...p.departments, deptName.trim()],
                }));
                setDeptName("");
              }}
            >
              <Plus className="size-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {draft.departments.map((dept) => (
              <Badge
                key={dept}
                className="gap-2 bg-[var(--pult-accent-soft)] text-[var(--pult-accent)]"
              >
                {dept}
                <button
                  type="button"
                  onClick={() =>
                    setDraft((p) => ({
                      ...p,
                      departments: p.departments.filter((d) => d !== dept),
                    }))
                  }
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </Surface>

        <Surface className="p-5">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-medium tracking-[0.14em] text-[var(--pult-accent)] uppercase">
            <FileStack className="size-3.5" />
            Свои страницы
          </div>
          <div className="mb-3 grid gap-2">
            <Input
              value={pageTitle}
              onChange={(e) => setPageTitle(e.target.value)}
              placeholder="Название страницы"
              className="bg-white"
            />
            <Input
              value={pageDesc}
              onChange={(e) => setPageDesc(e.target.value)}
              placeholder="Короткое описание"
              className="bg-white"
            />
            <Button
              type="button"
              className="rounded-full"
              onClick={() => {
                if (!pageTitle.trim()) return;
                setDraft((p) => ({
                  ...p,
                  customPages: [
                    ...p.customPages,
                    {
                      id: uid("page"),
                      title: pageTitle.trim(),
                      description: pageDesc.trim() || "Кастомный раздел",
                    },
                  ],
                }));
                setPageTitle("");
                setPageDesc("");
              }}
            >
              <Plus className="size-4" />
              Добавить страницу
            </Button>
          </div>
          <div className="space-y-2">
            {draft.customPages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Например: «Онбординг», «Регламент сдачи», «База подрядчиков».
              </p>
            ) : (
              draft.customPages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-[var(--pult-line)] px-3 py-2"
                >
                  <div>
                    <div className="text-sm font-medium">{page.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {page.description}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setDraft((p) => ({
                        ...p,
                        customPages: p.customPages.filter((x) => x.id !== page.id),
                      }))
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Surface>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--pult-line)] bg-white/80 p-4 shadow-[var(--pult-shadow)]">
        <div className="text-sm text-muted-foreground">
          Модулей: {draft.moduleIds.length} · ролей: {draft.roles.length} · страниц:{" "}
          {draft.customPages.length}
        </div>
        <Button
          disabled={!canSubmit}
          className="rounded-full bg-[var(--pult-accent)] px-6 text-white hover:bg-[var(--pult-accent)]/90 disabled:opacity-50"
          onClick={() => onSubmit(draft)}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
