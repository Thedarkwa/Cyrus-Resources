import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { PublicLayout, PageHeader } from "@/components/public-layout";
import { publishedResourcesQuery, subjectsQuery } from "@/lib/data";

export const Route = createFileRoute("/subjects")({
  head: () => ({
    meta: [
      { title: "Subjects — Cyrus Resources" },
      {
        name: "description",
        content:
          "Browse educational resources by subject, from English and Mathematics to Physics, Computing and Economics.",
      },
      { property: "og:title", content: "Subjects — Cyrus Resources" },
      {
        property: "og:description",
        content: "Browse the school's educational resources subject by subject.",
      },
    ],
  }),
  component: SubjectsPage,
});

function SubjectsPage() {
  const { data: subjects = [] } = useQuery(subjectsQuery);
  const { data: resources = [] } = useQuery(publishedResourcesQuery);

  const countFor = (name: string) => resources.filter((r) => r.subject?.name === name).length;

  return (
    <PublicLayout>
      <PageHeader
        eyebrow="Subjects"
        title="Browse by subject"
        description="Pick a subject to see every published resource linked to it."
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              to="/resources"
              search={{ subject: subject.name }}
              className="card-lift rounded-2xl border border-border bg-card p-5"
            >
              <h2 className="text-lg font-semibold">{subject.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {countFor(subject.name)} resource{countFor(subject.name) === 1 ? "" : "s"}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                View resources <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
