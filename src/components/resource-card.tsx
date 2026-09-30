import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Globe, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { summariseYears } from "@/lib/academics";
import type { Resource } from "@/lib/data";

function faviconFor(url: string) {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
  } catch {
    return null;
  }
}

export function ResourceCard({ resource }: { resource: Resource }) {
  const icon = resource.thumbnail_url ?? faviconFor(resource.url);

  return (
    <article className="card-lift flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary">
          {icon ? (
            <img src={icon} alt="" className="size-7 object-contain" loading="lazy" />
          ) : (
            <Globe className="size-5 text-muted-foreground" />
          )}
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{resource.title}</h3>
          <p className="text-xs text-muted-foreground">
            {resource.resource_type?.name ?? "Resource"}
          </p>
        </div>
        {resource.is_featured && (
          <Star className="ml-auto size-4 shrink-0 fill-gold text-gold" aria-label="Featured" />
        )}
      </div>

      <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
        {resource.description ?? "No description provided."}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {resource.subject?.name && <Badge variant="secondary">{resource.subject.name}</Badge>}
        <Badge variant="outline">{resource.stage}</Badge>
        <Badge variant="outline">{summariseYears(resource.years)}</Badge>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/70 pt-4 text-sm">
        <Link
          to="/resources/$resourceId"
          params={{ resourceId: resource.id }}
          className="font-medium text-primary hover:underline"
        >
          Details
        </Link>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
        >
          Visit Resource <ArrowUpRight className="size-4" />
        </a>
      </div>
    </article>
  );
}
