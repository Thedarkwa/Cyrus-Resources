import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { PublicLayout, PageHeader } from "@/components/public-layout";
import { ResourceCard } from "@/components/resource-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_YEARS, STAGES, YEARS_BY_STAGE, isStage } from "@/lib/academics";
import {
  matchesSearch,
  publishedResourcesQuery,
  resourceTypesQuery,
  subjectsQuery,
} from "@/lib/data";

type ResourceSearch = {
  q?: string | undefined;
  subject?: string | undefined;
  stage?: string | undefined;
  year?: string | undefined;
  type?: string | undefined;
};

const ANY = "__any";

export const Route = createFileRoute("/resources/")({
  validateSearch: (search: Record<string, unknown>): ResourceSearch => ({
    q: typeof search["q"] === "string" ? search["q"] as string : undefined,
    subject: typeof search["subject"] === "string" ? search["subject"] as string : undefined,
    stage: typeof search["stage"] === "string" ? search["stage"] as string : undefined,
    year: typeof search["year"] === "string" ? search["year"] as string : undefined,
    type: typeof search["type"] === "string" ? search["type"] as string : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Resource Library — Cyrus Resources" },
      {
        name: "description",
        content:
          "Browse, search and filter every published educational resource by subject, academic stage, year and resource type.",
      },
      { property: "og:title", content: "Resource Library — Cyrus Resources" },
      {
        property: "og:description",
        content: "Search and filter the school's educational resources.",
      },
    ],
  }),
  component: ResourceLibrary,
});

function ResourceLibrary() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const { data: resources = [], isLoading } = useQuery(publishedResourcesQuery);
  const { data: subjects = [] } = useQuery(subjectsQuery);
  const { data: types = [] } = useQuery(resourceTypesQuery);

  const setSearch = (patch: Partial<ResourceSearch>) => {
    void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });
  };

  const yearOptions = isStage(search.stage) ? YEARS_BY_STAGE[search.stage] : ALL_YEARS;

  const filtered = resources.filter((r) => {
    if (search.subject && r.subject?.name !== search.subject) return false;
    if (search.stage && r.stage !== search.stage) return false;
    if (search.year && !r.years.includes(search.year)) return false;
    if (search.type && r.resource_type?.name !== search.type) return false;
    return matchesSearch(r, search.q ?? "");
  });

  const hasFilters = Boolean(
    search.q || search.subject || search.stage || search.year || search.type,
  );

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Resource Library"
        title="Browse every resource"
        description="Combine filters to narrow down to exactly what you need — for example Computing, Primary, Year 4, Educational Website."
      />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search.q ?? ""}
              onChange={(e) => setSearch({ q: e.target.value || undefined })}
              placeholder="Search educational resources..."
              className="pl-9"
              aria-label="Search resources"
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              value={search.subject ?? ANY}
              onValueChange={(v) => setSearch({ subject: v === ANY ? undefined : v })}
            >
              <SelectTrigger aria-label="Subject">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All subjects</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={search.stage ?? ANY}
              onValueChange={(v) =>
                setSearch({ stage: v === ANY ? undefined : v, year: undefined })
              }
            >
              <SelectTrigger aria-label="Academic stage">
                <SelectValue placeholder="Academic stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All stages</SelectItem>
                {STAGES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={search.year ?? ANY}
              onValueChange={(v) => setSearch({ year: v === ANY ? undefined : v })}
            >
              <SelectTrigger aria-label="Year">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All years</SelectItem>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={search.type ?? ANY}
              onValueChange={(v) => setSearch({ type: v === ANY ? undefined : v })}
            >
              <SelectTrigger aria-label="Resource type">
                <SelectValue placeholder="Resource type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY}>All types</SelectItem>
                {types.map((t) => (
                  <SelectItem key={t.id} value={t.name}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() =>
                void navigate({
                  search: {},
                  replace: true,
                })
              }
            >
              <X className="size-4" /> Clear filters
            </Button>
          )}
        </div>

        <p className="mt-6 text-sm text-muted-foreground">
          {isLoading
            ? "Loading resources..."
            : `${filtered.length} resource${filtered.length === 1 ? "" : "s"} found`}
        </p>

        {!isLoading && filtered.length === 0 && (
          <div className="mt-6 rounded-2xl border border-dashed border-border p-10 text-center">
            <h2 className="text-lg font-semibold">No matching resources</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Try removing a filter or searching for a different keyword.
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
