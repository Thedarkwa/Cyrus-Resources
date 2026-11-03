import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import logoAsset from "@/assets/cyrus-logo.png.asset.json";

const NAV = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/resources", label: "Resources" },
  { to: "/admin/resources/new", label: "Add Resource" },
  { to: "/admin/categories", label: "Categories" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const { session, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!loading && !session) void navigate({ to: "/admin/login", replace: true });
  }, [loading, session, navigate]);

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/admin/login", replace: true });
  };

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Checking access…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-xl font-semibold">Not authorised</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This account is not one of the Cyrus Resources administrators.
          </p>
          <Button className="mt-6" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="surface-brand">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/admin" className="flex items-center gap-2 font-display font-semibold">
            <img
              src={logoAsset.url}
              alt="Cyrus Resources Admin"
              className="h-9 w-auto rounded-md bg-white px-2 py-1"
            />
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/" className="opacity-80 hover:opacity-100">
              View site
            </Link>
            <Button size="sm" variant="secondary" onClick={signOut}>
              <LogOut className="size-4" /> Log out
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: true }}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm opacity-80 hover:opacity-100"
              activeProps={{ className: "bg-white/15 opacity-100" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
