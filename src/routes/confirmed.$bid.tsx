import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { CalendarDays, Check, Clock, MapPin, MessageSquare, Wrench } from "lucide-react";
import { Shell, TopBar } from "@/components/app-ui";
import { getTrader } from "@/lib/data";
import { fmtDate, timeRange, useStore } from "@/lib/store";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/confirmed/$bid")({
  head: () => ({
    meta: [
      { title: "Booking Confirmed | Zifily" },
      { name: "description", content: "Your booking has been confirmed on Zifily." },
      { property: "og:title", content: "Booking Confirmed | Zifily" },
      { property: "og:description", content: "Your booking has been sent to your specialist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Confirmed,
});

function Confirmed() {
  const { bid } = Route.useParams();
  const b = useStore((s) => s.bookings.find((x) => x.id === bid));

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.5 },
      colors: ["#10b981", "#34d399", "#059669", "#6ee7b7", "#ffffff", "#000000"],
    });
  }, []);

  if (!b)
    return (
      <Shell>
        <TopBar title="Booking" />
        <p className="p-6 text-center text-xs text-muted-foreground">Loading booking...</p>
      </Shell>
    );

  const t = getTrader(b.traderId)!;
  const svc = t.services.find((s) => s.id === b.serviceId);

  return (
    <Shell hideNav>
      <div className="mx-auto max-w-sm px-4 pb-12 pt-2 text-xs">
        <TopBar title="" />
        <div className="text-center pt-2">
          {/* Animated White Tick on Green Circle with Confetti */}
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/25 animate-in zoom-in-75 duration-300">
            <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-25 pointer-events-none" />
            <svg
              className="h-12 w-12 text-white drop-shadow-sm"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h1 className="mt-3.5 text-base sm:text-lg font-black tracking-tight text-foreground">
            {b.status === "Pending" ? "Booking Request Submitted" : "Booking Confirmed"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
            Your appointment request has been dispatched to{" "}
            <span className="font-bold text-foreground">{t.name}</span> in direct chat. The
            specialist can review and accept or decline.
          </p>
        </div>

        {/* Compact Summary Card */}
        <div className="mt-4 space-y-2 rounded-2xl border border-black/10 bg-card p-3 shadow-2xs dark:border-white/10 text-xs">
          <div className="flex items-center gap-2 font-bold text-foreground pb-1.5 border-b border-black/5 dark:border-white/5">
            <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate">{svc?.name}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span className="text-foreground font-semibold">{fmtDate(b.date)}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span className="text-foreground font-semibold">{timeRange(b.time)}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="text-foreground font-medium truncate">{b.address}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-2.5">
          <Link
            to="/messages"
            search={{ trader: t.id }}
            className="flex h-13 sm:h-14 items-center justify-center gap-2 rounded-2xl bg-black py-2 text-sm font-bold text-white hover:bg-black/85 active:scale-[0.99] transition shadow-md dark:bg-white dark:text-black"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Open Direct Chat</span>
          </Link>

          <Link
            to="/bookings"
            className="flex h-12 sm:h-13 items-center justify-center rounded-2xl border border-black/15 py-2 text-xs sm:text-sm font-semibold hover:bg-muted active:scale-[0.99] transition dark:border-white/15 dark:hover:border-white"
          >
            View All Bookings
          </Link>
        </div>
      </div>
    </Shell>
  );
}
