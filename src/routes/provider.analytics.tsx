import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  ArrowLeft,
  TrendingUp,
  BarChart3,
  Calendar,
  Star,
  Clock,
  CheckCircle2,
  Phone,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { Shell } from "@/components/app-ui";
import { useStore, actions, getTraderRatingInfo } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/provider/analytics")({
  head: () => ({
    meta: [
      { title: "Insights & Performance Analytics | Zifily Provider" },
      {
        name: "description",
        content:
          "Track your booking volume, revenue metrics, client ratings, and performance trends.",
      },
    ],
  }),
  component: ProviderAnalyticsPage,
});

type TimeRange = "7 days" | "30 days" | "90 days";

export function ProviderAnalyticsPage() {
  const router = useRouter();
  const bookings = useStore((s) => s.bookings);
  const allReviews = useStore((s) => s.reviews);
  const userRole = useStore((s) => s.userRole);

  useEffect(() => {
    if (userRole !== "provider") {
      actions.setUserRole("provider");
    }
  }, [userRole]);

  const [range, setRange] = useState<TimeRange>("30 days");

  const reviews = useMemo(() => allReviews["james-wilson"] || [], [allReviews]);
  const ratingInfo = useMemo(
    () => getTraderRatingInfo("james-wilson", 4.9, 212, reviews),
    [reviews],
  );

  // Weekly bar breakdown matching PDF Page 53
  const weeklyData = [
    { label: "W1", height: 55, count: 18 },
    { label: "W2", height: 70, count: 24 },
    { label: "W3", height: 60, count: 20 },
    { label: "W4", height: 100, count: 34, active: true },
  ];

  return (
    <Shell hideBottomNav>
      <div className="mx-auto max-w-md md:max-w-xl pb-16 pt-2 md:pt-6 px-3 sm:px-4 space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3 border-b pb-4">
          <button
            type="button"
            onClick={() => router.history.back()}
            className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-background shadow-xs hover:bg-muted active:scale-95 transition dark:border-white/10"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Insights
            </h1>
            <p className="text-xs text-muted-foreground">
              Performance, bookings and rating metrics
            </p>
          </div>
        </div>

        {/* Time range selector pills matching PDF Page 53 */}
        <div className="flex rounded-2xl bg-muted/40 p-1 border border-black/5 dark:border-white/5">
          {(["7 days", "30 days", "90 days"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "flex-1 rounded-xl py-2 text-xs font-bold transition active:scale-95",
                range === r
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {/* 4 Metric KPI Cards matching PDF Page 53 & 58 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-black/10 bg-card p-4 shadow-xs dark:border-white/10">
            <p className="text-xs font-semibold text-muted-foreground">Bookings</p>
            <p className="mt-1 text-3xl font-black text-foreground">142</p>
            <p className="mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              +14% vs last period
            </p>
          </div>

          <div className="rounded-3xl border border-black/10 bg-card p-4 shadow-xs dark:border-white/10">
            <p className="text-xs font-semibold text-muted-foreground">Completed</p>
            <p className="mt-1 text-3xl font-black text-foreground">94%</p>
            <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
              On-time appointment rate
            </p>
          </div>

          <div className="rounded-3xl border border-black/10 bg-card p-4 shadow-xs dark:border-white/10">
            <p className="text-xs font-semibold text-muted-foreground">Earnings this week</p>
            <p className="mt-1 text-3xl font-black text-foreground">₹18,400</p>
            <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
              Direct client payments
            </p>
          </div>

          <div className="rounded-3xl border border-black/10 bg-card p-4 shadow-xs dark:border-white/10">
            <p className="text-xs font-semibold text-muted-foreground">Avg rating</p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-3xl font-black text-foreground">
                {ratingInfo.rating.toFixed(1)}
              </span>
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            </div>
            <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
              {ratingInfo.reviewsCount} verified reviews
            </p>
          </div>
        </div>

        {/* Bookings per week bar chart matching PDF Page 53 */}
        <div className="rounded-3xl border border-black/10 bg-card p-5 shadow-xs dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Bookings per week</h2>
            <span className="text-xs font-semibold text-muted-foreground">Volume trend</span>
          </div>

          <div className="flex items-end justify-between gap-3 pt-6 pb-2 h-44 px-4">
            {weeklyData.map((d) => (
              <div
                key={d.label}
                className="flex flex-1 flex-col items-center gap-2 h-full justify-end"
              >
                <span className="text-[10px] font-bold text-muted-foreground">{d.count}</span>
                <div
                  style={{ height: `${d.height}%` }}
                  className={cn(
                    "w-full rounded-2xl transition-all duration-500",
                    d.active
                      ? "bg-[#5B4DF5] shadow-sm"
                      : "bg-[#EEF0FF] dark:bg-indigo-950/60 hover:bg-[#5B4DF5]/80",
                  )}
                />
                <span className="text-xs font-bold text-muted-foreground">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Client Reviews summary */}
        <div className="rounded-3xl border border-black/10 bg-card p-5 shadow-xs dark:border-white/10 space-y-3.5">
          <div className="flex items-center justify-between border-b pb-3 border-black/5 dark:border-white/5">
            <h2 className="text-sm font-bold text-foreground">Verified Client Feedback</h2>
            <Link
              to="/provider/calendar"
              className="text-xs font-bold text-[#5B4DF5] hover:underline"
            >
              View Schedule &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {reviews.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-black/10 bg-muted/20 p-3.5 space-y-1.5 dark:border-white/10"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{r.name}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-black">{r.rating}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{r.text}</p>
                <span className="text-[10px] font-semibold text-muted-foreground/80 block">
                  {r.when} • Verified Booking
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
