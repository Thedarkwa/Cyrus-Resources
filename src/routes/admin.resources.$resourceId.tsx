import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin-shell";
import { ResourceForm } from "@/components/resource-form";
import { resourceQuery } from "@/lib/data";

export const Route = createFileRoute("/admin/resources/$resourceId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Edit Resource — Cyrus Resources Admin" },
      { name: "description", content: "Edit a resource in the library." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Edit Resource — Cyrus Resources Admin" },
      { property: "og:description", content: "Edit a resource in the library." },
    ],
  }),
  component: () => (
    <AdminShell>
      <EditResource />
    </AdminShell>
  ),
});

function EditResource() {
  const { resourceId } = Route.useParams();
  const { data, isLoading } = useQuery(resourceQuery(resourceId));
  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold">Edit Resource</h1>
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && !data && <p className="text-sm">Resource not found.</p>}
      {data && <ResourceForm key={data.id} resource={data} />}
    </div>
  );
}
