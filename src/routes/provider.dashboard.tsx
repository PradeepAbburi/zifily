import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Bell,
  Eye,
  Star,
  ChevronRight,
  Plus,
  CalendarDays,
  Layers,
  Clock,
  FileText,
  BarChart3,
} from "lucide-react";
import { Shell, ZifilyLogo } from "@/components/app-ui";
import { useStore, actions } from "@/lib/store";
import { toast } from "sonner";
import { QrShareModal } from "@/components/qr-share-modal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/provider/dashboard")({
  head: () => ({
    meta: [
      { title: "Provider Home Dashboard | Expertene" },
      {
        name: "description",
        content: "Pro specialist home dashboard: earnings, client requests, reviews, and bookings.",
      },
    ],
  }),
  component: ProviderDashboardPage,
});

function ProviderDashboardPage() {
  const router = useRouter();
  const business = useStore((s) => s.business);
  const allNotifications = useStore((s) => s.notifications);
  const userRole = useStore((s) => s.userRole);

  useEffect(() => {
    if (userRole !== "provider") {
      actions.setUserRole("provider");
    }
  }, [userRole]);

  const [isAvailable, setIsAvailable] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Unread notifications count
  const unreadNotifsCount = useMemo(() => {
    if (!Array.isArray(allNotifications)) return 2;
    return allNotifications.filter((n) => !n.isRead).length;
  }, [allNotifications]);

  // New incoming customer requests matching PDF Page 37 & 58
  const [pendingRequestsList, setPendingRequestsList] = useState([
    {
      id: "req-1",
      name: "Nisha Patel",
      initials: "NP",
      service: "Strategy call",
      time: "Thu 10:30",
      price: "₹999",
      traderId: "james-wilson",
    },
    {
      id: "req-2",
      name: "Vikram Rao",
      initials: "VR",
      service: "Website audit",
      time: "Fri 14:00",
      price: "₹4,999",
      traderId: "james-wilson",
    },
  ]);

  const handleAcceptRequest = (req: (typeof pendingRequestsList)[0]) => {
    setPendingRequestsList((prev) => prev.filter((r) => r.id !== req.id));
    actions.send(req.traderId, {
      fromRole: "provider",
      text: `Hello ${req.name}, I've accepted your booking request for ${req.service}! Looking forward to working together.`,
    });
    toast.success(`Accepted request from ${req.name}`);
    router.navigate({ to: "/messages" });
  };

  const handleDeclineRequest = (reqId: string) => {
    setPendingRequestsList((prev) => prev.filter((r) => r.id !== reqId));
    toast("Request declined");
  };

  const profileUrl =
    typeof window !== "undefined" ? `${window.location.origin}/trader/james-wilson` : "";

  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-3 sm:px-6 py-3 md:py-6 space-y-5">
        {/* TOP BRAND BAR: Zifily at one corner, Notification Icon at the other corner */}
        <div className="flex items-center justify-between pt-1">
          <ZifilyLogo />
          <Link
            to="/notifications"
            title="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-2xl border border-black/15 bg-background shadow-xs hover:border-[#5B4DF5] active:scale-95 transition dark:border-white/15"
          >
            <Bell className="h-5 w-5 text-foreground" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-[#5B4DF5] text-[10px] font-black text-white shadow-xs">
                {unreadNotifsCount}
              </span>
            )}
          </Link>
        </div>

        {/* Top Header Row matching PDF Page 37 & 58 (NO text under heading) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground">
              Good morning, {business.name ? business.name.split(" ")[0] : "Arjun"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Purple Accepting toggle switch matching PDF Page 37 & 58 */}
            <div className="flex items-center gap-1.5 mr-1">
              <span className="text-xs font-bold text-foreground">Accepting</span>
              <button
                type="button"
                role="switch"
                aria-checked={isAvailable}
                onClick={() => {
                  setIsAvailable(!isAvailable);
                  toast(
                    isAvailable
                      ? "Status set to Offline / Away"
                      : "Status set to Accepting Clients",
                  );
                }}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none",
                  isAvailable ? "bg-[#5B4DF5]" : "bg-neutral-200 dark:bg-neutral-800",
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5",
                    isAvailable ? "translate-x-5" : "translate-x-0.5",
                  )}
                />
              </button>
            </div>

            {/* Slot selector button: Full page with back button (button text hidden on mobile UI) */}
            <Link
              to="/provider/calendar"
              title="Slot Availability Selector"
              className="flex items-center gap-1.5 rounded-2xl border border-black/15 bg-background p-2.5 sm:px-3.5 sm:py-2 text-xs font-bold text-foreground shadow-xs hover:bg-muted active:scale-95 transition whitespace-nowrap dark:border-white/15"
            >
              <Clock className="h-4 w-4 text-[#5B4DF5]" />
              <span className="hidden sm:inline">Slots</span>
            </Link>

            {/* Form editor button: Full page with back button (button text hidden on mobile UI) */}
            <Link
              to="/provider/intake"
              title="Booking Form Editor"
              className="flex items-center gap-1.5 rounded-2xl border border-black/15 bg-background p-2.5 sm:px-3.5 sm:py-2 text-xs font-bold text-foreground shadow-xs hover:bg-muted active:scale-95 transition whitespace-nowrap dark:border-white/15"
            >
              <FileText className="h-4 w-4 text-[#5B4DF5]" />
              <span className="hidden sm:inline">Form editor</span>
            </Link>

            {/* Offline booking button: Full page with back button (button text hidden on mobile UI) */}
            <Link
              to="/provider/offline-booking"
              title="Add offline booking"
              className="flex items-center gap-1.5 rounded-2xl bg-[#5B4DF5] p-2.5 sm:px-3.5 sm:py-2 text-xs font-bold text-white shadow-xs hover:bg-[#4F46E5] active:scale-95 transition whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Offline booking</span>
            </Link>

            {/* Public Page View */}
            <Link
              to="/trader/james-wilson"
              title="View Public Profile"
              className="grid h-9 w-9 place-items-center rounded-xl border border-black/15 bg-background shadow-xs hover:border-black active:scale-95 transition dark:border-white/15 dark:hover:border-white"
            >
              <Eye className="h-4 w-4 text-foreground" />
            </Link>
          </div>
        </div>

        {/* Organization Invitation Banner matching PDF Page 37 (NO text under heading) */}
        <Link
          to="/provider/org-requests"
          className="flex items-center justify-between rounded-3xl border border-black/10 bg-card p-4 shadow-xs hover:border-[#5B4DF5] transition select-none dark:border-white/10"
        >
          <div className="flex items-center gap-3.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0D0D12] text-white font-black text-xs shadow-xs">
              BS
            </div>
            <p className="font-extrabold text-sm text-foreground">Brightpath Studio invited you</p>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Link>

        {/* Primary Metric Cards & Navigation Buttons */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Booked this week button taking user directly to analytics page */}
          <Link
            to="/provider/analytics"
            className="group rounded-2xl border border-black/10 bg-card p-4 shadow-2xs dark:border-white/10 hover:border-[#5B4DF5] transition"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-muted-foreground">Booked this week</p>
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
            </div>
            <p className="mt-1 text-2xl font-black text-foreground">₹18,400</p>
            <p className="mt-0.5 text-[10px] text-[#5B4DF5] font-bold flex items-center gap-1 group-hover:underline">
              <span>View analytics</span>
              <span>&rarr;</span>
            </p>
          </Link>

          <Link
            to="/bookings"
            className="group rounded-2xl border border-black/10 bg-card p-4 shadow-2xs dark:border-white/10 hover:border-black transition dark:hover:border-white"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-muted-foreground">Bookings</p>
              <CalendarDays className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
            </div>
            <p className="mt-1 text-2xl font-black text-foreground">12</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground flex items-center gap-1 group-hover:text-foreground font-semibold">
              <span>View all bookings</span>
              <span>&rarr;</span>
            </p>
          </Link>

          {/* Dedicated Reviews Button in Home */}
          <Link
            to="/provider/reviews"
            className="group rounded-2xl border border-black/10 bg-card p-4 shadow-2xs dark:border-white/10 hover:border-[#5B4DF5] transition"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-muted-foreground">Rating &amp; Reviews</p>
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-2xl font-black text-foreground">4.9</span>
              <span className="text-xs text-muted-foreground font-semibold">(212)</span>
            </div>
            <p className="mt-0.5 text-[10px] text-[#5B4DF5] font-bold flex items-center gap-1 group-hover:underline">
              <span>Client reviews</span>
              <span>&rarr;</span>
            </p>
          </Link>

          {/* Dedicated Zif cards / Portfolio Button */}
          <Link
            to="/provider/portfolio"
            className="group rounded-2xl border border-black/10 bg-card p-4 shadow-2xs dark:border-white/10 hover:border-[#5B4DF5] transition"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-muted-foreground">Zif cards</p>
              <Layers className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
            </div>
            <p className="mt-1 text-2xl font-black text-foreground">14</p>
            <p className="mt-0.5 text-[10px] text-[#5B4DF5] font-bold flex items-center gap-1 group-hover:underline">
              <span>Work portfolio</span>
              <span>&rarr;</span>
            </p>
          </Link>
        </div>

        {/* NEW REQUESTS (NO text under heading) */}
        <div className="space-y-3">
          <h2 className="text-xs font-black tracking-wider uppercase text-muted-foreground">
            New Requests ({pendingRequestsList.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pendingRequestsList.map((req) => (
              <div
                key={req.id}
                className="rounded-3xl border border-black/10 bg-card p-4 sm:p-5 shadow-xs dark:border-white/10 space-y-3.5 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#1A1A24] text-white font-extrabold text-xs shadow-xs">
                      {req.initials}
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-foreground">{req.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {req.service} · {req.time}
                      </p>
                    </div>
                  </div>
                  <span className="font-black text-sm text-foreground">{req.price}</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDeclineRequest(req.id)}
                    className="rounded-2xl border border-black/15 bg-background py-2.5 text-xs font-bold text-foreground hover:bg-muted active:scale-95 transition dark:border-white/15"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAcceptRequest(req)}
                    className="rounded-2xl bg-[#5B4DF5] py-2.5 text-xs font-bold text-white hover:bg-[#4F46E5] active:scale-95 transition shadow-xs"
                  >
                    <span className="hidden sm:inline">Accept and chat</span>
                    <span className="sm:hidden">Accept</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pendingRequestsList.length === 0 && (
            <div className="rounded-3xl border border-dashed border-black/15 p-8 text-center dark:border-white/15 bg-muted/20">
              <p className="font-bold text-sm text-foreground">No new pending requests</p>
            </div>
          )}
        </div>
      </div>

      {/* QR Share Modal */}
      <QrShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={business.name}
        subtitle="Share your specialist profile and booking link"
        url={profileUrl}
      />
    </Shell>
  );
}
