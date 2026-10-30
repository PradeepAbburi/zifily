import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { IdCard, Bookmark, MapPin, MessageSquare, Star, ArrowRight, Share2 } from "lucide-react";
import { Shell, TopBar, Verified, Stars } from "@/components/app-ui";
import { getTrader, traders } from "@/lib/data";
import { actions, useStore } from "@/lib/store";
import { QrShareModal } from "@/components/qr-share-modal";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Saved Cards | Zifily" },
      {
        name: "description",
        content: "View your saved professional cards on Zifily.",
      },
      { property: "og:title", content: "Saved Cards | Zifily" },
      {
        property: "og:description",
        content: "Access your bookmarked specialists and service cards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const navigate = useNavigate();
  const saved = useStore((s) => s.saved);
  const [shareData, setShareData] = useState<{ isOpen: boolean; title: string; url: string }>({
    isOpen: false,
    title: "",
    url: "",
  });

  const savedTraders = saved
    .map((id) => getTrader(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const handleShare = (t: (typeof traders)[number], e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShareData({
      isOpen: true,
      title: `${t.name} — ${t.title}`,
      url: `${window.location.origin}/trader/${t.id}`,
    });
  };

  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-3 sm:px-4 md:px-6 pt-3 md:pt-6 pb-24 md:pb-12 space-y-3.5 w-full max-w-full overflow-x-hidden">
        {/* Mobile-Optimized One-Row Header */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-white/10">
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black tracking-tight text-foreground truncate">
              Saved Cards
            </h1>
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground shrink-0">
            {savedTraders.length} {savedTraders.length === 1 ? "Saved" : "Saved"}
          </span>
        </div>

        {savedTraders.length === 0 ? (
          <div className="my-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-black/15 bg-muted/15 p-8 text-center dark:border-white/15">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted text-foreground mb-3">
              <IdCard className="h-6 w-6 text-foreground" />
            </div>
            <h2 className="text-sm font-bold text-foreground">No saved cards yet</h2>
            <p className="mt-1 max-w-xs text-xs text-muted-foreground">
              Save business and trade cards from specialists to access them instantly here.
            </p>
            <Link
              to="/"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-black/85 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-white/85"
            >
              <span>Explore Specialists</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {savedTraders.map((t) => (
              <div
                key={t.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-black/10 bg-card p-3 transition-all hover:border-black/30 hover:shadow-sm dark:border-white/10 dark:hover:border-white/30"
              >
                {/* Photo with heart button in black */}
                <div className="relative mb-2.5 h-40 w-full overflow-hidden rounded-xl bg-muted">
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Category Pill */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                      {t.category}
                    </span>
                  </div>

                  {/* Top floating actions with solid BLACK HEART */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleShare(t, e)}
                      aria-label="Share specialist card"
                      className="grid h-7 w-7 place-items-center rounded-full bg-white/95 text-black border border-black/10 shadow-sm backdrop-blur transition hover:scale-105 active:scale-90"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                    {/* Card Save button */}
                    <button
                      onClick={() => actions.toggleSaved(t.id)}
                      aria-label="Remove from saved cards"
                      className="grid h-7 w-7 place-items-center rounded-full bg-white text-black border border-black/10 shadow-sm backdrop-blur transition hover:scale-105 active:scale-90 dark:bg-card dark:text-white dark:border-white/10"
                    >
                      <Bookmark className="h-3.5 w-3.5 fill-black text-black dark:fill-white dark:text-white" />
                    </button>
                  </div>

                  {/* Bottom overlay: Rating */}
                  <div className="absolute inset-x-2.5 bottom-2 flex items-center justify-between text-white text-[11px]">
                    <div className="flex items-center gap-1 font-semibold">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{t.rating}</span>
                      <span className="opacity-80">({t.reviews})</span>
                    </div>
                    <span className="text-[10px] opacity-90">{t.distance} km away</span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h3 className="flex items-center gap-1 font-bold text-xs text-foreground truncate">
                      <span className="truncate">{t.name}</span>
                      <Verified />
                    </h3>
                    <span className="text-xs font-bold text-foreground shrink-0">
                      £{t.services[0]?.price ?? 45}/hr
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{t.title}</p>
                </div>

                {/* Card CTA Buttons */}
                <div className="mt-3 flex gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                  <button
                    onClick={() => navigate({ to: "/chat/$id", params: { id: t.id } })}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-black/15 py-1.5 text-xs font-semibold hover:border-black active:scale-95 transition dark:border-white/15 dark:hover:border-white"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>Chat</span>
                  </button>
                  <button
                    onClick={() => navigate({ to: "/trader/$id", params: { id: t.id } })}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-black py-1.5 text-xs font-semibold text-white hover:bg-black/85 active:scale-95 transition dark:bg-white dark:text-black dark:hover:bg-white/85"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <QrShareModal
        isOpen={shareData.isOpen}
        onClose={() => setShareData((s) => ({ ...s, isOpen: false }))}
        title={shareData.title}
        url={shareData.url}
      />
    </Shell>
  );
}
