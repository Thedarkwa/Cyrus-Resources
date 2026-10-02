import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { summariseYears } from "@/lib/academics";
import { allResourcesQuery, matchesSearch, type Resource } from "@/lib/data";

export const Route = createFileRoute("/admin/resources/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Manage Resources — Cyrus Resources Admin" },
      { name: "description", content: "Edit, publish and remove library resources." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Manage Resources — Cyrus Resources Admin" },
      { property: "og:description", content: "Edit, publish and remove library resources." },
    ],
  }),
  component: () => (
    <AdminShell>
      <ManageResources />
    </AdminShell>
  ),
});

function ManageResources() {
  const queryClient = useQueryClient();
  const { data: resources = [], isLoading } = useQuery(allResourcesQuery);
  const [term, setTerm] = useState("");
  const [toDelete, setToDelete] = useState<Resource | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["resources"] });

  const togglePublished = async (r: Resource) => {
    const { error } = await supabase
      .from("resources")
      .update({ is_published: !r.is_published })
      .eq("id", r.id);
    if (error) return toast.error("Could not update status.");
    void refresh();
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const { error } = await supabase.from("resources").delete().eq("id", toDelete.id);
    setToDelete(null);
    if (error) return toast.error("Could not delete the resource.");
    toast.success("Resource deleted");
    void refresh();
  };

  const rows = resources.filter((r) => matchesSearch(r, term));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Manage Resources</h1>
        <Button asChild>
          <Link to="/admin/resources/new">
            <Plus className="size-4" /> Add Resource
          </Link>
        </Button>
      </div>
      <Input
        className="mt-5 max-w-sm bg-card"
        placeholder="Search resources..."
        value={term}
        onChange={(e) => setTerm(e.target.value)}
      />
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Resource</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  {r.title}
                  {r.is_featured && (
                    <Badge className="ml-2 bg-gold text-gold-foreground hover:bg-gold">
                      Featured
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{r.subject?.name ?? "—"}</TableCell>
                <TableCell>{r.stage}</TableCell>
                <TableCell>{summariseYears(r.years)}</TableCell>
                <TableCell>{r.resource_type?.name ?? "—"}</TableCell>
                <TableCell>
                  <button onClick={() => togglePublished(r)} title="Toggle published">
                    <Badge variant={r.is_published ? "secondary" : "outline"}>
                      {r.is_published ? "Published" : "Unpublished"}
                    </Badge>
                  </button>
                </TableCell>
                <TableCell className="space-x-2 whitespace-nowrap text-right">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/admin/resources/$resourceId" params={{ resourceId: r.id }}>
                      Edit
                    </Link>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setToDelete(r)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this resource?</AlertDialogTitle>
            <AlertDialogDescription>
              This resource will be removed from the public resource library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete Resource</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
