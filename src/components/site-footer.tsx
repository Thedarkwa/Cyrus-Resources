import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-secondary/40">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="font-display text-xl font-semibold">Cyrus Resources</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          Your school's educational resources, all in one place.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            Home
          </Link>
          <Link to="/resources" className="text-muted-foreground hover:text-foreground">
            Resources
          </Link>
          <Link to="/subjects" className="text-muted-foreground hover:text-foreground">
            Subjects
          </Link>
          <Link to="/academic-levels" className="text-muted-foreground hover:text-foreground">
            Academic Levels
          </Link>
          <Link to="/about" className="text-muted-foreground hover:text-foreground">
            About
          </Link>
          <Link to="/admin" className="text-xs text-muted-foreground/70 hover:text-foreground">
            Admin
          </Link>
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Cyrus Resources
        </p>
      </div>
    </footer>
  );
}
