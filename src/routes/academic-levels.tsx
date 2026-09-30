import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout, PageHeader } from "@/components/public-layout";
import { STAGES, STAGE_BLURB, YEARS_BY_STAGE } from "@/lib/academics";
import { publishedResourcesQuery } from "@/lib/data";

export const Route = createFileRoute("/academic-levels")({
  head: () => ({
    meta: [
      { title: "Academic Levels — Cyrus Resources" },
      {
        name: "description",
        content:
          "Find resources for Pre-School, Primary (Years 1–6), O Level (Years 7–9) and A Level (Years 10–12).",
      },
      { property: "og:title", content: "Academic Levels — Cyrus Resources" },
      {
        property: "og:description",
        content: "Resources organised by academic stage and year group.",
      },
    ],
  }),
  component: AcademicLevels,
});

function AcademicLevels() {
  const { data: resources = [] } = useQuery(publishedResourcesQuery);

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Academic Levels"
        title="Browse by stage and year"
        description="Our academic structure runs from Pre-School through A Level."
      />
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-12">
        {STAGES.map((stage) => {
          const stageCount = resources.filter((r) => r.stage === stage).length;
          return (
            <section key={stage} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h2 className="text-xl font-semibold">{stage}</h2>
                  <p className="text-sm text-muted-foreground">{STAGE_BLURB[stage]}</p>
                </div>
                <Link
                  to="/resources"
                  search={{ stage }}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View all {stageCount} resource{stageCount === 1 ? "" : "s"}
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {YEARS_BY_STAGE[stage].map((year) => (
                  <Link
                    key={year}
                    to="/resources"
                    search={{ stage, year }}
                    className="rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
                  >
                    {year}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </PublicLayout>
  );
}
