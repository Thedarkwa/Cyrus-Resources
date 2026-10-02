import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { STAGES, YEARS_BY_STAGE, isStage, type Stage } from "@/lib/academics";
import { resourceTypesQuery, subjectsQuery, type Resource } from "@/lib/data";

export function ResourceForm({ resource }: { resource?: Resource }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: subjects = [] } = useQuery(subjectsQuery);
  const { data: types = [] } = useQuery(resourceTypesQuery);

  const [title, setTitle] = useState(resource?.title ?? "");
  const [url, setUrl] = useState(resource?.url ?? "");
  const [description, setDescription] = useState(resource?.description ?? "");
  const [subjectId, setSubjectId] = useState(resource?.subject_id ?? "");
  const [typeId, setTypeId] = useState(resource?.resource_type_id ?? "");
  const [stage, setStage] = useState<Stage>(
    isStage(resource?.stage) ? resource.stage : "Primary",
  );
  const [years, setYears] = useState<string[]>(resource?.years ?? []);
  const [thumbnail, setThumbnail] = useState(resource?.thumbnail_url ?? "");
  const [featured, setFeatured] = useState(resource?.is_featured ?? false);
  const [published, setPublished] = useState(resource?.is_published ?? true);
  const [busy, setBusy] = useState(false);

  const toggleYear = (y: string) =>
    setYears((prev) => (prev.includes(y) ? prev.filter((v) => v !== y) : [...prev, y]));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a full URL, starting with https://");
      return;
    }
    const order = YEARS_BY_STAGE[stage];
    const payload = {
      title: title.trim(),
      url: url.trim(),
      description: description.trim() || null,
      subject_id: subjectId || null,
      resource_type_id: typeId || null,
      stage,
      years: order.filter((y) => years.includes(y)),
      thumbnail_url: thumbnail.trim() || null,
      is_featured: featured,
      is_published: published,
    };
    setBusy(true);
    const { error } = resource
      ? await supabase.from("resources").update(payload).eq("id", resource.id)
      : await supabase.from("resources").insert(payload);
    setBusy(false);
    if (error) {
      toast.error("Could not save the resource.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["resources"] });
    await queryClient.invalidateQueries({ queryKey: ["resource"] });
    toast.success(resource ? "Resource updated" : "Resource added");
    void navigate({ to: "/admin/resources" });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Basic information</h2>
        <div className="space-y-1.5">
          <Label htmlFor="title">Resource name</Label>
          <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            required
            placeholder="https://"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="thumb">Image URL (optional)</Label>
          <Input
            id="thumb"
            placeholder="Leave blank to use the website's icon"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
          />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Classification</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects
                  .filter((s) => s.is_active || s.id === subjectId)
                  .map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Resource type</Label>
            <Select value={typeId} onValueChange={setTypeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Academic stage</Label>
            <Select
              value={stage}
              onValueChange={(v) => {
                if (isStage(v)) {
                  setStage(v);
                  setYears(v === "Pre-School" ? ["Pre-School"] : []);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Years</Label>
          <div className="mt-2 flex flex-wrap gap-3">
            {YEARS_BY_STAGE[stage].map((y) => (
              <label key={y} className="flex items-center gap-2 text-sm">
                <Checkbox checked={years.includes(y)} onCheckedChange={() => toggleYear(y)} />
                {y}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Display options</h2>
        <label className="flex items-center justify-between text-sm">
          Featured on homepage
          <Switch checked={featured} onCheckedChange={setFeatured} />
        </label>
        <label className="flex items-center justify-between text-sm">
          Published (visible to the public)
          <Switch checked={published} onCheckedChange={setPublished} />
        </label>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : resource ? "Save changes" : "Add Resource"}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate({ to: "/admin/resources" })}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
