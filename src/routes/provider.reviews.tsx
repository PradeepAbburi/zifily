import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Star, CheckCircle2, MessageSquare, Send, CornerDownRight, Filter } from "lucide-react";
import { Shell } from "@/components/app-ui";
import { useStore, actions, getTraderRatingInfo, fmtDate, type DynamicReview } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/provider/reviews")({
  head: () => ({
    meta: [
      { title: "Client Reviews & Ratings | Zifly" },
      {
        name: "description",
        content: "Verified reviews, client testimonials and rating performance on Zifly.",
      },
    ],
  }),
  component: ProviderReviewsPage,
});

const SEEDED_PRO_REVIEWS: DynamicReview[] = [
  {
    id: "rev-1",
    author: "Nisha Patel",
    rating: 5,
    text: "Arjun was phenomenal! The strategy call gave our startup clear direction on architecture, technology choices, and launch timeline. Highly recommend.",
    date: "2026-10-27",
    serviceTag: "Strategy call",
    verifiedBooking: true,
    reply: "Thank you Nisha! It was a pleasure discussing your vision for the studio platform.",
    repliedAt: "2026-10-27",
  },
  {
    id: "rev-2",
    author: "Vikram Rao",
    rating: 5,
    text: "Clean code, outstanding speed. The website audit identified all critical performance bottlenecks within 24 hours.",
    date: "2026-10-24",
    serviceTag: "Website audit",
    verifiedBooking: true,
  },
  {
    id: "rev-3",
    author: "Priya Nair",
    rating: 5,
    text: "Super professional and punctual. Delivered our 5-page studio portfolio ahead of deadline with zero bugs.",
    date: "2026-10-18",
    serviceTag: "5-page website",
    verifiedBooking: true,
    reply: "Appreciate the feedback Priya, best of luck with the gallery launch!",
    repliedAt: "2026-10-19",
  },
  {
    id: "rev-4",
    author: "Ramesh Kumar",
    rating: 4,
    text: "Great communication and very skilled developer. Looking forward to our next project together.",
    date: "2026-10-10",
    serviceTag: "Monthly support",
    verifiedBooking: true,
  },
  {
    id: "rev-5",
    author: "Sneha Reddy",
    rating: 5,
    text: "Top-tier developer on Zifly. Solved our responsive layout and checkout bugs in one session.",
    date: "2026-09-29",
    serviceTag: "Website audit",
    verifiedBooking: true,
  },
];

export function ProviderReviewsPage() {
  const allReviews = useStore((s) => s.reviews);
  const userDynamicReviews = useMemo(() => allReviews["james-wilson"] || [], [allReviews]);

  // Combine seeded pro reviews with any dynamically submitted user reviews
  const [reviewsList, setReviewsList] = useState<DynamicReview[]>([
    ...userDynamicReviews,
    ...SEEDED_PRO_REVIEWS,
  ]);

  const [activeFilter, setActiveFilter] = useState<"all" | "5" | "4" | "replied">("all");
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const filteredReviews = useMemo(() => {
    if (activeFilter === "5") return reviewsList.filter((r) => r.rating === 5);
    if (activeFilter === "4") return reviewsList.filter((r) => r.rating === 4);
    if (activeFilter === "replied") return reviewsList.filter((r) => Boolean(r.reply));
    return reviewsList;
  }, [reviewsList, activeFilter]);

  const handlePostReply = (reviewId: string) => {
    if (!replyText.trim()) return;
    const nowIso = new Date().toISOString().slice(0, 10);
    setReviewsList((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, reply: replyText.trim(), repliedAt: nowIso } : r,
      ),
    );
    toast.success("Public reply posted to review");
    setReplyText("");
    setReplyingReviewId(null);
  };

  return (
    <Shell>
      <div className="mx-auto max-w-lg px-3 sm:px-4 pt-2 md:pt-6 pb-36 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Reviews</h1>
          <p className="text-xs text-muted-foreground">
            Verified ratings and feedback from your clients
          </p>
        </div>

        {/* Rating Scorecard matching Zifly design */}
        <div className="rounded-3xl border border-black/10 bg-card p-5 shadow-xs dark:border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#5B4DF5] text-white shadow-sm shrink-0">
                <span className="text-3xl font-black">4.9</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="font-extrabold text-sm text-foreground mt-1">Exceptional Rating</p>
                <p className="text-xs text-muted-foreground">
                  Based on 212 verified client reviews
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> 98% Happy
              </span>
            </div>
          </div>

          {/* Breakdown bars */}
          <div className="space-y-1.5 pt-2 border-t border-black/5 dark:border-white/5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-8 font-semibold text-[11px] text-muted-foreground">5 star</span>
              <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full w-[92%]" />
              </div>
              <span className="w-8 text-right font-bold text-[11px]">92%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 font-semibold text-[11px] text-muted-foreground">4 star</span>
              <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full w-[6%]" />
              </div>
              <span className="w-8 text-right font-bold text-[11px]">6%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 font-semibold text-[11px] text-muted-foreground">3 star</span>
              <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full w-[2%]" />
              </div>
              <span className="w-8 text-right font-bold text-[11px]">2%</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 whitespace-nowrap",
              activeFilter === "all"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            All ({reviewsList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("5")}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 whitespace-nowrap flex items-center gap-1",
              activeFilter === "5"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 5 Stars
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("4")}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 whitespace-nowrap flex items-center gap-1",
              activeFilter === "4"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4 Stars
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("replied")}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 whitespace-nowrap",
              activeFilter === "replied"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            With Reply
          </button>
        </div>

        {/* Reviews List */}
        <div className="space-y-3.5">
          {filteredReviews.map((rev) => {
            const initials = rev.author
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            const isReplying = replyingReviewId === rev.id;

            return (
              <div
                key={rev.id}
                className="rounded-3xl border border-black/10 bg-card p-4 sm:p-5 shadow-xs dark:border-white/10 space-y-3"
              >
                {/* Reviewer Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1A1A24] text-white font-extrabold text-xs shadow-xs">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="font-bold text-xs sm:text-sm text-foreground">{rev.author}</p>
                        {rev.verifiedBooking && (
                          <span
                            title="Verified Client Booking"
                            className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold"
                          >
                            <CheckCircle2 className="h-3 w-3 fill-emerald-500/20" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {rev.serviceTag || "Service Booking"} · {fmtDate(rev.date)}
                      </p>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={cn(
                          "h-3.5 w-3.5",
                          s <= rev.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-neutral-300 dark:text-neutral-700",
                        )}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs text-foreground leading-relaxed">&ldquo;{rev.text}&rdquo;</p>

                {/* Provider Reply Display if exists */}
                {rev.reply && (
                  <div className="rounded-2xl bg-muted/40 p-3.5 border border-black/5 dark:border-white/5 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#5B4DF5]">
                      <CornerDownRight className="h-3.5 w-3.5" />
                      <span>Your Response</span>
                      {rev.repliedAt && (
                        <span className="text-[10px] text-muted-foreground font-normal">
                          · {fmtDate(rev.repliedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground italic pl-5">{rev.reply}</p>
                  </div>
                )}

                {/* Reply Form or Trigger */}
                {!rev.reply && (
                  <div>
                    {isReplying ? (
                      <div className="space-y-2 pt-2 border-t border-black/5 dark:border-white/5">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder={`Write a public reply to ${rev.author}...`}
                          className="w-full rounded-2xl border border-black/15 bg-background p-3 text-xs outline-none focus:border-[#5B4DF5] dark:border-white/15"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingReviewId(null);
                              setReplyText("");
                            }}
                            className="rounded-xl border border-black/15 px-3 py-1.5 text-xs font-bold hover:bg-muted"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePostReply(rev.id)}
                            className="flex items-center gap-1.5 rounded-xl bg-[#5B4DF5] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#4F46E5]"
                          >
                            <Send className="h-3 w-3" />
                            <span>Post Reply</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingReviewId(rev.id);
                            setReplyText("");
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold text-[#5B4DF5] hover:underline"
                        >
                          <MessageSquare className="h-3 w-3" />
                          <span>Reply to review</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
