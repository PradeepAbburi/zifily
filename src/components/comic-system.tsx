import { useState, useEffect } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { WifiOff, RotateCcw, Home, AlertCircle, ArrowLeft } from "lucide-react";
import { ZifilyLogo } from "@/components/app-ui";

/**
 * Minimalist Loading Indicator
 */
export function BlinkingLogoLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 select-none">
      <div className="flex flex-col items-center gap-3">
        <ZifilyLogo mobileOnly />
        <div className="flex items-center gap-2 mt-2">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-ping" />
          <span className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Minimalist Offline Takeover
 */
export function ComicOfflineOverlay() {
  const [mounted, setMounted] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (!navigator.onLine) {
      setIsOffline(true);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      if (navigator.onLine) {
        setIsOffline(false);
      }
      setIsRetrying(false);
    }, 1000);
  };

  if (!mounted || !isOffline) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-sm rounded-3xl border border-black/15 bg-background p-6 text-center text-foreground shadow-2xl dark:border-white/15">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-black/10 bg-muted/40 dark:border-white/10">
          <WifiOff className="h-5 w-5 text-foreground" />
        </div>

        <h3 className="mt-4 text-sm font-black uppercase tracking-wider text-foreground">
          No Internet Connection
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Please check your mobile data or Wi-Fi settings to continue using Zifily.
        </p>

        <div className="mt-5">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isRetrying}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-2.5 text-xs font-bold text-white transition hover:bg-neutral-800 active:scale-95 disabled:opacity-50 dark:bg-white dark:text-black"
          >
            <RotateCcw className={`h-3.5 w-3.5 ${isRetrying ? "animate-spin" : ""}`} />
            <span>{isRetrying ? "Checking..." : "Retry Connection"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Minimalist Black & White 404 Not Found Page
 */
export function ComicNotFoundCard() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-black/10 bg-card p-8 text-center text-foreground shadow-sm dark:border-white/10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-black/10 bg-muted/40 dark:border-white/10 font-black text-lg">
          404
        </div>

        <h1 className="mt-4 text-xl font-black tracking-tight text-foreground">Page Not Found</h1>
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
          The requested page does not exist or may have been moved. Let's get you back to the
          directory.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link
            to="/"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-black px-5 py-2.5 text-xs font-bold text-white transition hover:bg-neutral-800 active:scale-95 dark:bg-white dark:text-black"
          >
            <Home className="h-4 w-4" />
            <span>Return to Explore</span>
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-black/15 bg-background px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted active:scale-95 transition dark:border-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Minimalist Black & White Error Boundary Page
 */
export function ComicErrorCard({ error, onReset }: { error: unknown; onReset: () => void }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border border-black/10 bg-card p-8 text-center text-foreground shadow-sm dark:border-white/10">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-black/10 bg-muted/40 text-foreground dark:border-white/10">
          <AlertCircle className="h-5 w-5" />
        </div>

        <h1 className="mt-4 text-xl font-black tracking-tight text-foreground">
          Something Went Wrong
        </h1>
        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
          An unexpected error occurred while loading this view. You can reload the state or head
          back home.
        </p>

        {error instanceof Error && error.message && (
          <div className="mt-4 rounded-xl border border-black/5 bg-muted/40 p-2.5 text-[11px] text-muted-foreground font-mono text-left truncate max-h-16 overflow-hidden dark:border-white/5">
            {error.message}
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              router.invalidate();
              onReset();
            }}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-black px-5 py-2.5 text-xs font-bold text-white transition hover:bg-neutral-800 active:scale-95 dark:bg-white dark:text-black"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reload Page</span>
          </button>
          <a
            href="/"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-black/15 bg-background px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted active:scale-95 transition dark:border-white/15"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Go Home</span>
          </a>
        </div>
      </div>
    </div>
  );
}
