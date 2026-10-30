import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Building2,
  Users,
  Search,
  UserPlus,
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  TrendingUp,
  MapPin,
  Star,
  ExternalLink,
  ShieldCheck,
  Check,
  X,
  Plus,
  Send,
  Calendar,
  Layers,
  ArrowRight,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { Shell, Stars, TopBar, Verified } from "@/components/app-ui";
import {
  useStore,
  actions,
  getTraderRatingInfo,
  isSlotBooked,
  type Organization,
} from "@/lib/store";
import { traders, categories, type Trader } from "@/lib/data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/org/dashboard")({
  head: () => ({
    meta: [
      { title: "Organization Hub — Zifily" },
      {
        name: "description",
        content:
          "Manage team specialists, send affiliation invitations, and monitor aggregate organization performance.",
      },
    ],
  }),
  component: OrgDashboardPage,
});

type OrgTab = "providers" | "analytics" | "booking-hub" | "settings";

function OrgDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<OrgTab>("providers");
  const [recruitmentSearch, setRecruitmentSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");

  const organizations = useStore((s) => s.organizations);
  const orgInvitations = useStore((s) => s.orgInvitations);
  const activeOrgId = useStore((s) => s.activeOrgId);
  const allBookings = useStore((s) => s.bookings);
  const reviews = useStore((s) => s.reviews);

  // Active Organization or fallback to default seeded guild
  const currentOrg = useMemo(() => {
    if (activeOrgId) {
      const found = organizations.find((o) => o.id === activeOrgId);
      if (found) return found;
    }
    return (
      organizations[0] || {
        id: "org-apex",
        name: "Apex Master Craftsmen Guild",
        regNumber: "GB 882 1920 44",
        industry: "Trades & Construction Collective",
        contactPerson: "Marcus Vance",
        contactEmail: "marcus@apexcraftsmen.co.uk",
        contactPhone: "+44 20 7946 0912",
        city: "London, UK",
        description:
          "Premier consortium of vetted master plumbers, gas engineers, electricians, and carpenters across Greater London.",
        memberTraderIds: ["james-wilson", "david-lee"],
        pendingInviteTraderIds: ["sarah-miller"],
      }
    );
  }, [organizations, activeOrgId]);

  // Member specialists in this organization
  const memberSpecialists = useMemo(() => {
    return traders.filter((t) => currentOrg.memberTraderIds.includes(t.id));
  }, [currentOrg.memberTraderIds]);

  // Pending invitations sent by this organization
  const pendingInvitations = useMemo(() => {
    return orgInvitations.filter((i) => i.orgId === currentOrg.id && i.status === "pending");
  }, [orgInvitations, currentOrg.id]);

  // Independent candidates available for recruitment
  const availableCandidates = useMemo(() => {
    return traders.filter((t) => {
      const isMember = currentOrg.memberTraderIds.includes(t.id);
      const isInvited =
        currentOrg.pendingInviteTraderIds.includes(t.id) ||
        pendingInvitations.some((inv) => inv.traderId === t.id);
      if (isMember || isInvited) return false;

      const matchesQuery =
        !recruitmentSearch.trim() ||
        (t.name + t.title + t.category).toLowerCase().includes(recruitmentSearch.toLowerCase());
      const matchesCat = selectedCategoryFilter === "all" || t.category === selectedCategoryFilter;

      return matchesQuery && matchesCat;
    });
  }, [currentOrg, pendingInvitations, recruitmentSearch, selectedCategoryFilter]);

  // Aggregate Organization Analytics
  const aggregateMetrics = useMemo(() => {
    // Bookings belonging to member traders
    const orgBookings = allBookings.filter((b) => currentOrg.memberTraderIds.includes(b.traderId));
    const completedJobs = orgBookings.filter((b) => b.status === "Completed").length;
    const activeJobs = orgBookings.filter(
      (b) => b.status === "Confirmed" || b.status === "Pending",
    ).length;

    // Gross Revenue computed across member bookings + simulated baseline
    const calculatedRevenue = orgBookings.reduce((sum, b) => sum + (b.price || 120), 0);
    const totalGrossRevenue = Math.max(14850, calculatedRevenue + 12500);
    const orgCommission = Math.round(totalGrossRevenue * 0.12); // 12% guild platform fee

    return {
      memberCount: memberSpecialists.length,
      totalGrossRevenue,
      orgCommission,
      completedJobs: Math.max(48, completedJobs + 42),
      activeJobs,
      clientSatisfaction: 4.96,
      slotsFilledRate: "88%",
    };
  }, [allBookings, currentOrg, memberSpecialists]);

  const handleSendJoinRequest = (traderId: string, traderName: string) => {
    actions.inviteProviderToOrg(currentOrg.id, traderId);
    toast.success(`Affiliation request sent to ${traderName}!`, {
      description: "They can accept or decline this offer from their Provider Dashboard.",
    });
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Top Header & Org Identity Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-linear-to-br from-neutral-900 via-neutral-950 to-black p-6 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-2xl shadow-inner shrink-0">
                🏢
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                    {currentOrg.name}
                  </h1>
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                    Verified Consortium
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-300 max-w-2xl leading-relaxed">
                  {currentOrg.description}
                </p>
                <div className="mt-3 flex items-center gap-4 text-[11px] text-neutral-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    Reg / VAT: <b>{currentOrg.regNumber}</b>
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                    {currentOrg.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-neutral-400" />
                    <b>{memberSpecialists.length}</b> Affiliated Specialists
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                to="/org/$id"
                params={{ id: currentOrg.id }}
                className="flex items-center gap-1.5 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-black transition hover:bg-neutral-200 active:scale-95 shadow-md"
              >
                <span>View Public Booking Hub</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-black/10 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("providers")}
            className={cn(
              "flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap",
              activeTab === "providers"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Users className="h-4 w-4" />
            <span>Specialists & Roster ({memberSpecialists.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={cn(
              "flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap",
              activeTab === "analytics"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Aggregate Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("booking-hub")}
            className={cn(
              "flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap",
              activeTab === "booking-hub"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Calendar className="h-4 w-4" />
            <span>Multi-Provider Booking Preview</span>
          </button>
        </div>

        {/* TAB 1: SPECIALISTS & ROSTER MANAGEMENT */}
        {activeTab === "providers" && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Active Affiliated Providers */}
            <div>
              <div className="flex items-center justify-between pb-3">
                <div>
                  <h2 className="text-base font-bold tracking-tight">Active Team Specialists</h2>
                  <p className="text-xs text-muted-foreground">
                    These verified providers operate under your organization. Clients booking from
                    your hub sync directly with their calendar slots.
                  </p>
                </div>
                <span className="rounded-full bg-black/5 dark:bg-white/10 px-3 py-1 text-xs font-bold">
                  {memberSpecialists.length} Active
                </span>
              </div>

              {memberSpecialists.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-black/20 p-8 text-center dark:border-white/20">
                  <p className="text-sm font-semibold">No specialists affiliated yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use the Recruitment section below to search and invite independent specialists
                    to join your organization.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {memberSpecialists.map((pro) => {
                    const ratingData = getTraderRatingInfo(
                      pro.id,
                      pro.rating,
                      pro.reviews,
                      reviews[pro.id],
                    );
                    const jobsCount = allBookings.filter((b) => b.traderId === pro.id).length;

                    return (
                      <div
                        key={pro.id}
                        className="flex flex-col justify-between rounded-3xl border border-black/10 bg-card p-4 shadow-xs dark:border-white/10"
                      >
                        <div>
                          <div className="flex items-start gap-3">
                            <img
                              src={pro.photo}
                              alt={pro.name}
                              className="h-16 w-16 rounded-2xl object-cover border border-black/10 dark:border-white/10"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-sm truncate">{pro.name}</span>
                                <Verified />
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{pro.title}</p>
                              <div className="mt-1 flex items-center gap-1 text-xs">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <b>{ratingData.rating.toFixed(2)}</b>
                                <span className="text-[11px] text-muted-foreground">
                                  ({ratingData.reviewsCount})
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3.5 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Assigned Jobs:</span>
                            <span className="font-bold">{jobsCount + 14} completed</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active in Guild
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                          <Link
                            to="/trader/$id"
                            params={{ id: pro.id }}
                            className="flex-1 rounded-xl border border-black/10 py-1.5 text-center text-xs font-semibold hover:bg-muted transition dark:border-white/10"
                          >
                            View Profile
                          </Link>
                          <Link
                            to="/chat/$id"
                            params={{ id: pro.id }}
                            className="rounded-xl border border-black/10 px-3 py-1.5 text-center text-xs font-semibold hover:bg-muted transition dark:border-white/10"
                          >
                            Chat
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pending Invitations Sent */}
            {pendingInvitations.length > 0 && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900 dark:bg-amber-950/20">
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                      Pending Join Invitations ({pendingInvitations.length})
                    </h3>
                  </div>
                  <span className="text-xs text-amber-700 dark:text-amber-400">
                    Awaiting specialist acceptance
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  {pendingInvitations.map((inv) => {
                    const trader = traders.find((t) => t.id === inv.traderId);
                    return (
                      <div
                        key={inv.id}
                        className="flex items-center justify-between rounded-2xl border border-amber-300/40 bg-background p-3 text-xs shadow-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          {trader?.photo && (
                            <img
                              src={trader.photo}
                              alt=""
                              className="h-9 w-9 rounded-xl object-cover"
                            />
                          )}
                          <div>
                            <span className="font-bold">{trader?.name || inv.traderId}</span>
                            <p className="text-[10px] text-muted-foreground">{trader?.title}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                          Invite Sent
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Candidate Recruitment & Search */}
            <div className="rounded-3xl border border-black/10 bg-muted/20 p-6 dark:border-white/10 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Recruit & Affiliate Independent Specialists
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Search independent providers across the UK and send them a formal join request
                    to represent your organization.
                  </p>
                </div>

                {/* Search Input */}
                <div className="flex items-center gap-2 rounded-2xl border border-black/15 bg-background px-3 py-2 text-xs w-full md:w-72">
                  <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    value={recruitmentSearch}
                    onChange={(e) => setRecruitmentSearch(e.target.value)}
                    placeholder="Search candidate by name or skill..."
                    className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
                  />
                  {recruitmentSearch && (
                    <button type="button" onClick={() => setRecruitmentSearch("")}>
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>

              {/* Candidate Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                {availableCandidates.slice(0, 6).map((cand) => {
                  const ratingData = getTraderRatingInfo(
                    cand.id,
                    cand.rating,
                    cand.reviews,
                    reviews[cand.id],
                  );

                  return (
                    <div
                      key={cand.id}
                      className="flex flex-col justify-between rounded-2xl border border-black/10 bg-background p-3.5 shadow-2xs dark:border-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={cand.photo}
                          alt={cand.name}
                          className="h-12 w-12 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="font-bold text-xs truncate block">{cand.name}</span>
                          <span className="text-[11px] text-muted-foreground truncate block">
                            {cand.title}
                          </span>
                          <div className="mt-1 flex items-center gap-1 text-[11px]">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <b>{ratingData.rating.toFixed(2)}</b>
                            <span className="text-muted-foreground">
                              ({ratingData.reviewsCount} reviews)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                        <span className="text-[11px] text-muted-foreground">
                          {cand.distance} mi away
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSendJoinRequest(cand.id, cand.name)}
                          className="flex items-center gap-1.5 rounded-xl bg-black px-3 py-1.5 text-xs font-bold text-white transition hover:bg-neutral-800 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                        >
                          <Send className="h-3 w-3" />
                          <span>Send Join Request</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AGGREGATE ORGANIZATION ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="rounded-3xl border border-black/10 bg-card p-4 dark:border-white/10 shadow-xs">
                <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                  Combined Gross Volume
                </span>
                <div className="mt-2 text-2xl font-black">
                  £{aggregateMetrics.totalGrossRevenue.toLocaleString()}
                </div>
                <span className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                  <TrendingUp className="h-3 w-3" />
                  +18.4% this quarter
                </span>
              </div>

              <div className="rounded-3xl border border-black/10 bg-card p-4 dark:border-white/10 shadow-xs">
                <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                  Guild Hub Commission (12%)
                </span>
                <div className="mt-2 text-2xl font-black">
                  £{aggregateMetrics.orgCommission.toLocaleString()}
                </div>
                <span className="mt-1 text-[11px] text-muted-foreground">
                  Disbursed to consortium fund
                </span>
              </div>

              <div className="rounded-3xl border border-black/10 bg-card p-4 dark:border-white/10 shadow-xs">
                <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                  Total Completed Jobs
                </span>
                <div className="mt-2 text-2xl font-black">{aggregateMetrics.completedJobs}</div>
                <span className="mt-1 text-[11px] text-emerald-600 font-semibold">
                  99.2% fulfillment rate
                </span>
              </div>

              <div className="rounded-3xl border border-black/10 bg-card p-4 dark:border-white/10 shadow-xs">
                <span className="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                  Consortium Star Rating
                </span>
                <div className="mt-2 text-2xl font-black flex items-center gap-1">
                  ★ {aggregateMetrics.clientSatisfaction}
                </div>
                <span className="mt-1 text-[11px] text-muted-foreground">
                  Across verified clients
                </span>
              </div>
            </div>

            {/* Specialist Leaderboard */}
            <div className="rounded-3xl border border-black/10 bg-card p-6 dark:border-white/10 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-white/10">
                <div>
                  <h3 className="font-bold text-base">Specialist Performance Leaderboard</h3>
                  <p className="text-xs text-muted-foreground">
                    Performance rankings and jobs completed across your affiliated team members.
                  </p>
                </div>
                <span className="text-xs font-bold text-muted-foreground">Ranked by volume</span>
              </div>

              <div className="mt-4 space-y-3">
                {memberSpecialists.map((pro, idx) => {
                  const ratingData = getTraderRatingInfo(
                    pro.id,
                    pro.rating,
                    pro.reviews,
                    reviews[pro.id],
                  );
                  const simulatedGross = 4200 + (3 - idx) * 1800;

                  return (
                    <div
                      key={pro.id}
                      className="flex items-center justify-between rounded-2xl border border-black/5 bg-muted/20 p-3.5 transition hover:bg-muted/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className="grid h-7 w-7 place-items-center rounded-xl bg-black text-white dark:bg-white dark:text-black font-black text-xs">
                          #{idx + 1}
                        </span>
                        <img
                          src={pro.photo}
                          alt={pro.name}
                          className="h-10 w-10 rounded-xl object-cover"
                        />
                        <div>
                          <span className="font-bold text-xs">{pro.name}</span>
                          <p className="text-[11px] text-muted-foreground">{pro.title}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <div className="text-xs font-bold">
                            £{simulatedGross.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-muted-foreground">Gross Earned</span>
                        </div>
                        <div>
                          <div className="text-xs font-bold flex items-center gap-1 justify-end">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            {ratingData.rating.toFixed(2)}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {ratingData.reviewsCount} reviews
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: MULTI-PROVIDER BOOKING HUB PREVIEW */}
        {activeTab === "booking-hub" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="rounded-3xl border border-black/10 bg-card p-6 dark:border-white/10 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-black/10 dark:border-white/10">
                <div>
                  <h3 className="font-bold text-base">Client Booking Hub Experience</h3>
                  <p className="text-xs text-muted-foreground">
                    When customers visit your public organization page, they pick a service and
                    select from your qualified specialists.
                  </p>
                </div>
                <Link
                  to="/org/$id"
                  params={{ id: currentOrg.id }}
                  className="rounded-xl bg-black px-4 py-2 text-xs font-bold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black"
                >
                  Open Live Customer Page →
                </Link>
              </div>

              {/* Service & Specialist selector interactive demo */}
              <div className="mt-6 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1. Available Trade Services from Guild
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      name: "Gas Safe Boiler Repair & Tune",
                      price: "From £95",
                      duration: "1.5 hrs",
                    },
                    {
                      name: "Emergency Plumbing & Drain Clearance",
                      price: "From £85",
                      duration: "1 hr",
                    },
                    {
                      name: "Smart Home Automated Rewiring",
                      price: "From £120",
                      duration: "2 hrs",
                    },
                  ].map((svc, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-black/10 bg-muted/20 p-3.5 transition hover:border-black dark:border-white/10"
                    >
                      <h4 className="font-bold text-xs">{svc.name}</h4>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="font-semibold text-emerald-600">{svc.price}</span>
                        <span className="text-muted-foreground">{svc.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-4 block">
                  2. Select Specialist From Organization
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {memberSpecialists.map((pro) => (
                    <div
                      key={pro.id}
                      className="flex items-center justify-between rounded-2xl border border-black/10 p-3.5 bg-background shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={pro.photo}
                          alt={pro.name}
                          className="h-10 w-10 rounded-xl object-cover"
                        />
                        <div>
                          <span className="font-bold text-xs">{pro.name}</span>
                          <p className="text-[10px] text-muted-foreground">{pro.title}</p>
                        </div>
                      </div>
                      <Link
                        to="/book/$id"
                        params={{ id: pro.id }}
                        className="rounded-xl bg-black px-3 py-1.5 text-xs font-bold text-white transition hover:bg-neutral-800 dark:bg-white dark:text-black"
                      >
                        Book Slot
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
