import { Link, useRouter } from "@tanstack/react-router";
import * as Icons from "lucide-react";
import {
  ArrowLeft,
  ArrowUp,
  CalendarDays,
  Home,
  MessageSquare,
  User,
  Star,
  BadgeCheck,
  Bell,
  Briefcase,
  Building2,
  IdCard,
  Layers,
  FileText,
  BarChart3,
  Search,
  Heart,
  Settings,
  Users,
} from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";

export function DynIcon({ name, className }: { name: string; className?: string }) {
  const I = (Icons as unknown as Record<string, Icons.LucideIcon>)[name] ?? Icons.Wrench;
  return <I className={className} />;
}

// iOS native action / share symbol (Square tray with centered upward arrow)
export function IosShareIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

// Zifily Logo with light and dark theme variations
// Zifily Logo matching PDF Page 1, 2, 56, 58
export function ZifilyLogo({
  className,
  mobileOnly,
}: {
  className?: string;
  mobileOnly?: boolean;
}) {
  return (
    <Link to="/" className={cn("inline-flex items-center gap-2 group select-none", className)}>
      <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#5B4DF5] text-white font-black text-base shadow-sm transition group-hover:scale-105 shrink-0">
        Z
      </div>
      {!mobileOnly && (
        <span className="font-black text-lg tracking-tight text-foreground">Zifly</span>
      )}
    </Link>
  );
}

export const ExperteneLogo = ZifilyLogo;

const clientNav = [
  { to: "/", label: "Discover", icon: Search },
  { to: "/favorites", label: "Zif cards", icon: Heart },
  { to: "/messages", label: "Chats", icon: MessageSquare },
  { to: "/profile", label: "Settings", icon: Settings },
] as const;

const providerNav = [
  { to: "/provider/dashboard", label: "Home", icon: Home },
  { to: "/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/provider/portfolio", label: "Zif cards", icon: Layers },
  { to: "/messages", label: "Chats", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: User },
] as const;

const organizationNav = [
  { to: "/org/dashboard", label: "Overview", icon: Home },
  { to: "/bookings", label: "Bookings", icon: CalendarDays },
  { to: "/messages", label: "Chats", icon: MessageSquare },
  { to: "/provider/analytics", label: "Insights", icon: BarChart3 },
  { to: "/profile", label: "Settings", icon: Settings },
] as const;

export function useScrollDirection() {
  const [hidden, setHidden] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let lastY = typeof window !== "undefined" ? Math.max(0, window.scrollY) : 0;
    let ticking = false;

    const updateScroll = () => {
      const currentY = Math.max(0, window.scrollY);
      const diff = currentY - lastY;

      setIsScrolled(currentY > 30);

      // When near the top of the page, keep navbar visible
      if (currentY <= 15) {
        setHidden(false);
      } else if (diff > 2) {
        // scrolling down -> immediately hide smoothly
        setHidden(true);
      } else if (diff < -2) {
        // scrolling up -> immediately reveal smoothly
        setHidden(false);
      }
      lastY = currentY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { isScrollingDown: hidden, isScrolled };
}

export function Shell({
  children,
  hideNav,
  hideBottomNav,
  noScroll,
  fullWidth,
  fixedBottomNav,
}: {
  children: ReactNode;
  hideNav?: boolean;
  hideBottomNav?: boolean;
  noScroll?: boolean;
  fullWidth?: boolean;
  fixedBottomNav?: boolean;
}) {
  const router = useRouter();
  const currentPath = router.state.location.pathname;
  const userRole = useStore((s) => s.userRole);
  const location = useStore((s) => s.location);
  const activeNav =
    userRole === "organization"
      ? organizationNav
      : userRole === "provider"
        ? providerNav
        : clientNav;

  return (
    <div
      className={cn(
        "min-h-screen bg-background relative flex flex-col",
        noScroll && "h-screen overflow-hidden",
      )}
    >
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 min-w-0 w-full">
        <main
          className={cn(
            fullWidth ? "w-full" : "mx-auto max-w-6xl",
            "px-4 sm:px-6 md:px-8 lg:px-10",
            !hideNav && !hideBottomNav && !noScroll && "pb-32 pt-3 md:pt-6",
            hideBottomNav && !noScroll && "pb-6 md:pb-12 pt-3 md:pt-6",
            noScroll && "h-[100dvh] md:h-screen overflow-hidden flex flex-col",
          )}
        >
          {children}
        </main>
      </div>

      {/* FLOATING CAPSULE BOTTOM NAVIGATION (Expands active tab dynamically just like old, comfortably bigger) */}
      {!hideNav && !hideBottomNav && (
        <div className="fixed bottom-6 inset-x-0 z-40 flex justify-center pointer-events-none px-4">
          <nav
            aria-label="Bottom Navigation"
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-[#0D0D12] p-2 sm:p-2.5 shadow-[0_24px_55px_rgba(0,0,0,0.75)] border border-white/20 backdrop-blur-2xl transition-all duration-300 ease-out"
          >
            {activeNav.map((n) => {
              const isExact =
                n.to === "/" || n.to === "/provider/dashboard" || n.to === "/org/dashboard";
              let isActive = isExact
                ? currentPath === n.to
                : currentPath === n.to || currentPath.startsWith(n.to + "/");

              if (
                n.to === "/provider/portfolio" &&
                (currentPath.startsWith("/provider/case-studies") ||
                  currentPath.startsWith("/provider/case-study-editor") ||
                  currentPath.startsWith("/provider/portfolio"))
              ) {
                isActive = true;
              }

              return (
                <Link
                  key={n.to + n.label}
                  to={n.to}
                  activeOptions={{ exact: isExact }}
                  className={cn(
                    "flex items-center gap-2 transition-all duration-300 ease-out select-none",
                    isActive
                      ? "rounded-full bg-[#5B4DF5] px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm font-black text-white shadow-lg ring-1 ring-white/25"
                      : "rounded-full p-3 sm:p-3.5 text-white/75 hover:text-white hover:bg-white/15 active:scale-95",
                  )}
                  title={n.label}
                >
                  <n.icon className="h-6 w-6 shrink-0" />
                  {isActive && (
                    <span className="text-xs sm:text-sm font-black tracking-wide whitespace-nowrap animate-in fade-in duration-200">
                      {n.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}

export function TopBar({ title, right }: { title: string; right?: ReactNode }) {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-20 grid grid-cols-[40px_1fr_auto] items-center gap-2 bg-background/95 px-4 py-3 backdrop-blur md:static md:px-6 md:pt-6">
      <button
        aria-label="Back"
        onClick={() => router.history.back()}
        className="grid h-10 w-10 place-items-center rounded-full border border-black/10 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>
      <h1 className="truncate text-center text-lg font-bold tracking-tight md:text-left md:text-2xl">
        {title}
      </h1>
      <div className="min-w-10 flex justify-end">{right}</div>
    </div>
  );
}

export function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            size,
            i <= Math.round(value)
              ? "fill-amber-400 text-amber-400"
              : "text-neutral-300 dark:text-neutral-700",
          )}
        />
      ))}
    </span>
  );
}

export const Verified = () => (
  <BadgeCheck className="h-4 w-4 shrink-0 fill-black text-white dark:fill-white dark:text-black" />
);

export function StickyCta({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] dark:border-white/10 md:static md:mt-6 md:border-0 md:bg-transparent md:p-0">
      {children}
    </div>
  );
}

export function PrimaryButton({ className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...p}
      className={cn(
        "flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white transition hover:bg-black/90 active:scale-[0.99] disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-white/90",
        className,
      )}
    />
  );
}
