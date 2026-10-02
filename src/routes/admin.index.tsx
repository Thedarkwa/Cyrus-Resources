import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { allResourcesQuery, subjectsQuery } from "@/lib/data";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Cyrus Resources" },
      { name: "description", content: "Manage the Cyrus Resources library." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Dashboard — Cyrus Resources" },
      { property: "og:description", content: "Manage the Cyrus Resources library." },
    ],
  }),
  component: () => (
    <AdminShell>
      <Dashboard />
    </AdminShell>
  ),
});

function Dashboard() {
  const { data: resources = [] } = useQuery(allResourcesQuery);
  const { data: subjects = [] } = useQuery(subjectsQuery);

  const stats = [
    { label: "Total Resources", value: resources.length },
    { label: "Featured Resources", value: resources.filter((r) => r.is_featured).length },
    { label: "Unpublished", value: resources.filter((r) => !r.is_published).length },
    { label: "Subjects", value: subjects.length },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Button asChild>
          <Link to="/admin/resources/new">
            <Plus className="size-4" /> Add Resource
          </Link>
        </Button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 font-display text-3xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Recent Resources</h2>
        <ul className="mt-3 divide-y divide-border">
          {resources.slice(0, 6).map((r) => (
            <li key={r.id} className="flex items-center justify-between py-2.5 text-sm">
              <span>{r.title}</span>
              <Link
                to="/admin/resources/$resourceId"
                params={{ resourceId: r.id }}
                className="text-primary hover:underline"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
