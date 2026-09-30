import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="surface-brand">
      <div className="mx-auto max-w-6xl px-4 py-14">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">{eyebrow}</p>
        )}
        <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm opacity-85">{description}</p>}
      </div>
    </div>
  );
}
