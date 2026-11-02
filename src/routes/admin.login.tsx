import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [slotsLeft, setSlotsLeft] = useState<number | null>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void (supabase.rpc as any)("admin_slots_left").then(({ data }: { data: number | null }) => {
      if (typeof data === "number") setSlotsLeft(data);
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setBusy(false);
      if (error) {
        toast.error(
          /closed|6 admin|database error/i.test(error.message)
            ? "Admin sign-up is closed — all 6 admin places are taken."
            : error.message,
        );
        return;
      }
      toast.success("Account created. Check your email to confirm, then log in.");
      setMode("login");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error("Incorrect email or password.");
      return;
    }
    void navigate({ to: "/admin" });
  };

  const signupOpen = slotsLeft === null || slotsLeft > 0;

  return (
    <div className="surface-brand flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl bg-card p-7 text-card-foreground shadow-xl"
      >
        <span className="flex size-10 items-center justify-center rounded-xl bg-secondary">
          <Lock className="size-5 text-primary" />
        </span>
        <h1 className="mt-4 text-xl font-semibold">
          {mode === "login" ? "Cyrus Resources Admin" : "Create admin account"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {mode === "signup" && slotsLeft !== null
            ? `${slotsLeft} of 6 admin places left.`
            : "Authorised personnel only."}
        </p>
        <div className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={mode === "signup" ? 8 : undefined}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" className="mt-6 w-full" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Log In" : "Sign Up"}
        </Button>
        {mode === "login" && signupOpen && (
          <button type="button" className="mt-4 w-full text-center text-sm text-primary underline" onClick={() => setMode("signup")}>
            New admin? Create an account
          </button>
        )}
        {mode === "login" && !signupOpen && (
          <p className="mt-4 text-center text-xs text-muted-foreground">Admin sign-up is closed.</p>
        )}
        {mode === "signup" && (
          <button type="button" className="mt-4 w-full text-center text-sm text-primary underline" onClick={() => setMode("login")}>
            Already an admin? Log in
          </button>
        )}
      </form>
    </div>
  );
}
