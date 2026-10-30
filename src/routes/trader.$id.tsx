import { createFileRoute, Link, notFound, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Heart,
  IdCard,
  Home,
  Images,
  Layers,
  MapPin,
  Search,
  ShieldCheck,
  Star,
  ThumbsUp,
  Wrench,
  MessageSquare,
  BookOpen,
  Building2,
  X,
  Sparkles,
  PenSquare,
} from "lucide-react";
import {
  DynIcon,
  PrimaryButton,
  Shell,
  Stars,
  StickyCta,
  Verified,
  IosShareIcon,
  useScrollDirection,
} from "@/components/app-ui";
import { boilerImg, getTrader, type Trader } from "@/lib/data";
import {
  actions,
  useStore,
  getTraderRatingInfo,
  type PortfolioProject,
  type DynamicReview,
} from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { QrShareModal } from "@/components/qr-share-modal";
import { ProjectArticleView } from "@/components/project-article-view";

type Tab = "overview" | "services" | "portfolio" | "reviews";

export const Route = createFileRoute("/trader/$id")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab | undefined } => ({
    tab: (["overview", "services", "portfolio", "reviews"].includes(s["tab"] as string)
      ? s["tab"]
      : undefined) as Tab | undefined,
  }),
  loader: ({ params }) => {
    const t = getTrader(params.id);
    if (!t) throw notFound();
    return { name: t.name, title: t.title };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.name} — ${loaderData.title} | Zifily`
          : "Expert Profile | Zifily",
      },
      {
        name: "description",
        content: loaderData
          ? `Book ${loaderData.name}, ${loaderData.title}, on Zifily.`
          : "Expert profile",
      },
      { property: "og:title", content: loaderData ? `${loaderData.name} on Zifily` : "Expert" },
      {
        property: "og:description",
        content: "View services, verified portfolio and book directly.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TraderPage,
});

function TraderPage() {
  const { id } = Route.useParams();
  const { tab = "overview" } = Route.useSearch();
  const t = getTrader(id)!;
  const router = useRouter();
  const navigate = useNavigate();
  const saved = useStore((s) => s.saved.includes(id));
  const providerCustomization = useStore((s) => s.providerCustomization);
  const allReviews = useStore((s) => s.reviews);
  const userReviews = useMemo(() => allReviews[id] || [], [allReviews, id]);
  const reviewedProviders = useStore((s) => s.reviewedProviders);
  const hasReviewed = useMemo(() => reviewedProviders?.includes(id), [reviewedProviders, id]);
  const organizations = useStore((s) => s.organizations);
  const profile = useStore((s) => s.profile);
  const ratingData = getTraderRatingInfo(t.id, t.rating, t.reviews, userReviews);
  const affiliatedOrg = organizations.find((o) => o.memberTraderIds.includes(t.id));
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [currentTab, setCurrentTab] = useState<Tab>(tab);

  useEffect(() => {
    if (tab) {
      setCurrentTab(tab);
    }
  }, [tab]);

  const handleSelectTab = (newTab: Tab, e?: React.MouseEvent) => {
    e?.preventDefault();
    setCurrentTab(newTab);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", newTab);
      window.history.replaceState(null, "", url.toString());
    } catch {
      // ignore
    }
  };

  const [shareData, setShareData] = useState<{
    isOpen: boolean;
    title: string;
    subtitle?: string;
    url: string;
  }>({
    isOpen: false,
    title: "",
    subtitle: "",
    url: "",
  });

  const { isScrollingDown } = useScrollDirection();

  const isDigitalOrCreative = [
    "Web Developer",
    "Web Designer",
    "Graphic Designer",
    "UI/UX Designer",
    "Digital Marketing",
    "SEO Specialist",
    "Mobile App Dev",
    "AI & Automation",
  ].includes(t.category);

  const tabs: { key: Tab; label: string; icon: typeof Home }[] = [
    { key: "overview", label: "Overview", icon: Home },
    { key: "services", label: "Services", icon: Wrench },
    {
      key: "portfolio",
      label: isDigitalOrCreative ? "Portfolio" : "Gallery",
      icon: isDigitalOrCreative ? Layers : Images,
    },
    { key: "reviews", label: "Reviews", icon: Star },
  ];

  const handleOpenShare = (title: string, subtitle?: string, customUrl?: string) => {
    setShareData({
      isOpen: true,
      title,
      subtitle,
      url: customUrl || window.location.href,
    });
  };

  return (
    <Shell hideNav hideBottomNav>
      {/* MOBILE TOP CONTROLS: Back, Share, and Fav - Always accessible with crisp monochrome styling */}
      <div className="fixed top-0 inset-x-0 z-40 bg-gradient-to-b from-black/40 via-black/10 to-transparent p-3 md:hidden pointer-events-auto">
        <div className="flex items-center justify-between">
          {/* Back button */}
          <button
            type="button"
            onClick={() => router.history.back()}
            aria-label="Back"
            className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white/95 text-black shadow-md backdrop-blur-md transition hover:bg-white active:scale-95 dark:border-white/15 dark:bg-[#282828]/95 dark:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2">
            {/* Share button */}
            <button
              type="button"
              aria-label="Share Expert Profile"
              onClick={() => handleOpenShare(`${t.name} • ${t.title}`, `Book ${t.name} on Zifily`)}
              className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white/95 text-black shadow-md backdrop-blur-md transition hover:bg-white active:scale-95 dark:border-white/15 dark:bg-[#282828]/95 dark:text-white"
            >
              <IosShareIcon className="h-4 w-4" />
            </button>

            {/* Favorite button */}
            <button
              type="button"
              aria-label="Save Specialist"
              onClick={() => {
                actions.toggleSaved(id);
                toast.success(saved ? "Removed from saved" : "Saved to cards ❤️");
              }}
              className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white/95 text-black shadow-md backdrop-blur-md transition hover:bg-white active:scale-95 dark:border-white/15 dark:bg-[#282828]/95 dark:text-white"
            >
              <Heart
                className={cn(
                  "h-4 w-4 transition",
                  saved
                    ? "fill-black text-black dark:fill-white dark:text-white"
                    : "text-black dark:text-white",
                )}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-0 md:pt-6 md:grid md:grid-cols-[340px_1fr] lg:grid-cols-[380px_1fr] md:gap-8 md:px-6">
        {/* LEFT COLUMN: Profile Details - Side Profile with Back, Fav and Share controls */}
        <div className="md:sticky md:top-20 md:self-start md:h-fit md:overflow-visible">
          {/* Side Profile Controls for Desktop & Tablet: Back, Fav, Share */}
          <div className="hidden md:flex items-center justify-between pb-3">
            <button
              type="button"
              onClick={() => router.history.back()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-black/10 bg-card px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted active:scale-95 transition shadow-2xs dark:border-white/10"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  actions.toggleSaved(id);
                  toast.success(saved ? "Removed from saved" : "Saved to cards ❤️");
                }}
                title={saved ? "Saved" : "Save Specialist"}
                className="grid h-8 w-8 place-items-center rounded-xl border border-black/10 bg-card text-foreground hover:bg-muted active:scale-95 transition shadow-2xs dark:border-white/10"
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition",
                    saved
                      ? "fill-black text-black dark:fill-white dark:text-white"
                      : "text-foreground",
                  )}
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleOpenShare(`${t.name} • ${t.title}`, `Book ${t.name} on Zifily`)
                }
                title="Share Specialist Profile"
                className="grid h-8 w-8 place-items-center rounded-xl border border-black/10 bg-card text-foreground hover:bg-muted active:scale-95 transition shadow-2xs dark:border-white/10"
              >
                <IosShareIcon className="h-4 w-4 text-foreground" />
              </button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-none md:rounded-2xl">
            <img
              src={t.photo}
              alt={t.name}
              width={816}
              height={816}
              className="h-72 w-full object-cover rounded-none md:h-52 lg:h-56 md:rounded-2xl border-b md:border border-black/10 dark:border-white/10 shadow-xs"
            />
          </div>

          <div className="relative -mt-6 rounded-t-3xl bg-background px-4 pt-4 md:mt-3 md:px-0 md:bg-transparent">
            <h1 className="flex items-center gap-1.5 text-xl font-black tracking-tight">
              {t.name}
              <Verified />
            </h1>
            <p className="text-xs font-medium text-muted-foreground mt-0.5">{t.title}</p>

            <div className="mt-2 flex items-center gap-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleSelectTab("reviews")}
                className="flex items-center gap-1 hover:underline text-left"
              >
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <b className="text-foreground">{ratingData.rating.toFixed(2)}</b>
                <span className="text-muted-foreground">({ratingData.reviewsCount} reviews)</span>
              </button>
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {t.distance} miles away
              </span>
            </div>

            {affiliatedOrg && (
              <div className="mt-2.5 flex items-center gap-2 rounded-xl border border-black/10 bg-muted/40 px-3 py-1.5 dark:border-white/10">
                <Building2 className="h-4 w-4 shrink-0 text-foreground" />
                <div className="text-[11px] leading-tight">
                  <span className="font-bold text-foreground">{affiliatedOrg.name}</span>
                  <span className="text-muted-foreground ml-1.5">• Verified Member Specialist</span>
                </div>
              </div>
            )}

            <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
              <span className="flex items-center gap-1.5 rounded-full border border-black/15 bg-muted/40 px-2.5 py-0.5 font-semibold dark:border-white/15">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Available Today
              </span>
              <span className="flex items-center gap-1 rounded-full border border-black/15 px-2.5 py-0.5 dark:border-white/15">
                <ShieldCheck className="h-3.5 w-3.5" />
                Zifily Verified
              </span>
              <span className="flex items-center gap-1 rounded-full border border-black/15 px-2.5 py-0.5 dark:border-white/15">
                <Star className="h-3.5 w-3.5" />
                {t.years}+ yrs experience
              </span>
            </div>

            {/* Desktop Action Buttons: Book This Expert & Message ONLY */}
            <div className="mt-4 hidden md:flex md:flex-col gap-2">
              <PrimaryButton onClick={() => navigate({ to: "/book/$id", params: { id } })}>
                Book This Expert
              </PrimaryButton>
              <Link
                to="/chat/$id"
                params={{ id }}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-black/15 bg-background text-xs font-bold text-foreground transition hover:bg-muted active:scale-[0.99] dark:border-white/15"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Message</span>
              </Link>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Details & Classic Button Tab Navigation */}
        <div className="px-4 pb-24 md:px-0 md:pb-12">
          {/* Classic Button Tabs (Keeps position smooth and displays in-place without page jumping) */}
          <div className="mt-5 flex flex-wrap gap-2 md:mt-0">
            {tabs.map((tabItem) => {
              const isActive = currentTab === tabItem.key;
              return (
                <button
                  key={tabItem.key}
                  type="button"
                  onClick={() => handleSelectTab(tabItem.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition active:scale-95 border shadow-2xs",
                    isActive
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-black/15 bg-background text-muted-foreground hover:border-black/40 hover:text-foreground dark:border-white/15 dark:hover:border-white/40",
                  )}
                >
                  <tabItem.icon className="h-3.5 w-3.5" />
                  <span>{tabItem.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab View */}
          <div className="mt-6 animate-in fade-in duration-200 transition-opacity">
            {currentTab === "overview" && <Overview t={t} />}
            {currentTab === "services" && (
              <Services
                t={t}
                onShareService={(s) =>
                  handleOpenShare(
                    `${t.name} — ${s.name}`,
                    s.desc,
                    `${window.location.origin}/trader/${t.id}?service=${s.id}`,
                  )
                }
              />
            )}
            {currentTab === "portfolio" && (
              <PortfolioSection
                t={t}
                isDigital={isDigitalOrCreative}
                projects={providerCustomization.projects}
                onSelectProject={(project) => setSelectedProject(project)}
              />
            )}
            {currentTab === "reviews" && (
              <Reviews
                t={t}
                ratingData={ratingData}
                userReviews={userReviews}
                hasReviewed={hasReviewed}
                onOpenReviewModal={() => {
                  if (hasReviewed) {
                    toast.info("You have already submitted a review for this specialist.");
                    return;
                  }
                  setShowReviewModal(true);
                }}
              />
            )}
          </div>
        </div>

        {/* Sticky Mobile Bar: Strictly Message + Book This Expert - Hides on scroll down, shows on scroll up */}
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-background/95 p-3.5 pb-[calc(0.875rem+env(safe-area-inset-bottom))] backdrop-blur transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform dark:border-white/10 md:hidden",
            isScrollingDown
              ? "translate-y-full pointer-events-none"
              : "translate-y-0 pointer-events-auto",
          )}
        >
          <div className="mx-auto flex max-w-lg items-center gap-2.5">
            <Link
              to="/chat/$id"
              params={{ id }}
              className="flex h-12 w-14 shrink-0 items-center justify-center rounded-xl border border-black/15 bg-background text-foreground transition hover:bg-muted active:scale-95 dark:border-white/15"
              title="Message"
            >
              <MessageSquare className="h-5 w-5" />
            </Link>
            <PrimaryButton
              onClick={() => navigate({ to: "/book/$id", params: { id } })}
              className="flex-1 text-xs font-bold"
            >
              Book This Expert
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* Global QR Share Modal with black exp logo centered */}
      <QrShareModal
        isOpen={shareData.isOpen}
        onClose={() => setShareData({ ...shareData, isOpen: false })}
        title={shareData.title}
        subtitle={shareData.subtitle}
        url={shareData.url}
      />

      {/* Write a Review Modal */}
      <WriteReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        traderName={t.name}
        traderId={t.id}
        services={t.services}
        defaultName={profile.name}
      />

      {/* Dedicated Portfolio Project Article Reader View */}
      {selectedProject && (
        <ProjectArticleView
          project={selectedProject}
          traderName={t.name}
          traderId={t.id}
          onClose={() => setSelectedProject(null)}
          onBook={() => {
            setSelectedProject(null);
            navigate({ to: "/book/$id", params: { id: t.id } });
          }}
          onShare={() => {
            handleOpenShare(
              `${selectedProject.title} by ${t.name}`,
              selectedProject.description,
              window.location.href,
            );
          }}
        />
      )}
    </Shell>
  );
}

function Overview({ t }: { t: Trader }) {
  return (
    <div className="space-y-6 text-xs sm:text-sm">
      <div>
        <h2 className="text-base font-bold tracking-tight">Professional Biography</h2>
        <p className="mt-2 text-muted-foreground leading-relaxed">{t.about}</p>
      </div>

      <div className="border-t border-black/10 pt-5 dark:border-white/10">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Verified Credentials & Badges
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {t.badges.map((b) => (
            <li
              key={b}
              className="flex items-center gap-2 rounded-xl border border-black/10 bg-muted/20 p-2.5 font-medium dark:border-white/10"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 fill-black text-white dark:fill-white dark:text-black" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Services({
  t,
  onShareService,
}: {
  t: Trader;
  onShareService: (s: (typeof t.services)[0]) => void;
}) {
  const [q, setQ] = useState("");
  const list = t.services.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <label className="flex h-11 items-center gap-2 rounded-xl border border-black/10 bg-muted/30 px-3.5 text-xs dark:border-white/10">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search this expert's services..."
          className="w-full bg-transparent outline-none"
        />
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {list.map((s) => (
          <div
            key={s.id}
            className="flex flex-col justify-between rounded-2xl border border-black/10 p-3.5 transition hover:border-black dark:border-white/10 dark:hover:border-white"
          >
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted">
                <DynIcon name={s.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-xs">{s.name}</p>
                <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">{s.desc}</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-black/10 pt-2.5 dark:border-white/10">
              <span className="font-bold text-xs">{s.price}</span>
              <div className="flex items-center gap-1.5">
                {/* iOS Share Button for specific service */}
                <button
                  type="button"
                  onClick={() => onShareService(s)}
                  title="Share Service QR"
                  className="grid h-8 w-8 place-items-center rounded-full border border-black/10 hover:border-black active:scale-95 dark:border-white/10 dark:hover:border-white"
                >
                  <IosShareIcon className="h-3.5 w-3.5" />
                </button>
                <Link
                  to="/book/$id"
                  params={{ id: t.id }}
                  search={{ service: s.id }}
                  className="rounded-lg bg-black px-3 py-1.5 text-[11px] font-semibold text-white dark:bg-white dark:text-black"
                >
                  Select
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortfolioSection({
  t,
  isDigital,
  projects,
  onSelectProject,
}: {
  t: Trader;
  isDigital: boolean;
  projects: PortfolioProject[];
  onSelectProject: (p: PortfolioProject) => void;
}) {
  if (isDigital) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-tight">Featured Case Studies & Work</h2>
          <span className="text-[11px] text-muted-foreground">Click to read full article</span>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2">
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProject(p)}
              className="group cursor-pointer rounded-2xl border border-black/10 bg-card p-4 transition hover:border-black hover:shadow-xs active:scale-[0.99] dark:border-white/10 dark:hover:border-white"
            >
              {p.banner && (
                <div className="mb-3 overflow-hidden rounded-xl">
                  <img
                    src={p.banner}
                    alt={p.title}
                    className="h-32 w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="rounded-md border border-black/10 bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider dark:border-white/10">
                  {p.tag}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-foreground group-hover:underline">
                  <span>Read Article</span>
                  <ExternalLink className="h-3 w-3" />
                </span>
              </div>
              <h3 className="mt-2 text-xs font-bold sm:text-sm group-hover:text-foreground">
                {p.title}
              </h3>
              <p className="mt-1 text-[11px] text-muted-foreground">{p.client}</p>
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{p.description}</p>
              {p.metrics && (
                <div className="mt-3 rounded-lg border border-black/10 bg-muted/40 px-2.5 py-1 text-[11px] font-semibold text-foreground dark:border-white/10">
                  {p.metrics}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Physical trades: gallery cards that open comprehensive case-study articles when clicked
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-tight">Completed Projects & Transformations</h2>
        <span className="text-[11px] text-muted-foreground">Click any project to read article</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {t.gallery.map((g, i) => {
          const galleryProject: PortfolioProject = {
            id: `gallery-${t.id}-${i}`,
            title: `${g.label} Project Showcase`,
            client: `Verified Client (${t.category})`,
            description: `Full bespoke execution and verified trade installation for ${g.label.toLowerCase()}. Carried out according to strict UK building regulations and safety standards.`,
            tag: g.tag,
            banner: boilerImg,
            date: "Recently Completed",
            metrics: "100% Client Satisfaction • All Safety Certifications Issued",
            challenge: `The client presented severe operational inefficiencies and wear-and-tear requiring certified expertise, exact safety compliance, and rapid turnaround.`,
            solution: `Carried out complete diagnostics, stripped out obsolete components, installed premium commercial-grade parts, and pressure-tested the completed installation.`,
            deliverables: [
              `Complete ${g.label} installation and testing`,
              "Full compliance documentation and guarantee",
              "Disposal of old parts and site cleanup",
              "Post-installation maintenance advisory",
            ],
          };

          return (
            <div
              key={i}
              onClick={() => onSelectProject(galleryProject)}
              className="group cursor-pointer overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 transition hover:border-black active:scale-95"
            >
              <div className="relative aspect-square">
                <img
                  src={boilerImg}
                  alt={g.label}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-3 flex flex-col justify-end text-white">
                  <span className="rounded bg-white/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider w-fit mb-1 backdrop-blur-xs">
                    {g.tag}
                  </span>
                  <span className="text-xs font-bold leading-tight">{g.label}</span>
                  <span className="text-[10px] text-white/80 mt-0.5 flex items-center gap-1">
                    Read Article →
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Reviews({
  t,
  ratingData,
  userReviews,
  hasReviewed,
  onOpenReviewModal,
}: {
  t: Trader;
  ratingData: { rating: number; reviewsCount: number };
  userReviews: DynamicReview[];
  hasReviewed?: boolean;
  onOpenReviewModal: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Dynamic Star Rating Score Card */}
      <div className="rounded-3xl border border-black/10 bg-card p-4 sm:p-5 shadow-xs dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-black text-white dark:bg-white dark:text-black shadow-xs">
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
              <p className="mt-1 font-bold text-xs text-foreground">
                Average Rating: {ratingData.rating.toFixed(2)} out of 5
              </p>
              <p className="text-[11px] text-muted-foreground">
                Based on {ratingData.reviewsCount} verified client reviews
              </p>
            </div>
          </div>

          {hasReviewed ? (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Review Submitted</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenReviewModal}
              className="flex items-center justify-center gap-2 rounded-2xl bg-black px-4 py-2.5 text-xs font-bold text-white transition hover:bg-black/85 active:scale-95 dark:bg-white dark:text-black shadow-xs"
            >
              <PenSquare className="h-4 w-4" />
              <span>Leave a Review</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-1">
        <h2 className="text-xs font-bold tracking-tight uppercase text-muted-foreground">
          Client Feedback &amp; Verification
        </h2>
        <span className="text-xs font-semibold text-muted-foreground">
          {ratingData.reviewsCount} Total Reviews
        </span>
      </div>

      <div
        className="max-h-[580px] overflow-y-auto no-scrollbar scroll-smooth space-y-3 pr-0.5"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {/* User-submitted reviews first */}
        {userReviews.map((r) => (
          <div
            key={r.id}
            className="rounded-2xl border border-black/15 bg-card p-4 shadow-xs dark:border-white/15 ring-1 ring-black/5 dark:ring-white/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-xs font-extrabold text-foreground">{r.name}</p>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified Client
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">{r.when}</span>
            </div>

            <div className="mt-1.5 flex items-center justify-between">
              <Stars value={r.rating} size="h-3.5 w-3.5" />
              {r.serviceTag && (
                <span className="rounded-md border border-black/10 bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground dark:border-white/10">
                  {r.serviceTag}
                </span>
              )}
            </div>

            <p className="mt-2.5 text-xs text-foreground/90 leading-relaxed">{r.text}</p>
          </div>
        ))}

        {/* Existing Seed Reviews */}
        {t.reviewList.map((r, i) => (
          <div
            key={`seed-${i}`}
            className="rounded-2xl border border-black/10 bg-card p-3.5 shadow-2xs dark:border-white/10"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold">{r.name}</p>
              <span className="text-[11px] text-muted-foreground">{r.when}</span>
            </div>
            <div className="mt-1 flex items-center gap-1">
              <Stars value={r.rating} size="h-3 w-3" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WriteReviewModal({
  isOpen,
  onClose,
  traderName,
  traderId,
  services,
  defaultName,
}: {
  isOpen: boolean;
  onClose: () => void;
  traderName: string;
  traderId: string;
  services: { id: string; name: string }[];
  defaultName: string;
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [name, setName] = useState(defaultName || "Client Member");
  const [serviceTag, setServiceTag] = useState(services[0]?.name || "General Service");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error("Please write a few words about your experience");
      return;
    }
    setSubmitting(true);
    actions.addReview(traderId, {
      name: name.trim() || "Client",
      rating,
      text: text.trim(),
      serviceTag,
    });
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    toast.success("Thank you! Your verified review has been published.");
    setSubmitting(false);
    onClose();
  };

  const ratingLabels = [
    "",
    "Poor (1/5)",
    "Fair (2/5)",
    "Good (3/5)",
    "Very Good (4/5)",
    "Outstanding (5/5)",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div
        className="w-full max-w-md rounded-3xl border border-black/10 bg-background p-5 sm:p-6 shadow-2xl dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b pb-3 border-black/10 dark:border-white/10">
          <div>
            <h3 className="font-black text-sm sm:text-base text-foreground">
              Rate &amp; Review {traderName}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Leave genuine client feedback for the specialist
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Interactive Star Rating Selector */}
          <div className="rounded-2xl border border-black/10 bg-muted/20 p-4 text-center dark:border-white/10">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Select Your Rating
            </span>
            <div className="mt-2.5 flex justify-center items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating ?? rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-115 active:scale-95"
                    aria-label={`${star} Stars`}
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        active
                          ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                          : "text-neutral-300 dark:text-neutral-700",
                      )}
                    />
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs font-extrabold text-foreground">
              {ratingLabels[hoverRating ?? rating]}
            </p>
          </div>

          {/* Reviewer Name */}
          <div>
            <label className="text-[11px] font-bold text-foreground">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Vance"
              className="mt-1 h-10 w-full rounded-xl border border-black/15 bg-muted/20 px-3 text-xs font-medium outline-none focus:border-black dark:border-white/15 dark:focus:border-white"
            />
          </div>

          {/* Service Tag */}
          <div>
            <label className="text-[11px] font-bold text-foreground">Service Performed</label>
            <select
              value={serviceTag}
              onChange={(e) => setServiceTag(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-black/15 bg-muted/20 px-2.5 text-xs font-medium outline-none focus:border-black dark:border-white/15 dark:focus:border-white"
            >
              {services.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
              <option value="Custom Project Consultation">Custom Project Consultation</option>
            </select>
          </div>

          {/* Review Feedback Text */}
          <div>
            <label className="text-[11px] font-bold text-foreground">
              Your Review &amp; Experience
            </label>
            <textarea
              rows={4}
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share details of the specialist's work quality, punctuality, and responsiveness..."
              className="mt-1 w-full rounded-xl border border-black/15 bg-muted/20 p-2.5 text-xs outline-none focus:border-black dark:border-white/15"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-black font-bold text-xs text-white transition hover:bg-black/90 active:scale-[0.99] disabled:opacity-50 dark:bg-white dark:text-black shadow-md"
          >
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>Publish Verified Client Review</span>
          </button>
        </form>
      </div>
    </div>
  );
}
