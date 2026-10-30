import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Bell,
  ChevronDown,
  Check,
  Heart,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import {
  Shell,
  DynIcon,
  Verified,
  ZifilyLogo,
  IosShareIcon,
  useScrollDirection,
} from "@/components/app-ui";
import { categories, traders, type Trader } from "@/lib/data";
import { actions, useStore, getTraderRatingInfo } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { QrShareModal } from "@/components/qr-share-modal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zifily — Verified Experts & Digital Specialists" },
      {
        name: "description",
        content:
          "Discover top digital marketers, web developers, graphic designers, dry cleaners, and trusted trade specialists near you.",
      },
      { property: "og:title", content: "Zifily — Verified Experts & Digital Specialists" },
      {
        property: "og:description",
        content: "Discover vetted web developers, digital marketers, designers and specialists.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

type SortOption = "recommended" | "rating" | "reviews" | "distance";

function HomePage() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [cat, setCat] = useState<string | null>(null);
  const [categoryPage, setCategoryPage] = useState(0);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [onlyAvailableToday, setOnlyAvailableToday] = useState(false);
  const [onlyTopRated, setOnlyTopRated] = useState(false);
  const { isScrollingDown, isScrolled } = useScrollDirection();
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [shareData, setShareData] = useState<{ isOpen: boolean; title: string; url: string }>({
    isOpen: false,
    title: "",
    url: "",
  });

  const saved = useStore((s) => s.saved);
  const location = useStore((s) => s.location);
  const userRole = useStore((s) => s.userRole);
  const reviews = useStore((s) => s.reviews);
  const organizations = useStore((s) => s.organizations);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [showAllCategoriesModal, setShowAllCategoriesModal] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");

  const [showMobileSearch, setShowMobileSearch] = useState(false);

  // Group the 40 categories into sections/pages of 10 (2 rows of 5 per page)
  const itemsPerPage = 10;
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const pages = useMemo(() => {
    type CategoryItem = (typeof categories)[number];
    const list: CategoryItem[][] = [];
    for (let i = 0; i < categories.length; i += itemsPerPage) {
      list.push(categories.slice(i, i + itemsPerPage) as unknown as CategoryItem[]);
    }
    return list;
  }, []);

  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const goToPage = (idx: number) => {
    const targetIdx = Math.max(0, Math.min(totalPages - 1, idx));
    setCategoryPage(targetIdx);
    if (carouselRef.current) {
      const targetLeft = targetIdx * carouselRef.current.clientWidth;
      carouselRef.current.scrollTo({ left: targetLeft, behavior: "smooth" });
    }
  };

  const handleCarouselScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (!el.clientWidth) return;
    const page = Math.round(el.scrollLeft / el.clientWidth);
    if (page !== categoryPage && page >= 0 && page < totalPages) {
      setCategoryPage(page);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0 && categoryPage < totalPages - 1) {
        goToPage(categoryPage + 1);
      } else if (deltaX > 0 && categoryPage > 0) {
        goToPage(categoryPage - 1);
      }
    }
    touchStartX.current = null;
  };

  const filteredAllCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [categorySearch]);

  // Autocomplete / Recommended results based on typing
  const searchRecommendations = useMemo(() => {
    if (!q.trim()) return [];
    const query = q.toLowerCase();

    const matchedCats = categories
      .filter((c) => c.name.toLowerCase().includes(query))
      .slice(0, 3)
      .map((c) => ({ type: "category" as const, title: c.name, icon: c.icon }));

    const matchedServices = traders
      .flatMap((t) => t.services.map((s) => ({ ...s, traderName: t.name, traderId: t.id })))
      .filter((s) => s.name.toLowerCase().includes(query))
      .slice(0, 4)
      .map((s) => ({
        type: "service" as const,
        title: s.name,
        subtitle: `By ${s.traderName} • ${s.price}`,
        icon: s.icon,
        traderId: s.traderId,
      }));

    const matchedTraders = traders
      .filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.title.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query),
      )
      .slice(0, 3)
      .map((t) => ({
        type: "expert" as const,
        title: t.name,
        subtitle: `${t.title} • ★ ${t.rating}`,
        icon: "User",
        traderId: t.id,
      }));

    return [...matchedCats, ...matchedServices, ...matchedTraders].slice(0, 6);
  }, [q]);

  // Filter & Sort Experts
  const list = useMemo(() => {
    return traders
      .filter((t) => {
        const matchesCategory =
          !cat ||
          t.category.toLowerCase() === cat.toLowerCase() ||
          (cat === "Web Designer" && t.category === "UI/UX Designer") ||
          (cat === "House Cleaning" && t.category === "Deep Cleaning") ||
          (cat === "Heating & Boiler" && t.category === "Plumbing");

        const matchesQuery =
          q === "" ||
          (t.name + t.title + t.category + t.services.map((s) => s.name).join(" "))
            .toLowerCase()
            .includes(q.toLowerCase());

        const matchesAvailable = !onlyAvailableToday || true;
        const matchesRating = !onlyTopRated || t.rating >= 4.9;

        return matchesCategory && matchesQuery && matchesAvailable && matchesRating;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "reviews") return b.reviews - a.reviews;
        if (sortBy === "distance") return a.distance - b.distance;
        return 0;
      });
  }, [cat, q, onlyAvailableToday, onlyTopRated, sortBy]);

  const handleShareTrader = (t: Trader, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShareData({
      isOpen: true,
      title: `${t.name} — ${t.title}`,
      url: `${window.location.origin}/trader/${t.id}`,
    });
  };

  const resetAllFilters = () => {
    setCat(null);
    setQ("");
    setSortBy("recommended");
    setOnlyAvailableToday(false);
    setOnlyTopRated(false);
    setShowFilterModal(false);
    toast.success("Filters reset");
  };

  return (
    <Shell>
      <div className="px-4 pt-3 md:px-6 md:pt-6">
        {/* FIXED NAVBAR: Permanently fixed on mobile and desktop */}
        <div className="sticky top-0 z-30 -mx-4 px-4 md:-mx-6 md:px-6 bg-background/95 backdrop-blur-md pt-2 pb-2.5 border-b border-black/5 dark:border-white/5">
          {/* Mobile Header: Logo in the middle, Search Icon on the right corner */}
          <div className="relative flex h-10 items-center justify-between pb-1 md:hidden">
            <Link
              to="/notifications"
              aria-label="Alerts"
              className="grid h-8 w-8 place-items-center rounded-full border border-black/10 hover:bg-muted dark:border-white/10"
            >
              <Bell className="h-3.5 w-3.5" />
            </Link>

            {/* EXACTLY IN MIDDLE */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <ZifilyLogo mobileOnly={true} />
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/provider/dashboard"
                title="Provider Dashboard"
                className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-muted/40 px-2.5 py-1 text-[10px] font-bold text-foreground hover:bg-muted dark:border-white/10"
              >
                <span>Pro Hub</span>
              </Link>

              {/* Search Toggle Icon on Right Corner: Toggles search bar with filters under navbar */}
              <button
                type="button"
                aria-label="Search & Filters"
                onClick={() => setShowMobileSearch((prev) => !prev)}
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-full border transition active:scale-95 shadow-2xs",
                  showMobileSearch
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-black/15 bg-background text-foreground hover:bg-muted dark:border-white/15",
                )}
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Search Bar with Predictive Autocomplete & Functional Filter Trigger: ONLY SHOWN WHEN SEARCH BUTTON CLICKED ON MOBILE, ALWAYS VISIBLE ON DESKTOP */}
          <div
            className={cn(
              "transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
              showMobileSearch
                ? "max-h-96 opacity-100 mt-2 mb-1 overflow-visible"
                : "max-h-0 opacity-0 overflow-hidden md:max-h-none md:opacity-100 md:mt-2 md:mb-1 md:overflow-visible",
            )}
          >
            <div className="relative">
              <div className="flex gap-2">
                <label className="flex h-11 flex-1 items-center gap-2 rounded-2xl border border-black/15 bg-muted/30 px-3.5 transition focus-within:border-black focus-within:bg-background dark:border-white/15 dark:focus-within:border-white">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    ref={searchInputRef}
                    value={q}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setIsSearchFocused(true);
                    }}
                    placeholder="Search web developers, dry cleaning, marketing, designers..."
                    className="w-full bg-transparent text-xs font-medium outline-none placeholder:text-muted-foreground"
                  />
                  {q && (
                    <button
                      onClick={() => {
                        setQ("");
                        setIsSearchFocused(false);
                      }}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </label>

                {/* Functional Filter Trigger */}
                <button
                  aria-label="Filter options"
                  onClick={() => setShowFilterModal(true)}
                  title="Open Filters"
                  className={cn(
                    "relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl border transition active:scale-95",
                    sortBy !== "recommended" || onlyTopRated || onlyAvailableToday
                      ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                      : "border-black/15 bg-background hover:border-black dark:border-white/15 dark:hover:border-white",
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  {(sortBy !== "recommended" || onlyTopRated || onlyAvailableToday) && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-400" />
                  )}
                </button>
              </div>

              {/* Predictive Recommended Suggestions Dropdown */}
              {isSearchFocused && q.trim().length > 0 && searchRecommendations.length > 0 && (
                <div className="absolute inset-x-0 top-13 z-40 rounded-2xl border border-black/10 bg-background p-2 shadow-2xl dark:border-white/10 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Recommended Results
                  </div>
                  <div className="space-y-1">
                    {searchRecommendations.map((item, idx) => (
                      <button
                        key={idx}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          if (item.type === "category") {
                            setCat(item.title);
                            setQ("");
                          } else if (item.traderId) {
                            navigate({ to: "/trader/$id", params: { id: item.traderId } });
                          } else {
                            setQ(item.title);
                          }
                          setIsSearchFocused(false);
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition hover:bg-muted"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="grid h-7 w-7 place-items-center rounded-lg bg-muted text-foreground">
                            <DynIcon name={item.icon} className="h-3.5 w-3.5" />
                          </span>
                          <div className="truncate">
                            <p className="font-semibold">{item.title}</p>
                            {"subtitle" in item && (
                              <p className="text-[10px] text-muted-foreground">{item.subtitle}</p>
                            )}
                          </div>
                        </div>
                        <span className="rounded-md border border-black/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-muted-foreground dark:border-white/10">
                          {item.type}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location Selector: Shown NORMALLY */}
          <div className="flex items-center justify-between py-1 mt-1 border-t border-black/5 dark:border-white/5">
            <Link
              to="/location"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground/90 transition hover:text-foreground group py-0.5"
            >
              <MapPin className="h-3.5 w-3.5 text-foreground shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-xs underline decoration-muted-foreground/30 underline-offset-4 group-hover:decoration-foreground">
                {location.address}
              </span>
              <span className="text-[11px] font-normal text-muted-foreground">
                • {location.radiusKm}km
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-foreground" />
            </Link>

            {userRole === "provider" && (
              <Link
                to="/provider/dashboard"
                className="text-xs font-bold text-foreground hover:underline hidden sm:inline-block"
              >
                Provider Hub &rarr;
              </Link>
            )}
            {userRole === "organization" && (
              <Link
                to="/org/dashboard"
                className="text-xs font-bold text-foreground hover:underline hidden sm:inline-block"
              >
                Organization Hub &rarr;
              </Link>
            )}
          </div>

          {/* CATEGORIES SECTION: SHOWN NORMALLY THERE */}
          <div className="mt-2.5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsCategoriesDropdownOpen((prev) => !prev)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold transition active:scale-95 shadow-2xs select-none",
                cat
                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                  : isCategoriesDropdownOpen
                    ? "border-black/40 bg-muted text-foreground"
                    : "border-black/15 bg-card text-foreground hover:bg-muted hover:border-black/35 dark:border-white/15",
              )}
            >
              <SlidersHorizontal className="h-3 w-3 shrink-0" />
              <span>{cat ? `Category: ${cat}` : "Categories"}</span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform duration-200 shrink-0",
                  isCategoriesDropdownOpen && "rotate-180",
                )}
              />
            </button>

            {cat ? (
              <button
                type="button"
                onClick={() => setCat(null)}
                className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
              >
                <span>Reset filter</span>
                <X className="h-3 w-3" />
              </button>
            ) : (
              <span className="text-[10px] text-muted-foreground">
                {isCategoriesDropdownOpen ? "Tap to close" : "Tap to browse (40)"}
              </span>
            )}
          </div>

          {/* KEEP ALL CATEGORIES HIDDEN UNTIL DROPDOWN TOGGLED */}
          {isCategoriesDropdownOpen && (
            <div className="mt-3 rounded-2xl border border-black/10 bg-card p-3 shadow-xl dark:border-white/10 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">Categories ({categories.length})</span>
                  <span className="text-[10px] text-muted-foreground">
                    Section {categoryPage + 1} of {totalPages}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    disabled={categoryPage === 0}
                    onClick={() => goToPage(categoryPage - 1)}
                    aria-label="Previous"
                    className="grid h-6 w-6 place-items-center rounded-full border border-black/10 disabled:opacity-30 hover:border-black"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <button
                    disabled={categoryPage === totalPages - 1}
                    onClick={() => goToPage(categoryPage + 1)}
                    aria-label="Next"
                    className="grid h-6 w-6 place-items-center rounded-full border border-black/10 disabled:opacity-30 hover:border-black"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setIsCategoriesDropdownOpen(false)}
                    aria-label="Close"
                    className="grid h-6 w-6 place-items-center rounded-full border border-black/10 text-muted-foreground hover:text-foreground ml-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* SWIPEABLE CAROUSEL: SECTION-BY-SECTION */}
              <div
                ref={carouselRef}
                onScroll={handleCarouselScroll}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="mt-2.5 flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
                style={{
                  scrollSnapType: "x mandatory",
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {pages.map((sectionCategories, pageIdx) => (
                  <div key={pageIdx} className="w-full shrink-0 snap-center snap-always px-0.5">
                    <div className="grid grid-rows-2 grid-cols-5 gap-y-3 gap-x-2 select-none py-1">
                      {sectionCategories.map((c) => {
                        const isMore = c.name === "More";
                        const isSelected = cat === c.name;
                        return (
                          <div key={c.name} className="flex flex-col items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (isMore) {
                                  setShowAllCategoriesModal(true);
                                } else {
                                  setCat(isSelected ? null : c.name);
                                  setIsCategoriesDropdownOpen(false);
                                }
                              }}
                              aria-label={c.name}
                              className={cn(
                                "grid h-12 w-12 sm:h-13 sm:w-13 place-items-center rounded-2xl transition-all select-none",
                                "border shadow-xs active:translate-y-[2px] active:shadow-none",
                                isSelected
                                  ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-md"
                                  : isMore
                                    ? "border-black/25 bg-muted/70 text-foreground hover:bg-muted dark:border-white/25"
                                    : "border-black/15 bg-card text-foreground hover:bg-muted/40 hover:border-black/35 dark:border-white/15",
                              )}
                            >
                              <DynIcon name={c.icon} className="h-4.5 w-4.5" />
                            </button>
                            <span
                              className={cn(
                                "truncate max-w-[58px] sm:max-w-[65px] text-[10px] tracking-tight text-center select-none leading-tight",
                                isSelected
                                  ? "font-bold text-foreground"
                                  : "font-medium text-muted-foreground",
                              )}
                            >
                              {c.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* DOTS PAGINATION FOR SECTIONS */}
              <div className="mt-2.5 flex justify-center items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => goToPage(idx)}
                    aria-label={`Go to category section ${idx + 1}`}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      categoryPage === idx
                        ? "w-5 bg-black dark:bg-white"
                        : "w-1.5 bg-black/20 hover:bg-black/40 dark:bg-white/20 dark:hover:bg-white/40",
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results Header */}
        <div className="mt-7 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight md:text-lg">
              {cat ? `${cat} Specialists` : "Featured Professionals & Experts"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Showing {list.length} available expert{list.length === 1 ? "" : "s"}
            </p>
          </div>
          {(cat || q || sortBy !== "recommended" || onlyTopRated) && (
            <button
              onClick={resetAllFilters}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Expert Cards Grid */}
        <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 pb-8">
          {list.map((t) => {
            const ratingData = getTraderRatingInfo(t.id, t.rating, t.reviews, reviews[t.id]);
            const affiliatedOrg = organizations.find((o) => o.memberTraderIds.includes(t.id));

            return (
              <div
                key={t.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-black/10 bg-card p-3.5 sm:p-4 transition-all hover:border-black hover:shadow-lg dark:border-white/10 dark:hover:border-white shadow-xs"
              >
                <div>
                  <Link
                    to="/trader/$id"
                    params={{ id: t.id }}
                    className="flex items-start gap-3 sm:gap-3.5"
                  >
                    <img
                      src={t.photo}
                      alt={t.name}
                      loading="lazy"
                      width={400}
                      height={400}
                      className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-2xl object-cover border border-black/5 dark:border-white/5"
                    />
                    <div className="min-w-0 flex-1 py-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="truncate font-bold text-sm sm:text-base text-foreground">
                          {t.name}
                        </span>
                        <Verified />
                      </div>
                      <p className="truncate text-xs font-medium text-muted-foreground mt-0.5">
                        {t.title}
                      </p>
                      {/* Gold Star with Dynamic Average Rating */}
                      <div className="mt-1.5 flex items-center gap-1 text-xs font-semibold">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        <b>{ratingData.rating.toFixed(2)}</b>
                        <span className="text-[11px] text-muted-foreground">
                          ({ratingData.reviewsCount})
                        </span>
                      </div>
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{t.distance} miles away</span>
                      </p>
                      {affiliatedOrg && (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-bold text-foreground">
                          🏛️ {affiliatedOrg.name.split(" ")[0]} Guild
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Service tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {t.services.slice(0, 2).map((s) => (
                      <span
                        key={s.id}
                        className="rounded-lg border border-black/10 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:border-white/10"
                      >
                        {s.name}
                      </span>
                    ))}
                    {t.services.length > 2 && (
                      <span className="rounded-lg border border-black/10 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground dark:border-white/10">
                        +{t.services.length - 2} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions with iOS Share Button */}
                <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-black/10 pt-3 dark:border-white/10">
                  <span className="text-xs sm:text-sm font-bold text-foreground truncate">
                    {t.services[0]?.price ?? "Custom Quote"}
                  </span>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      aria-label={`Share ${t.name} with iOS share sheet`}
                      onClick={(e) => handleShareTrader(t, e)}
                      title="Share Profile & QR"
                      className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-black/15 bg-background shadow-xs transition hover:border-black hover:bg-muted active:scale-95 dark:border-white/15 dark:hover:border-white"
                    >
                      <IosShareIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>

                    <button
                      aria-label="Save to favorites"
                      onClick={() => actions.toggleSaved(t.id)}
                      className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full border border-black/15 transition hover:border-black active:scale-95 dark:border-white/15 dark:hover:border-white"
                    >
                      <Heart
                        className={cn(
                          "h-3.5 w-3.5 sm:h-4 sm:w-4",
                          saved.includes(t.id) &&
                            "fill-black text-black dark:fill-white dark:text-white",
                        )}
                      />
                    </button>

                    <Link
                      to="/book/$id"
                      params={{ id: t.id }}
                      className="rounded-xl bg-black px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white transition hover:bg-black/90 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-white/90"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}

          {list.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <p className="text-sm font-semibold">No specialists match your criteria.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Try expanding your search radius or clearing active filters.
              </p>
              <button
                onClick={resetAllFilters}
                className="mt-4 rounded-xl border border-black/20 px-4 py-2 text-xs font-semibold hover:border-black dark:border-white/20 dark:hover:border-white"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Filter Modal / Drawer */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-md rounded-3xl border border-black/10 bg-background p-6 shadow-2xl dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <h3 className="font-bold text-base">Filter & Sort</h3>
              </div>
              <button
                onClick={() => setShowFilterModal(false)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-5 text-xs">
              {/* Sort By */}
              <div>
                <label className="font-bold uppercase tracking-wider text-muted-foreground">
                  Sort By
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    { id: "recommended", label: "Recommended" },
                    { id: "rating", label: "Highest Rated (5.0)" },
                    { id: "reviews", label: "Most Reviews" },
                    { id: "distance", label: "Nearest Distance" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSortBy(s.id as SortOption)}
                      className={cn(
                        "rounded-xl border p-2.5 font-medium transition text-left",
                        sortBy === s.id
                          ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                          : "border-black/10 hover:border-black/40 dark:border-white/10 dark:hover:border-white/40",
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 border-t pt-4">
                <label className="flex items-center justify-between cursor-pointer py-1">
                  <div>
                    <p className="font-bold">Top Rated Specialists Only</p>
                    <p className="text-[11px] text-muted-foreground">Rating 4.9 and above</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={onlyTopRated}
                    onChange={(e) => setOnlyTopRated(e.target.checked)}
                    className="h-4 w-4 accent-black dark:accent-white"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-1">
                  <div>
                    <p className="font-bold">Available for Booking</p>
                    <p className="text-[11px] text-muted-foreground">
                      Accepting appointments today
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={onlyAvailableToday}
                    onChange={(e) => setOnlyAvailableToday(e.target.checked)}
                    className="h-4 w-4 accent-black dark:accent-white"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 border-t pt-4">
                <button
                  onClick={resetAllFilters}
                  className="flex-1 rounded-xl border border-black/15 py-3 font-semibold hover:border-black dark:border-white/15 dark:hover:border-white"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 rounded-xl bg-black py-3 font-semibold text-white dark:bg-white dark:text-black"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All UK Categories Modal (Triggered by 'More') */}
      {showAllCategoriesModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs animate-in fade-in">
          <div
            className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-black/10 bg-background p-6 shadow-2xl dark:border-white/10 max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-base">All UK Service Categories</h3>
                <p className="text-xs text-muted-foreground">
                  Browse {categories.length} verified trade, cleaning and digital specialisms
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAllCategoriesModal(false);
                  setCategorySearch("");
                }}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
                aria-label="Close categories"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-3">
              <label className="flex h-11 items-center gap-2 rounded-xl border border-black/15 bg-muted/30 px-3 text-xs">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter categories (e.g. Gas, Man with a Van, Web...)"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full bg-transparent font-medium outline-none placeholder:text-muted-foreground"
                />
                {categorySearch && (
                  <button onClick={() => setCategorySearch("")} className="text-muted-foreground">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </label>
            </div>

            <div className="overflow-y-auto no-scrollbar flex-1 grid grid-cols-2 gap-2 py-1">
              {filteredAllCategories
                .filter((c) => c.name !== "More")
                .map((c) => {
                  const isSelected = cat === c.name;
                  return (
                    <button
                      key={c.name}
                      onClick={() => {
                        setCat(c.name);
                        setShowAllCategoriesModal(false);
                        setCategorySearch("");
                      }}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition text-xs font-semibold hover:border-black active:scale-95 dark:hover:border-white",
                        isSelected
                          ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                          : "border-black/10 bg-background hover:bg-muted/40",
                      )}
                    >
                      <DynIcon name={c.icon} className="h-4 w-4 shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
            </div>

            {filteredAllCategories.filter((c) => c.name !== "More").length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No category matching "{categorySearch}".
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global QR Share Modal */}
      <QrShareModal
        isOpen={shareData.isOpen}
        onClose={() => setShareData({ ...shareData, isOpen: false })}
        title={shareData.title}
        url={shareData.url}
      />
    </Shell>
  );
}
