import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { hydrateStore } from "@/lib/store";
import { testFirestoreConnection } from "@/lib/firebase";
import { ComicNotFoundCard, ComicErrorCard, ComicOfflineOverlay } from "@/components/comic-system";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return <ComicNotFoundCard />;
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return <ComicErrorCard error={error} onReset={reset} />;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=5" },
      { title: "Expertene — Verified Experts & Digital Specialists" },
      {
        name: "description",
        content:
          "Discover and book vetted web developers, digital marketers, designers, and top trade specialists with seamless provider showcases and location discovery.",
      },
      { property: "og:title", content: "Expertene — Verified Experts & Digital Specialists" },
      {
        property: "og:description",
        content:
          "Discover and book vetted web developers, digital marketers, designers, and top trade specialists with seamless provider showcases and location discovery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { initTheme } from "@/lib/theme";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    hydrateStore();
    testFirestoreConnection();
    const cleanup = initTheme();
    return () => cleanup?.();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
      <ComicOfflineOverlay />
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}
