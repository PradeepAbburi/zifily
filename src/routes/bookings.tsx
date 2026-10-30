import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Calendar,
  Check,
  ChevronRight,
  Clock,
  MapPin,
  MessageSquare,
  X,
  User,
  Phone,
  RotateCcw,
} from "lucide-react";
import { Shell } from "@/components/app-ui";
import { getTrader } from "@/lib/data";
import { actions, fmtDate, fmtTime, timeRange, useStore, type Booking } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CancelBookingModal } from "@/components/cancel-booking-modal";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings | Zifly" },
      {
        name: "description",
        content: "Manage requests and your schedule on Zifly.",
      },
    ],
  }),
  component: BookingsPage,
});

type BookingFilterTab = "requests" | "upcoming" | "completed" | "all";

export function BookingsPage() {
  const [tab, setTab] = useState<BookingFilterTab>("requests");
  const bookings = useStore((s) => s.bookings);
  const userRole = useStore((s) => s.userRole);
  const today = new Date().toISOString().slice(0, 10);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);

  // Selected date filter in date strip
  const [selectedDateFilter, setSelectedDateFilter] = useState<string>("2026-10-29");

  // Filter bookings into categories
  const pendingRequests = bookings.filter((b) => b.status === "Pending");
  const upcomingBookings = bookings.filter(
    (b) => (b.date >= today || b.date.startsWith("2026-10-29")) && b.status === "Confirmed",
  );
  const completedBookings = bookings.filter(
    (b) => b.status === "Completed" || b.status === "Cancelled" || b.status === "Rejected",
  );

  const list: Booking[] =
    tab === "requests"
      ? pendingRequests
      : tab === "upcoming"
        ? upcomingBookings
        : tab === "completed"
          ? completedBookings
          : bookings;

  const handleAccept = (booking: Booking) => {
    actions.acceptBooking(booking.id);
    toast.success("Booking accepted! Client notified in chat.");
  };

  const handleDecline = (booking: Booking) => {
    actions.rejectBooking(booking.id);
    toast("Booking request declined");
  };

  const handleConfirmCancel = () => {
    if (!bookingToCancel) return;
    actions.cancelBooking(bookingToCancel.id, userRole);
    toast.success("Booking cancelled successfully.");
    setBookingToCancel(null);
  };

  // Date strip days matching PDF Page 40: Tue 27, Wed 28, Thu 29, Fri 30, Sat 31, Sun 1, Mon 2
  const dateStrip = [
    { dayName: "Tue", dayNum: "27", iso: "2026-10-27" },
    { dayName: "Wed", dayNum: "28", iso: "2026-10-28" },
    { dayName: "Thu", dayNum: "29", iso: "2026-10-29" },
    { dayName: "Fri", dayNum: "30", iso: "2026-10-30" },
    { dayName: "Sat", dayNum: "31", iso: "2026-10-31" },
    { dayName: "Sun", dayNum: "1", iso: "2026-11-01" },
    { dayName: "Mon", dayNum: "2", iso: "2026-11-02" },
  ];

  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);

  return (
    <Shell>
      <div className="mx-auto max-w-lg px-3 sm:px-4 pt-2 md:pt-6 pb-32 space-y-4">
        {/* Header matching PDF Page 40 */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Bookings</h1>
          <p className="text-xs text-muted-foreground">Manage requests and your schedule</p>
        </div>

        {/* Filter Tabs matching PDF Page 40 */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setTab("requests")}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 whitespace-nowrap",
              tab === "requests"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Requests {pendingRequests.length > 0 && <span>{pendingRequests.length}</span>}
          </button>

          <button
            type="button"
            onClick={() => setTab("upcoming")}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 whitespace-nowrap",
              tab === "upcoming"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Upcoming
          </button>

          <button
            type="button"
            onClick={() => setTab("completed")}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 whitespace-nowrap",
              tab === "completed"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            Completed
          </button>

          <button
            type="button"
            onClick={() => setTab("all")}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-bold transition active:scale-95 whitespace-nowrap",
              tab === "all"
                ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            All
          </button>
        </div>

        {/* Date Selection Strip matching PDF Page 40 */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto py-2 no-scrollbar border-y border-black/5 dark:border-white/5">
          {dateStrip.map((d) => {
            const isSelected = selectedDateFilter === d.iso;
            return (
              <button
                key={d.iso}
                type="button"
                onClick={() => setSelectedDateFilter(d.iso)}
                className={cn(
                  "flex flex-1 min-w-[46px] flex-col items-center py-2 px-1 rounded-2xl transition active:scale-95 select-none",
                  isSelected
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : "text-muted-foreground hover:bg-muted/30",
                )}
              >
                <span className="text-[10px] font-semibold">{d.dayName}</span>
                <span className="text-sm font-black mt-0.5">{d.dayNum}</span>
                <span
                  className={cn(
                    "h-1 w-1 rounded-full mt-1",
                    isSelected ? "bg-white dark:bg-black" : "bg-black/40 dark:bg-white/40",
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Bookings List matching PDF Page 40 */}
        <div className="space-y-3 pt-1">
          {list.length === 0 ? (
            <div className="rounded-3xl border border-black/10 bg-card p-8 text-center text-xs text-muted-foreground dark:border-white/10">
              No bookings in this section.
            </div>
          ) : (
            list.map((b) => {
              const isPending = b.status === "Pending";
              const isConfirmed = b.status === "Confirmed";
              const isCompleted = b.status === "Completed";
              const isCancelled = b.status === "Cancelled" || b.status === "Rejected";
              const trader = getTrader(b.traderId);
              const displayName = b.clientName || trader?.name || "Client Appointment";
              const initials = displayName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              const serviceLabel = b.serviceId
                ? b.serviceId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                : "Specialist Booking";

              const formattedPrice =
                typeof b.price === "number"
                  ? `₹${b.price.toLocaleString()}`
                  : b.price
                    ? String(b.price).startsWith("₹")
                      ? b.price
                      : `₹${b.price}`
                    : "₹999";

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBookingForDetails(b)}
                  className="group cursor-pointer rounded-3xl border border-black/10 bg-card p-4 sm:p-5 shadow-xs hover:border-black/30 transition dark:border-white/10 dark:hover:border-white/30 space-y-3.5"
                >
                  {/* Top Header: Initials circle + Name + Service + Price */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#1A1A24] text-white font-extrabold text-xs shadow-xs">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-sm sm:text-base text-foreground truncate group-hover:text-[#5B4DF5] transition">
                          {displayName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {serviceLabel} · {b.time ? fmtTime(b.time) : "10:30"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-sm sm:text-base text-foreground">
                        {formattedPrice}
                      </span>
                      {isConfirmed && (
                        <div className="mt-1">
                          <span className="rounded-full bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                            Accepted
                          </span>
                        </div>
                      )}
                      {isCompleted && (
                        <div className="mt-1">
                          <span className="rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                            Completed
                          </span>
                        </div>
                      )}
                      {isCancelled && (
                        <div className="mt-1">
                          <span className="rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-300 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                            {b.status}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row matching PDF Page 40 */}
                  {isPending ? (
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDecline(b);
                        }}
                        className="rounded-2xl border border-black/15 bg-background py-2.5 text-xs font-bold text-foreground hover:bg-muted active:scale-95 transition dark:border-white/15"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAccept(b);
                        }}
                        className="rounded-2xl bg-[#5B4DF5] py-2.5 text-xs font-bold text-white hover:bg-[#4F46E5] active:scale-95 transition shadow-xs"
                      >
                        Accept and chat
                      </button>
                    </div>
                  ) : (
                    /* Cancel option included for BOTH users and pros in upcoming appointments */
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <Link
                        to="/chat/$id"
                        params={{ id: b.traderId }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-1 rounded-2xl border border-black/15 bg-background py-2.5 text-xs font-bold text-foreground hover:bg-muted active:scale-95 transition dark:border-white/15 text-center"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Chat</span>
                      </Link>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.info("Reschedule request sent to client");
                        }}
                        className="flex items-center justify-center gap-1 rounded-2xl border border-black/15 bg-background py-2.5 text-xs font-bold text-foreground hover:bg-muted active:scale-95 transition dark:border-white/15"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reschedule</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBookingToCancel(b);
                        }}
                        className="flex items-center justify-center gap-1 rounded-2xl border border-rose-300 bg-rose-50/50 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100 active:scale-95 transition dark:bg-rose-950/25 dark:border-rose-900/50 dark:text-rose-300"
                        title="Cancel Appointment"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Full Booking Details Modal Sheet */}
      {selectedBookingForDetails && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedBookingForDetails(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-black/10 bg-background p-5 shadow-2xl dark:border-white/10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 border-black/10 dark:border-white/10">
              <div>
                <h3 className="font-black text-base text-foreground">Booking Details</h3>
                <p className="text-[11px] text-muted-foreground">
                  Ref #{selectedBookingForDetails.id.slice(-6).toUpperCase()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBookingForDetails(null)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Status & Service Highlight */}
            <div className="rounded-2xl bg-muted/40 p-4 border border-black/5 dark:border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
                    selectedBookingForDetails.status === "Confirmed" &&
                      "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
                    selectedBookingForDetails.status === "Pending" &&
                      "bg-amber-500/20 text-amber-800 dark:text-amber-300",
                    selectedBookingForDetails.status === "Completed" &&
                      "bg-sky-500/15 text-sky-700 dark:text-sky-300",
                    (selectedBookingForDetails.status === "Cancelled" ||
                      selectedBookingForDetails.status === "Rejected") &&
                      "bg-rose-500/15 text-rose-700 dark:text-rose-300",
                  )}
                >
                  {selectedBookingForDetails.status}
                </span>

                <span className="text-base font-black text-foreground">
                  {typeof selectedBookingForDetails.price === "number"
                    ? `₹${selectedBookingForDetails.price.toLocaleString()}`
                    : selectedBookingForDetails.price || "₹999"}
                </span>
              </div>

              <div>
                <p className="font-extrabold text-sm text-foreground">
                  {selectedBookingForDetails.serviceId
                    ?.replace(/-/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase()) || "Specialist Consultation"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Professional service appointment
                </p>
              </div>
            </div>

            {/* Appointment Schedule & Location */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-2xl border border-black/10 dark:border-white/10">
                <Calendar className="h-4 w-4 text-[#5B4DF5] shrink-0" />
                <div>
                  <p className="font-bold text-foreground">
                    {fmtDate(selectedBookingForDetails.date)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Scheduled Date</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl border border-black/10 dark:border-white/10">
                <Clock className="h-4 w-4 text-[#5B4DF5] shrink-0" />
                <div>
                  <p className="font-bold text-foreground">
                    {timeRange(selectedBookingForDetails.time)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Time Slot</p>
                </div>
              </div>

              {selectedBookingForDetails.address && (
                <div className="flex items-center gap-3 p-3 rounded-2xl border border-black/10 dark:border-white/10">
                  <MapPin className="h-4 w-4 text-[#5B4DF5] shrink-0" />
                  <div>
                    <p className="font-bold text-foreground">{selectedBookingForDetails.address}</p>
                    <p className="text-[11px] text-muted-foreground">Service Address / Location</p>
                  </div>
                </div>
              )}
            </div>

            {/* People Involved (Client & Specialist) */}
            <div className="rounded-2xl border border-black/10 dark:border-white/10 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground font-semibold">
                  Client Name:
                </span>
                <span className="font-bold text-foreground">
                  {selectedBookingForDetails.clientName || "Direct Client"}
                </span>
              </div>
              {selectedBookingForDetails.clientPhone && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground font-semibold">
                    Client Phone:
                  </span>
                  <a
                    href={`tel:${selectedBookingForDetails.clientPhone}`}
                    className="font-bold text-[#5B4DF5] hover:underline"
                  >
                    {selectedBookingForDetails.clientPhone}
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-[11px] text-muted-foreground font-semibold">Specialist:</span>
                <span className="font-bold text-foreground">
                  {getTrader(selectedBookingForDetails.traderId)?.name || "Assigned Specialist"}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/chat/$id"
                  params={{ id: selectedBookingForDetails.traderId }}
                  onClick={() => setSelectedBookingForDetails(null)}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-black/15 bg-background py-3 text-xs font-bold text-foreground hover:bg-muted active:scale-95 transition dark:border-white/15"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Open Chat</span>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    toast.info("Reschedule request communicated in chat");
                    setSelectedBookingForDetails(null);
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-black/15 bg-background py-3 text-xs font-bold text-foreground hover:bg-muted active:scale-95 transition dark:border-white/15"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reschedule</span>
                </button>
              </div>

              {/* Cancel Button available for both User and Pros for upcoming appointments */}
              {selectedBookingForDetails.status !== "Cancelled" &&
                selectedBookingForDetails.status !== "Completed" && (
                  <button
                    type="button"
                    onClick={() => {
                      const toCancel = selectedBookingForDetails;
                      setSelectedBookingForDetails(null);
                      setBookingToCancel(toCancel);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 py-3 text-xs font-bold hover:bg-rose-100 active:scale-95 transition dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-300"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel Appointment</span>
                  </button>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {bookingToCancel && (
        <CancelBookingModal
          isOpen={true}
          onClose={() => setBookingToCancel(null)}
          onConfirm={handleConfirmCancel}
          booking={bookingToCancel}
          traderName={bookingToCancel ? getTrader(bookingToCancel.traderId)?.name : undefined}
          serviceName={
            bookingToCancel
              ? getTrader(bookingToCancel.traderId)?.services.find(
                  (s) => s.id === bookingToCancel.serviceId,
                )?.name || bookingToCancel.serviceId
              : undefined
          }
          isProvider={userRole === "provider"}
        />
      )}
    </Shell>
  );
}
