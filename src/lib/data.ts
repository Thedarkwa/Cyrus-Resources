import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Subject = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
};

export type ResourceType = {
  id: string;
  name: string;
  description: string | null;
};

export type Resource = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  subject_id: string | null;
  resource_type_id: string | null;
  stage: string;
  years: string[];
  thumbnail_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  subject: { name: string } | null;
  resource_type: { name: string } | null;
};

const RESOURCE_SELECT =
  "id, title, description, url, subject_id, resource_type_id, stage, years, thumbnail_url, is_featured, is_published, created_at, subject:subjects(name), resource_type:resource_types(name)";

export const subjectsQuery = queryOptions({
  queryKey: ["subjects"],
  queryFn: async (): Promise<Subject[]> => {
    const { data, error } = await supabase
      .from("subjects")
      .select("id, name, description, is_active")
      .order("name");
    if (error) throw error;
    return data as Subject[];
  },
});

export const resourceTypesQuery = queryOptions({
  queryKey: ["resource_types"],
  queryFn: async (): Promise<ResourceType[]> => {
    const { data, error } = await supabase
      .from("resource_types")
      .select("id, name, description")
      .order("name");
    if (error) throw error;
    return data as ResourceType[];
  },
});

export const publishedResourcesQuery = queryOptions({
  queryKey: ["resources", "published"],
  queryFn: async (): Promise<Resource[]> => {
    const { data, error } = await supabase
      .from("resources")
      .select(RESOURCE_SELECT)
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as Resource[];
  },
});

export const allResourcesQuery = queryOptions({
  queryKey: ["resources", "all"],
  queryFn: async (): Promise<Resource[]> => {
    const { data, error } = await supabase
      .from("resources")
      .select(RESOURCE_SELECT)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as unknown as Resource[];
  },
});

export function resourceQuery(id: string) {
  return queryOptions({
    queryKey: ["resource", id],
    queryFn: async (): Promise<Resource | null> => {
      const { data, error } = await supabase
        .from("resources")
        .select(RESOURCE_SELECT)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Resource | null;
    },
  });
}

export function matchesSearch(resource: Resource, term: string) {
  const q = term.trim().toLowerCase();
  if (!q) return true;
  const haystack = [
    resource.title,
    resource.description ?? "",
    resource.subject?.name ?? "",
    resource.resource_type?.name ?? "",
    resource.stage,
    resource.years.join(" "),
  ]
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((word) => haystack.includes(word));
}
