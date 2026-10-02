import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin-shell";
import { ResourceForm } from "@/components/resource-form";

export const Route = createFileRoute("/admin/resources/new")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Add Resource — Cyrus Resources Admin" },
      { name: "description", content: "Add a new resource to the library." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Add Resource — Cyrus Resources Admin" },
      { property: "og:description", content: "Add a new resource to the library." },
    ],
  }),
  component: () => (
    <AdminShell>
      <div className="max-w-3xl">
        <h1 className="mb-6 text-2xl font-semibold">Add Resource</h1>
        <ResourceForm />
      </div>
    </AdminShell>
  ),
});
