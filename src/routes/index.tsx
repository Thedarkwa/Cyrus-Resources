import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { PublicLayout } from "@/components/public-layout";
import { ResourceCard } from "@/components/resource-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { STAGES, STAGE_BLURB } from "@/lib/academics";
import { publishedResourcesQuery, subjectsQuery } from "@/lib/data";
import heroImage from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cyrus Resources — Your school's educational resources" },
      {
        name: "description",
        content:
          "Search educational websites, learning platforms, videos, digital tools and revision resources for Pre-School through A Level.",
      },
      { property: "og:title", content: "Cyrus Resources" },
      {
        property: "og:description",
        content: "Your school's educational resources, all in one place.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [term, setTerm] = useState("");
  const { data: resources = [] } = useQuery(publishedResourcesQuery);
  const { data: subjects = [] } = useQuery(subjectsQuery);

  const featured = resources.filter((r) => r.is_featured).slice(0, 3);
  const recent = resources.slice(0, 6);

  return (
    <PublicLayout>
      <section className="surface-brand relative overflow-hidden">
        <img
          src={heroImage}
          alt=""
          width={1600}
          height={1008}
          className="absolute inset-0 size-full object-cover opacity-30"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-gold">
            <Sparkles className="size-3.5" /> Search. Discover. Learn.
          </p>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold sm:text-5xl">Cyrus Resources</h1>
          <p className="mt-4 max-w-xl text-lg opacity-90">
            Your school's educational resources, all in one place.
          </p>
          <p className="mt-3 max-w-2xl text-sm opacity-80">
            Explore educational websites, learning platforms, videos, digital tools and other
            resources selected to support teaching and learning.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to="/resources">
                Explore Resources <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/40 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground"
            >
              <Link to="/subjects">Browse Subjects</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto -mt-10 max-w-3xl px-4">
        <form
          className="rounded-2xl border border-border bg-card p-5 shadow-lg"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <label htmlFor="home-search" className="font-display text-base font-semibold">
            What are you looking for?
          </label>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="home-search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search educational resources..."
                className="pl-9"
              />
            </div>
            <Button asChild>
              <Link to="/resources" search={{ q: term || undefined }}>
                Search
              </Link>
            </Button>
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold">Explore by Academic Level</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stage) => (
            <Link
              key={stage}
              to="/resources"
              search={{ stage }}
              className="card-lift rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="text-lg font-semibold">{stage}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{STAGE_BLURB[stage]}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                View resources <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-semibold">Browse by Subject</h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <Link
                key={subject.id}
                to="/resources"
                search={{ subject: subject.name }}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
              >
                {subject.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold">Featured Resources</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold">Recently Added</h2>
          <Link to="/resources" className="text-sm font-medium text-primary hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-4">
        <div className="surface-brand rounded-3xl px-6 py-12 text-center">
          <h2 className="text-2xl font-semibold">Find the right resource, faster</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm opacity-85">
            One organised place for the websites, tools and materials our teachers and learners
            rely on every day.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link to="/resources">Explore Resources</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
