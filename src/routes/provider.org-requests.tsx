import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Building2 } from "lucide-react";
import { Shell } from "@/components/app-ui";
import { toast } from "sonner";

export const Route = createFileRoute("/provider/org-requests")({
  head: () => ({
    meta: [
      { title: "Organization Join Requests | Zifly" },
      {
        name: "description",
        content: "Review organization invitations and join requests on Zifly.",
      },
    ],
  }),
  component: OrgRequestsPage,
});

export function OrgRequestsPage() {
  const router = useRouter();
  const [hasAccepted, setHasAccepted] = useState(false);
  const [hasRejected, setHasRejected] = useState(false);

  const handleAccept = () => {
    setHasAccepted(true);
    toast.success("Joined Brightpath Studio! Your team profile is now active.");
  };

  const handleReject = () => {
    setHasRejected(true);
    toast("Invitation declined");
  };

  return (
    <Shell hideBottomNav>
      <div className="mx-auto max-w-md pb-16 pt-2 md:pt-6 px-3 sm:px-4 space-y-5">
        {/* Header matching PDF Page 38 with Back button */}
        <div className="flex items-center gap-3 border-b pb-4">
          <button
            type="button"
            onClick={() => router.history.back()}
            aria-label="Back"
            className="grid h-10 w-10 place-items-center rounded-full border border-black/10 hover:bg-muted active:scale-95 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Join requests
            </h1>
            <p className="text-xs text-muted-foreground">From organizations</p>
          </div>
        </div>

        {/* NEW REQUEST Section matching PDF Page 38 */}
        <div className="space-y-3">
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground px-1">
            New Request
          </p>

          {!hasAccepted && !hasRejected ? (
            <div className="rounded-3xl border border-black/10 bg-card p-5 shadow-xs dark:border-white/10 space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0D0D12] text-white font-black text-sm shadow-xs shrink-0">
                  BS
                </div>
                <div>
                  <p className="font-extrabold text-base text-foreground">Brightpath Studio</p>
                  <p className="text-xs text-muted-foreground">
                    Web and marketing team · 6 providers
                  </p>
                </div>
              </div>

              <p className="text-xs text-foreground leading-relaxed">
                We would love to have you on our team. Customers will book you through our profile.
              </p>

              <div className="rounded-2xl bg-muted/40 p-4 space-y-2.5 text-xs border border-black/5 dark:border-white/5">
                <p className="font-bold text-foreground">If you accept</p>
                <div className="space-y-2 text-[11px] text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#5B4DF5] shrink-0 mt-0.5" />
                    <span>Customers book you through Brightpath Studio</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#5B4DF5] shrink-0 mt-0.5" />
                    <span>Your personal booking page is paused while you are a member</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#5B4DF5] shrink-0 mt-0.5" />
                    <span>Bookings still come straight to you</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#5B4DF5] shrink-0 mt-0.5" />
                    <span>You can leave anytime</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleReject}
                  className="rounded-2xl border border-black/15 bg-background py-3 text-xs font-bold text-foreground hover:bg-muted active:scale-95 transition dark:border-white/15"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="rounded-2xl bg-[#5B4DF5] py-3 text-xs font-bold text-white hover:bg-[#4F46E5] active:scale-95 transition shadow-xs"
                >
                  Accept
                </button>
              </div>
            </div>
          ) : hasAccepted ? (
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center space-y-2">
              <span className="font-bold text-sm text-emerald-800 dark:text-emerald-200 block">
                ✓ Accepted invitation to Brightpath Studio
              </span>
              <p className="text-xs text-muted-foreground">
                You are now a registered member of Brightpath Studio.
              </p>
            </div>
          ) : (
            <div className="rounded-3xl border border-black/10 bg-card p-5 text-center text-xs text-muted-foreground">
              Invitation was declined.
            </div>
          )}
        </div>

        {/* EARLIER Section matching PDF Page 38 */}
        <div className="space-y-3 pt-2">
          <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground px-1">
            Earlier
          </p>

          <div className="rounded-3xl border border-black/10 bg-card p-4 sm:p-5 shadow-xs dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-neutral-800 text-white font-black text-xs shadow-xs shrink-0">
                  PC
                </div>
                <div>
                  <p className="font-extrabold text-sm text-foreground">Pixel Collective</p>
                  <p className="text-xs text-muted-foreground">Design studio · 4 providers</p>
                </div>
              </div>

              <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
                Rejected 12 Oct
              </span>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
