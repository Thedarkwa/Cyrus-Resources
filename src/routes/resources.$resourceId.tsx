import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { resourceQuery } from "@/lib/data";

export const Route = createFileRoute("/resources/$resourceId")({
  head: () => ({
    meta: [
      { title: "Resource details — Cyrus Resources" },
      {
        name: "description",
        content: "Read about this educational resource and open it in a new tab.",
      },
      { property: "og:title", content: "Resource details — Cyrus Resources" },
      {
        property: "og:description",
        content: "Read about this educational resource and open it in a new tab.",
      },
    ],
  }),
  component: ResourceDetails,
});

function ResourceDetails() {
  const { resourceId } = Route.useParams();
  const { data: resource, isLoading } = useQuery(resourceQuery(resourceId));

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Link
          to="/resources"
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to resources
        </Link>

        {isLoading && <p className="mt-10 text-sm text-muted-foreground">Loading…</p>}

        {!isLoading && !resource && (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
            <h1 className="text-xl font-semibold">Resource unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This resource may have been removed or unpublished.
            </p>
          </div>
        )}

        {resource && (
          <article className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              {resource.resource_type?.name ?? "Resource"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold">{resource.title}</h1>

            <h2 className="mt-8 text-lg font-semibold">Description</h2>
            <p className="mt-2 text-muted-foreground">
              {resource.description ?? "No description provided."}
            </p>

            <h2 className="mt-8 text-lg font-semibold">Resource information</h2>
            <dl className="mt-3 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Subject</dt>
                <dd className="mt-1 font-medium">{resource.subject?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Stage</dt>
                <dd className="mt-1 font-medium">{resource.stage}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Years</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {resource.years.length > 0 ? (
                    resource.years.map((y) => (
                      <Badge key={y} variant="secondary">
                        {y}
                      </Badge>
                    ))
                  ) : (
                    <span className="font-medium">All years</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Type</dt>
                <dd className="mt-1 font-medium">{resource.resource_type?.name ?? "—"}</dd>
              </div>
            </dl>

            <Button asChild size="lg" className="mt-8">
              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                Visit Website <ArrowUpRight className="size-4" />
              </a>
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">Opens in a new browser tab.</p>
          </article>
        )}
      </div>
    </PublicLayout>
  );
}
