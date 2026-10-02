import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { allResourcesQuery, resourceTypesQuery, subjectsQuery } from "@/lib/data";

export const Route = createFileRoute("/admin/categories")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Categories — Cyrus Resources Admin" },
      { name: "description", content: "Manage subjects and resource types." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Categories — Cyrus Resources Admin" },
      { property: "og:description", content: "Manage subjects and resource types." },
    ],
  }),
  component: () => (
    <AdminShell>
      <h1 className="text-2xl font-semibold">Categories</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ListManager kind="subjects" />
        <ListManager kind="resource_types" />
      </div>
    </AdminShell>
  ),
});

type Kind = "subjects" | "resource_types";

function ListManager({ kind }: { kind: Kind }) {
  const queryClient = useQueryClient();
  const isSubjects = kind === "subjects";
  const { data: subjects = [] } = useQuery(subjectsQuery);
  const { data: types = [] } = useQuery(resourceTypesQuery);
  const { data: resources = [] } = useQuery(allResourcesQuery);
  const items = isSubjects
    ? subjects
    : types.map((t) => ({ ...t, is_active: true }));

  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: [kind] });
    void queryClient.invalidateQueries({ queryKey: ["resources"] });
  };

  const usage = (id: string) =>
    resources.filter((r) => (isSubjects ? r.subject_id : r.resource_type_id) === id).length;

  const add = async () => {
    const name = newName.trim();
    if (!name) return;
    const { error } = await supabase.from(kind).insert({ name });
    if (error) { toast.error("Could not add — the name may already exist."); return; }
    setNewName("");
    refresh();
  };

  const rename = async (id: string) => {
    const name = editName.trim();
    if (!name) return;
    const { error } = await supabase.from(kind).update({ name }).eq("id", id);
    if (error) { toast.error("Could not rename."); return; }
    setEditing(null);
    refresh();
  };

  const toggleActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from("subjects").update({ is_active: !active }).eq("id", id);
    if (error) { toast.error("Could not update."); return; }
    refresh();
  };

  const remove = async (id: string) => {
    if (usage(id) > 0) {
      toast.error("This is in use. Reassign those resources before deleting.");
      return;
    }
    const { error } = await supabase.from(kind).delete().eq("id", id);
    if (error) { toast.error("Could not delete."); return; }
    refresh();
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <h2 className="font-semibold">{isSubjects ? "Subjects" : "Resource types"}</h2>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void add();
        }}
      >
        <Input
          placeholder={isSubjects ? "New subject" : "New resource type"}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button type="submit">Add</Button>
      </form>
      <ul className="mt-4 divide-y divide-border">
        {items.map((item) => (
          <li key={item.id} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
            {editing === item.id ? (
              <>
                <Input
                  className="h-8 flex-1"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                />
                <Button size="sm" onClick={() => rename(item.id)}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <span className="flex-1">
                  {item.name}
                  <span className="ml-2 text-xs text-muted-foreground">{usage(item.id)} used</span>
                  {!item.is_active && (
                    <Badge variant="outline" className="ml-2">
                      Disabled
                    </Badge>
                  )}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(item.id);
                    setEditName(item.name);
                  }}
                >
                  Rename
                </Button>
                {isSubjects && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(item.id, item.is_active)}
                  >
                    {item.is_active ? "Disable" : "Enable"}
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => remove(item.id)}>
                  Delete
                </Button>
              </>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
