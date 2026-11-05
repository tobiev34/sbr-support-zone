import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import sbrLogo from "@/assets/abc123.png";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-extrabold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-dim">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-volt brick-btn px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-dim">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-volt brick-btn px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-panel brick-btn px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-volt/60"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SBR Studio" },
      {
        name: "description",
        content:
          "SBR Studio — appeal a ban, contact support, report hackers, and read the latest game updates.",
      },
      { property: "og:title", content: "SBR Studio" },
      {
        property: "og:description",
        content:
          "SBR Studio — appeal a ban, contact support, report hackers, and read the latest game updates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Russo+One&family=Source+Sans+3:wght@400;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-[3px] border-edge bg-panel">
      <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6 py-4">
        <nav className="hidden items-center gap-7 font-mono text-[11px] uppercase tracking-[0.08em] text-dim md:flex">
          <Link to="/" className="transition-colors hover:text-volt" activeProps={{ className: "text-foreground" }}>
            Home
          </Link>
          <Link to="/support" className="transition-colors hover:text-volt" activeProps={{ className: "text-foreground" }}>
            Support
          </Link>
          <Link to="/updates" className="transition-colors hover:text-volt" activeProps={{ className: "text-foreground" }}>
            Updates
          </Link>
          <Link to="/credits" className="transition-colors hover:text-volt" activeProps={{ className: "text-foreground" }}>
            Credits
          </Link>
        </nav>
        <div className="justify-self-end md:hidden" />

        <Link to="/" className="flex items-center gap-3 justify-self-center">
          <img
            src={sbrLogo}
            alt="SBR Studios logo"
            className="size-10 rounded-lg"
          />
          <span className="font-display text-lg font-bold tracking-tight">
            SBR<span className="text-volt">.</span>studio
          </span>
        </Link>

        <Link
          to="/appeal"
          className="justify-self-end rounded-lg bg-panel brick-btn px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-volt/60 hover:text-volt"
        >
          Appeal a ban
        </Link>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t-[3px] border-edge bg-panel">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-dim">
          © 2026 SBR Studio · all matches logged
        </span>
        <div className="flex gap-6 font-mono text-[11px] uppercase tracking-[0.06em] text-dim">
          <Link to="/appeal" className="transition-colors hover:text-volt">
            Appeal
          </Link>
          <Link to="/support" className="transition-colors hover:text-volt">
            Support
          </Link>
          <Link to="/report" className="transition-colors hover:text-volt">
            Report
          </Link>
          <Link to="/credits" className="transition-colors hover:text-volt">
            Credits
          </Link>
        </div>
      </div>
    </footer>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="relative min-h-screen font-body text-foreground">
        <SiteHeader />
        <Outlet />
        <SiteFooter />
      </div>
      <Toaster theme="dark" position="bottom-right" />
    </QueryClientProvider>
  );
}
