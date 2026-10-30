import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  Phone,
  User,
  Check,
  AlertCircle,
  X,
  CreditCard,
  Ban,
  Sparkles,
} from "lucide-react";
import { Shell } from "@/components/app-ui";
import { useStore, actions, fmtDate, type Booking } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/provider/calendar")({
  head: () => ({
    meta: [
      { title: "Availability & Calendar | Zifily" },
      {
        name: "description",
        content: "Tap a day, then tap slots to open, block, or reserve offline.",
      },
    ],
  }),
  component: ProviderCalendarPage,
});

type SlotStatus = "open" | "online" | "offline" | "blocked";

const BASE_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
];

function ProviderCalendarPage() {
  const router = useRouter();
  const bookings = useStore((s) => s.bookings);
  const userRole = useStore((s) => s.userRole);
  const custom = useStore((s) => s.providerCustomization);

  useEffect(() => {
    if (userRole !== "provider") {
      actions.setUserRole("provider");
    }
  }, [userRole]);

  // Calendar Date State: Year 2026, Month 10 (November, 0-indexed is 10)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(10); // 10 = November
  const [selectedDay, setSelectedDay] = useState(5);

  const selectedIso = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;

  // Slot custom overrides: Record<string, SlotStatus>
  const [slotOverrides, setSlotOverrides] = useState<Record<string, Record<string, SlotStatus>>>({
    "2026-11-05": {
      "9:00": "open",
      "10:30": "online",
      "12:00": "offline",
      "2:00": "blocked",
      "3:30": "open",
      "5:00": "open",
    },
  });

  // Full-page offline booking view state (Page 47)
  const [isAddingOffline, setIsAddingOffline] = useState(false);
  const [offlineForm, setOfflineForm] = useState({
    clientName: "",
    phone: "+91 ",
    amount: "₹999",
    service: "Strategy call · 30 min",
    time: "10:30 AM",
    paymentMode: "person" as "person" | "pending",
  });

  // Services available for selection
  const serviceOptions = useMemo(() => {
    if (custom.customServices && custom.customServices.length > 0) {
      return custom.customServices.map((s) => `${s.name} · ${s.price}`);
    }
    return [
      "Strategy call · 30 min · ₹999",
      "Website audit · 2 days · ₹4,999",
      "5-page website · 2 weeks · ₹25,000",
      "Monthly support · 4 hours · ₹6,000",
    ];
  }, [custom.customServices]);

  // Calculate day bookings from store
  const dayBookings = useMemo(() => {
    return bookings.filter((b) => b.date === selectedIso);
  }, [bookings, selectedIso]);

  // Get effective slot status
  const getSlotStatus = useCallback(
    (time: string): SlotStatus => {
      // Check if slot has a real booking
      const booked = dayBookings.find((b) => b.time === time || b.time.startsWith(time));
      if (booked) {
        return booked.id.startsWith("b-off-") ? "offline" : "online";
      }
      // Check explicit override
      const dayMap = slotOverrides[selectedIso];
      if (dayMap && dayMap[time]) {
        return dayMap[time];
      }
      // Default pattern
      if (time === "10:30" && selectedDay === 5) return "online";
      if (time === "12:00" && selectedDay === 5) return "offline";
      if (time === "2:00" && selectedDay === 5) return "blocked";
      return "open";
    },
    [dayBookings, slotOverrides, selectedIso, selectedDay],
  );

  // Cycle slot mode on tap: open -> online -> offline -> blocked -> open
  const handleSlotTap = (time: string) => {
    const current = getSlotStatus(time);
    let next: SlotStatus = "open";
    if (current === "open") next = "online";
    else if (current === "online") next = "offline";
    else if (current === "offline") next = "blocked";
    else next = "open";

    setSlotOverrides((prev) => ({
      ...prev,
      [selectedIso]: {
        ...(prev[selectedIso] || {}),
        [time]: next,
      },
    }));

    toast.success(
      next === "open"
        ? `${time} is now Open for all`
        : next === "online"
          ? `${time} marked Online Reserved`
          : next === "offline"
            ? `${time} marked Offline Reserved`
            : `${time} is Blocked`,
    );
  };

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString("en-US", {
    month: "long",
  });

  // Calculate calendar grid days
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = (new Date(currentYear, currentMonth, 1).getDay() + 6) % 7; // Monday = 0

  // Count open and taken slots
  const openCount = BASE_SLOTS.filter((t) => getSlotStatus(t) === "open").length;
  const takenCount = BASE_SLOTS.length - openCount;

  // FREE slots only for offline booking form (PDF Page 47 requirement)
  const freeSlots = useMemo(() => {
    return BASE_SLOTS.filter((t) => {
      const st = getSlotStatus(t);
      return st === "open" || st === "offline";
    });
  }, [getSlotStatus]);

  // Handle saving offline booking
  const handleSaveOffline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlineForm.clientName.trim()) {
      toast.error("Please enter client name");
      return;
    }
    actions.addOfflineBooking({
      traderId: "arjun-mehta",
      serviceId: offlineForm.service,
      date: selectedIso,
      time: offlineForm.time,
      price: offlineForm.amount.replace(/[^\d.]/g, "") || "999",
      clientName: offlineForm.clientName,
      clientPhone: offlineForm.phone,
      notes: offlineForm.paymentMode === "person" ? "Paid in person" : "Not paid yet",
    });

    // Mark slot as offline in local overrides
    setSlotOverrides((prev) => ({
      ...prev,
      [selectedIso]: {
        ...(prev[selectedIso] || {}),
        [offlineForm.time]: "offline",
      },
    }));

    toast.success(`Booking saved for ${offlineForm.clientName}! Slot marked as Offline.`);
    setIsAddingOffline(false);
  };

  const blockDay = () => {
    const allBlocked: Record<string, SlotStatus> = {};
    BASE_SLOTS.forEach((t) => {
      allBlocked[t] = "blocked";
    });
    setSlotOverrides((prev) => ({
      ...prev,
      [selectedIso]: allBlocked,
    }));
    toast.success(`All slots for ${selectedIso} marked as Blocked.`);
  };

  // If adding offline booking on mobile or active, render Page 47 UI
  if (isAddingOffline) {
    return (
      <Shell hideNav hideBottomNav>
        <div className="mx-auto min-h-screen max-w-lg bg-background p-4 sm:p-6 pb-28">
          {/* Header */}
          <div className="flex items-center gap-3 pb-2 border-b border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={() => setIsAddingOffline(false)}
              aria-label="Back"
              className="grid h-10 w-10 place-items-center rounded-full border border-black/10 hover:bg-muted active:scale-95 transition"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Add offline booking
              </h1>
              <p className="text-xs text-muted-foreground">
                For walk-ins, calls and regular clients
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveOffline} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Client name</label>
              <input
                type="text"
                required
                value={offlineForm.clientName}
                onChange={(e) => setOfflineForm({ ...offlineForm, clientName: e.target.value })}
                placeholder="e.g. Ramesh K"
                className="mt-1 h-12 w-full rounded-2xl border border-black/15 bg-background px-4 text-sm font-medium outline-none focus:border-[#5B4DF5] dark:border-white/15"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Phone</label>
                <input
                  type="text"
                  value={offlineForm.phone}
                  onChange={(e) => setOfflineForm({ ...offlineForm, phone: e.target.value })}
                  placeholder="+91 00000 00000"
                  className="mt-1 h-12 w-full rounded-2xl border border-black/15 bg-background px-4 text-sm font-medium outline-none focus:border-[#5B4DF5] dark:border-white/15"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Amount</label>
                <input
                  type="text"
                  value={offlineForm.amount}
                  onChange={(e) => setOfflineForm({ ...offlineForm, amount: e.target.value })}
                  placeholder="₹999"
                  className="mt-1 h-12 w-full rounded-2xl border border-black/15 bg-background px-4 text-sm font-medium outline-none focus:border-[#5B4DF5] dark:border-white/15"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Service</label>
              <select
                value={offlineForm.service}
                onChange={(e) => setOfflineForm({ ...offlineForm, service: e.target.value })}
                className="mt-1 h-12 w-full rounded-2xl border border-black/15 bg-background px-4 text-sm font-medium outline-none focus:border-[#5B4DF5] dark:border-white/15"
              >
                {serviceOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Date</label>
                <div className="mt-1 flex h-12 items-center rounded-2xl border border-black/15 bg-muted/20 px-4 text-sm font-medium dark:border-white/15">
                  {fmtDate(selectedIso)}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Time (Free slots only)
                </label>
                <select
                  value={offlineForm.time}
                  onChange={(e) => setOfflineForm({ ...offlineForm, time: e.target.value })}
                  className="mt-1 h-12 w-full rounded-2xl border border-black/15 bg-background px-4 text-sm font-medium outline-none focus:border-[#5B4DF5] dark:border-white/15"
                >
                  {freeSlots.length > 0 ? (
                    freeSlots.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))
                  ) : (
                    <option value="">No free slots available</option>
                  )}
                </select>
              </div>
            </div>

            {/* Payment Segmented Pills */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-muted-foreground">Payment</label>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/40 p-1 border border-black/5 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setOfflineForm({ ...offlineForm, paymentMode: "person" })}
                  className={cn(
                    "rounded-xl py-2.5 text-xs font-bold transition active:scale-95",
                    offlineForm.paymentMode === "person"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Paid in person
                </button>
                <button
                  type="button"
                  onClick={() => setOfflineForm({ ...offlineForm, paymentMode: "pending" })}
                  className={cn(
                    "rounded-xl py-2.5 text-xs font-bold transition active:scale-95",
                    offlineForm.paymentMode === "pending"
                      ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Not paid yet
                </button>
              </div>
            </div>

            {/* Informational Callout matching PDF Page 47 */}
            <div className="flex items-start gap-2.5 rounded-2xl border border-black/10 bg-muted/20 p-3.5 text-xs text-muted-foreground dark:border-white/10">
              <CalendarIcon className="h-4 w-4 shrink-0 text-foreground mt-0.5" />
              <span>
                This slot closes for online customers and shows as Offline on your calendar.
              </span>
            </div>

            {/* Bottom Floating Bar */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-background/95 p-4 backdrop-blur-md dark:border-white/10">
              <div className="mx-auto flex max-w-lg items-center justify-between gap-4 pb-1">
                <span className="text-xs font-bold text-foreground">
                  {fmtDate(selectedIso)}, {offlineForm.time}
                </span>
                <span className="text-base font-black text-foreground">{offlineForm.amount}</span>
              </div>
              <button
                type="submit"
                className="mt-2 w-full rounded-2xl bg-[#5B4DF5] py-3.5 text-sm font-bold text-white transition hover:bg-[#4F46E5] active:scale-98 shadow-md"
              >
                Save booking
              </button>
            </div>
          </form>
        </div>
      </Shell>
    );
  }

  // Page 46: Availability Calendar View
  return (
    <Shell hideBottomNav>
      <div className="mx-auto max-w-md md:max-w-xl pb-28 pt-2 md:pt-4 px-3 sm:px-4 space-y-5">
        {/* Fixed Top Header */}
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md pt-2 pb-3 border-b border-black/10 dark:border-white/10 -mx-3 sm:-mx-4 px-3 sm:px-4 flex items-center gap-3">
          <Link
            to="/provider/dashboard"
            aria-label="Back"
            className="grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-background hover:bg-muted active:scale-95 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Availability</h1>
            <p className="text-xs text-muted-foreground">
              Tap a day, then tap slots to open or block
            </p>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between px-2 pt-1">
          <button
            type="button"
            onClick={prevMonth}
            className="grid h-9 w-9 place-items-center rounded-full border border-black/10 hover:bg-muted active:scale-95 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-base font-black tracking-tight text-foreground">
            {monthName} {currentYear}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="grid h-9 w-9 place-items-center rounded-full border border-black/10 hover:bg-muted active:scale-95 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day-of-Week Headers */}
        <div className="grid grid-cols-7 text-center text-xs font-bold text-muted-foreground py-1">
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
          <span>S</span>
        </div>

        {/* Calendar Day Grid: Curved Edges Cubes */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isSelected = selectedDay === day;
            // Simulated day statuses matching PDF Page 46
            const isPartly = day === 3 || day === 6 || day === 13 || day === 17;
            const isFully = day === 10 || day === 18;
            const isClosed = day === 1 || day === 8 || day === 15 || day === 22 || day === 29;

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "flex aspect-square w-full flex-col items-center justify-center rounded-2xl text-xs font-bold transition active:scale-95 select-none border shadow-2xs",
                  isSelected
                    ? "bg-[#5B4DF5] text-white border-[#5B4DF5] shadow-md ring-2 ring-[#5B4DF5]/30 font-black"
                    : isPartly
                      ? "border-amber-300 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                      : isFully
                        ? "border-black/20 bg-background text-foreground"
                        : isClosed
                          ? "border-transparent bg-muted/40 text-muted-foreground/60"
                          : "border-emerald-300 bg-emerald-50/70 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
                )}
              >
                <span>{day}</span>
              </button>
            );
          })}
        </div>

        {/* Legend row matching Page 46 */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-[11px] font-semibold text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md border border-emerald-300 bg-emerald-100" />
            <span>Open</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md border border-amber-300 bg-amber-100" />
            <span>Partly booked</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md border border-black/30 bg-background" />
            <span>Fully booked</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-md bg-muted/60" />
            <span>Closed</span>
          </span>
        </div>

        {/* Selected Day Header */}
        <div className="flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/10">
          <span className="text-sm font-black text-foreground">Thu {selectedDay} Nov</span>
          <span className="text-xs font-semibold text-muted-foreground">
            {openCount} open · {takenCount} taken
          </span>
        </div>

        {/* Time Slots Grid (tap to toggle modes) */}
        <div className="grid grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
          {BASE_SLOTS.map((time) => {
            const status = getSlotStatus(time);

            return (
              <button
                key={time}
                type="button"
                onClick={() => handleSlotTap(time)}
                className={cn(
                  "flex flex-col items-center justify-center rounded-2xl p-3 text-xs font-bold transition active:scale-95 border",
                  status === "open" &&
                    "border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
                  status === "online" &&
                    "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black shadow-xs",
                  status === "offline" &&
                    "border-dashed border-black/40 bg-background text-foreground hover:border-black dark:border-white/40",
                  status === "blocked" &&
                    "border-neutral-200 bg-neutral-100 text-neutral-400 line-through dark:bg-neutral-800 dark:border-neutral-700",
                )}
              >
                <span className="text-sm font-black">{time}</span>
                <span className="text-[10px] uppercase font-bold mt-0.5">
                  {status === "open"
                    ? "Open"
                    : status === "online"
                      ? "Online"
                      : status === "offline"
                        ? "Offline"
                        : "Blocked"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Buttons matching Page 46 */}
        <div className="grid grid-cols-2 gap-3 pt-3">
          <button
            type="button"
            onClick={blockDay}
            className="flex items-center justify-center rounded-2xl border border-black/20 bg-background py-3.5 text-xs font-bold text-foreground hover:bg-muted active:scale-95 transition dark:border-white/20"
          >
            Block day
          </button>
          <button
            type="button"
            onClick={() => setIsAddingOffline(true)}
            className="flex items-center justify-center rounded-2xl bg-[#5B4DF5] py-3.5 text-xs font-bold text-white hover:bg-[#4F46E5] active:scale-95 transition shadow-sm"
          >
            Add offline booking
          </button>
        </div>
      </div>
    </Shell>
  );
}
