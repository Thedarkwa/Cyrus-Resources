import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout, PageHeader } from "@/components/public-layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Cyrus Resources" },
      {
        name: "description",
        content:
          "Cyrus Resources is the school's digital educational resource library, maintained by a small team of resource administrators.",
      },
      { property: "og:title", content: "About — Cyrus Resources" },
      {
        property: "og:description",
        content: "Why Cyrus Resources exists and how the library is maintained.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PublicLayout>
      <PageHeader
        eyebrow="About"
        title="The school's digital resource library"
        description="One organised place to find the educational websites, tools and materials our teachers and learners rely on."
      />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-muted-foreground">
          Rather than searching through messages, bookmarks and documents for useful links, Cyrus
          Resources gathers approved educational resources in a single library that anyone in the
          school community can use — no account and no login needed.
        </p>

        <h2 className="mt-10 text-xl font-semibold">What you'll find here</h2>
        <ul className="mt-3 grid gap-2 text-muted-foreground sm:grid-cols-2">
          <li>Educational websites</li>
          <li>Learning platforms</li>
          <li>Videos</li>
          <li>Digital tools</li>
          <li>Simulations</li>
          <li>E-books</li>
          <li>Revision resources</li>
          <li>Online courses</li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold">How it's organised</h2>
        <p className="mt-3 text-muted-foreground">
          Every resource is tagged with a subject, an academic stage (Pre-School, Primary, Lower
          Secondary or Upper Secondary), the year groups it suits, and a resource type — so you can
          filter down to exactly the right material.
        </p>

        <h2 className="mt-10 text-xl font-semibold">Who maintains it</h2>
        <p className="mt-3 text-muted-foreground">
          A small team of designated resource administrators adds new resources, keeps links up to
          date and removes anything outdated. Public visitors have read-only access.
        </p>

        <Button asChild className="mt-8">
          <Link to="/resources">Explore Resources</Link>
        </Button>
      </div>
    </PublicLayout>
  );
}
