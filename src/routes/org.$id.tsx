import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Building2,
  ShieldCheck,
  Star,
  Users,
  MapPin,
  Calendar,
  CheckCircle2,
  ArrowLeft,
  MessageSquare,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Shell, TopBar, Stars, Verified } from "@/components/app-ui";
import { useStore, getTraderRatingInfo } from "@/lib/store";
import { traders } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/org/$id")({
  head: () => ({
    meta: [
      { title: "Organization Specialists — Zifily" },
      {
        name: "description",
        content: "Book vetted specialists through verified trade and professional organizations.",
      },
    ],
  }),
  component: OrgPublicPage,
});

function OrgPublicPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const organizations = useStore((s) => s.organizations);
  const reviews = useStore((s) => s.reviews);

  const [selectedService, setSelectedService] = useState<string>("all");

  const org = useMemo(() => {
    return (
      organizations.find((o) => o.id === id) || {
        id,
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
  }, [organizations, id]);

  const memberSpecialists = useMemo(() => {
    return traders.filter((t) => org.memberTraderIds.includes(t.id));
  }, [org.memberTraderIds]);

  // Aggregate list of unique services offered across all member specialists
  const uniqueServices = useMemo(() => {
    const map = new Map<string, { id: string; name: string; price: string }>();
    memberSpecialists.forEach((pro) => {
      pro.services.forEach((s) => {
        if (!map.has(s.name)) {
          map.set(s.name, s);
        }
      });
    });
    return Array.from(map.values());
  }, [memberSpecialists]);

  // Filter specialists by selected service
  const filteredSpecialists = useMemo(() => {
    if (selectedService === "all") return memberSpecialists;
    return memberSpecialists.filter((pro) => pro.services.some((s) => s.name === selectedService));
  }, [memberSpecialists, selectedService]);

  return (
    <Shell hideNav hideBottomNav>
      <div className="space-y-6">
        {/* Back and Page Title */}
        <TopBar
          title={org.name}
          right={
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Verified Hub
            </span>
          }
        />

        {/* Hero Organization Identity Card */}
        <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-linear-to-br from-neutral-900 via-neutral-950 to-black p-6 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-3xl shadow-inner shrink-0">
                🏢
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-3xl font-black tracking-tight">{org.name}</h1>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                  {org.description}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs text-neutral-400 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    Reg / VAT: <b>{org.regNumber}</b>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-neutral-400" />
                    {org.city}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-neutral-400" />
                    <b>{memberSpecialists.length}</b> Qualified Roster Specialists
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 1: Select Service */}
        <div className="rounded-3xl border border-black/10 bg-card p-5 dark:border-white/10 shadow-xs">
          <div className="pb-3 border-b border-black/5 dark:border-white/5">
            <h2 className="text-sm font-bold tracking-tight">1. Select Required Service</h2>
            <p className="text-xs text-muted-foreground">
              Filter by service to see which verified specialists in this organization can perform
              it.
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedService("all")}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-semibold transition",
                selectedService === "all"
                  ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                  : "border border-black/10 bg-muted/30 text-muted-foreground hover:bg-muted dark:border-white/10",
              )}
            >
              All Guild Services ({uniqueServices.length})
            </button>
            {uniqueServices.map((svc) => (
              <button
                key={svc.id}
                type="button"
                onClick={() => setSelectedService(svc.name)}
                className={cn(
                  "rounded-xl px-3.5 py-1.5 text-xs font-semibold transition",
                  selectedService === svc.name
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : "border border-black/10 bg-muted/30 text-muted-foreground hover:bg-muted dark:border-white/10",
                )}
              >
                {svc.name}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Available Specialists in Organization */}
        <div>
          <div className="flex items-center justify-between pb-3">
            <div>
              <h2 className="text-base font-bold tracking-tight">2. Choose Specialist to Book</h2>
              <p className="text-xs text-muted-foreground">
                All appointments booked here directly lock into the selected specialist's schedule.
              </p>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">
              Showing {filteredSpecialists.length} pro{filteredSpecialists.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpecialists.map((pro) => {
              const ratingData = getTraderRatingInfo(
                pro.id,
                pro.rating,
                pro.reviews,
                reviews[pro.id],
              );

              return (
                <div
                  key={pro.id}
                  className="flex flex-col justify-between rounded-3xl border border-black/10 bg-card p-4 transition-all hover:border-black hover:shadow-lg dark:border-white/10 dark:hover:border-white shadow-xs"
                >
                  <div>
                    <div className="flex items-start gap-3.5">
                      <img
                        src={pro.photo}
                        alt={pro.name}
                        className="h-20 w-20 rounded-2xl object-cover border border-black/10 dark:border-white/10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-base truncate">{pro.name}</span>
                          <Verified />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{pro.title}</p>
                        <div className="mt-1 flex items-center gap-1 text-xs">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <b>{ratingData.rating.toFixed(2)}</b>
                          <span className="text-[11px] text-muted-foreground">
                            ({ratingData.reviewsCount} reviews)
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span>{pro.distance} miles away</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {pro.services.map((s) => (
                        <span
                          key={s.id}
                          className="rounded-lg border border-black/10 bg-muted/40 px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:border-white/10"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex gap-2">
                    <Link
                      to="/book/$id"
                      params={{ id: pro.id }}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-black py-2.5 text-xs font-bold text-white transition hover:bg-neutral-800 active:scale-95 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Book Specialist</span>
                    </Link>
                    <Link
                      to="/chat/$id"
                      params={{ id: pro.id }}
                      className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 hover:bg-muted transition text-muted-foreground hover:text-foreground dark:border-white/10"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Shell>
  );
}
