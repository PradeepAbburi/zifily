import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  PenSquare,
  Filter,
  User,
  ShieldCheck,
  Calendar,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import { Shell, Stars, Verified } from "@/components/app-ui";
import { useStore, actions, getTraderRatingInfo, type DynamicReview } from "@/lib/store";
import { getTrader, traders } from "@/lib/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Client Reviews & Verification | Zifily" },
      {
        name: "description",
        content: "Verified client reviews, transparent star ratings, and authentic feedback on Zifily.",
      },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const router = useRouter();
  const [selectedTraderId, setSelectedTraderId] = useState<string>("james-wilson");
  const [starFilter, setStarFilter] = useState<number | null>(null);

  const t = getTrader(selectedTraderId) || traders[0]!;
  const userReviews = useStore((s) => s.reviews[t.id] || []);
  const reviewedProviders = useStore((s) => s.reviewedProviders);
  const ratingData = getTraderRatingInfo(t.id, t.rating, t.reviews, userReviews);

  const hasReviewed = reviewedProviders.includes(t.id);

  // Combine user-submitted and seed reviews
  const allReviewsList = useMemo(() => {
    const list: {
      id: string;
      name: string;
      rating: number;
      when: string;
      text: string;
      serviceTag?: string;
      verified: boolean;
    }[] = [];

    // User reviews first
    userReviews.forEach((r) => {
      list.push({
        id: r.id,
        name: r.name,
        rating: r.rating,
        when: r.when,
        text: r.text,
        serviceTag: r.serviceTag,
        verified: true,
      });
    });

    // Seed reviews
    t.reviewList.forEach((r, idx) => {
      list.push({
        id: `seed-${idx}`,
        name: r.name,
        rating: r.rating,
        when: r.when,
        text: r.text,
        serviceTag: t.services[idx % t.services.length]?.name,
        verified: true,
      });
    });

    if (starFilter !== null) {
      return list.filter((r) => Math.round(r.rating) === starFilter);
    }

    return list;
  }, [userReviews, t, starFilter]);

  // Star Distribution
  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const total = Math.max(1, ratingData.reviewsCount);
    // Approximation with actual user counts
    counts[5] = Math.round(total * 0.94);
    counts[4] = Math.max(1, Math.round(total * 0.05));
    counts[3] = 1;
    return counts;
  }, [ratingData.reviewsCount]);

  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-3 sm:px-4 md:px-6 pt-3 md:pt-6 pb-24 md:pb-12 space-y-4 w-full max-w-full overflow-x-hidden">
        {/* Mobile-Optimized One-Row Header */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => router.history.back()}
              aria-label="Back"
              className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-xl border border-black/10 hover:bg-muted dark:border-white/10 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-black tracking-tight text-foreground truncate">
                Reviews &amp; Ratings
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/trader/$id"
              params={{ id: t.id }}
              className="rounded-full border border-black/15 px-3 py-1 text-[11px] font-bold hover:border-black dark:border-white/15 dark:hover:border-white"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* Specialist Selector Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {traders.map((trader) => (
            <button
              key={trader.id}
              type="button"
              onClick={() => {
                setSelectedTraderId(trader.id);
                setStarFilter(null);
              }}
              className={cn(
                "flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs font-bold transition shrink-0 active:scale-95",
                selectedTraderId === trader.id
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-2xs"
                  : "border-black/10 bg-card text-muted-foreground hover:border-black/30 dark:border-white/10",
              )}
            >
              <img src={trader.photo} alt="" className="h-5 w-5 rounded-full object-cover" />
              <span>{trader.name}</span>
            </button>
          ))}
        </div>

        {/* Rating Scorecard - Pure Minimalist Black and White */}
        <div className="rounded-3xl border border-black/10 bg-card p-4 sm:p-6 shadow-xs dark:border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-black text-white dark:bg-white dark:text-black shadow-xs shrink-0">
                <span className="text-2xl font-black">{ratingData.rating.toFixed(1)}</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i <= Math.round(ratingData.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-neutral-300 dark:text-neutral-700",
                      )}
                    />
                  ))}
                </div>
                <p className="mt-1 font-black text-sm text-foreground">
                  {ratingData.rating.toFixed(2)} out of 5.0
                </p>
                <p className="text-xs text-muted-foreground">
                  Based on {ratingData.reviewsCount} verified customer ratings
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasReviewed ? (
                <span className="inline-flex items-center gap-1.5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Review Submitted</span>
                </span>
              ) : (
                <Link
                  to="/chat/$id"
                  params={{ id: t.id }}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-black px-4 py-2 text-xs font-bold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black shadow-xs"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Review in Chat</span>
                </Link>
              )}
            </div>
          </div>

          {/* Star Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-black/5 dark:border-white/5 no-scrollbar text-xs">
            <span className="text-[11px] font-bold text-muted-foreground mr-1 shrink-0">Filter:</span>
            <button
              type="button"
              onClick={() => setStarFilter(null)}
              className={cn(
                "rounded-xl px-2.5 py-1 text-[11px] font-bold transition shrink-0",
                starFilter === null
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted",
              )}
            >
              All ({ratingData.reviewsCount})
            </button>
            {[5, 4, 3, 2, 1].map((stars) => (
              <button
                key={stars}
                type="button"
                onClick={() => setStarFilter(starFilter === stars ? null : stars)}
                className={cn(
                  "flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold transition shrink-0",
                  starFilter === stars
                    ? "bg-black text-white dark:bg-white dark:text-black"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted",
                )}
              >
                <span>{stars}</span>
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-foreground">
              Showing {allReviewsList.length} verified {allReviewsList.length === 1 ? "review" : "reviews"}
            </span>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              One-Review Safeguard Active
            </span>
          </div>

          {allReviewsList.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-black/10 bg-card p-4 transition shadow-2xs dark:border-white/10 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-muted text-foreground text-xs font-bold shrink-0">
                    {r.name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-foreground truncate">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.when}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Stars value={r.rating} size="h-3 w-3" />
                  <span className="text-[11px] font-bold text-foreground ml-1">
                    {r.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-foreground/90 leading-relaxed pt-1">{r.text}</p>

              {r.serviceTag && (
                <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Service: <b className="text-foreground">{r.serviceTag}</b></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified Client
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
