import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — Cyrus Resources" },
      { name: "description", content: "Authorised personnel only." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Login — Cyrus Resources" },
      { property: "og:description", content: "Authorised personnel only." },
    ],
  }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("Incorrect email or password.");
      return;
    }
    void navigate({ to: "/admin" });
  };

  return (
    <div className="surface-brand flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl bg-card p-7 text-card-foreground shadow-xl"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-secondary">
          <Lock className="size-5 text-primary" />
        </span>
        <h1 className="mt-4 text-xl font-semibold">Cyrus Resources Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">Authorised personnel only.</p>
        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" className="mt-6 w-full" disabled={busy}>
          {busy ? "Logging in…" : "Log In"}
        </Button>
      </form>
    </div>
  );
}
