import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Calendar, Clock, User, Phone, MapPin } from "lucide-react";
import { Shell } from "@/components/app-ui";
import { useStore, actions, type Booking } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/provider/offline-booking")({
  head: () => ({
    meta: [
      { title: "Record Offline Booking | Zifily" },
      {
        name: "description",
        content: "Add offline, direct or telephone walk-in bookings to lock availability.",
      },
    ],
  }),
  component: OfflineBookingPage,
});

const ALL_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
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

export function OfflineBookingPage() {
  const router = useRouter();
  const bookings = useStore((s) => s.bookings);

  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    serviceName: "Direct Consultation",
    price: "1500",
    date: new Date().toISOString().slice(0, 10),
    time: "10:00",
    address: "On-site / Client Address",
    paymentMode: "person" as "person" | "pending",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.clientName.trim()) {
      toast.error("Please enter client name");
      return;
    }

    const newBooking: Booking = {
      id: `b-off-${Date.now()}`,
      traderId: "james-wilson",
      serviceId: form.serviceName.trim() || "Offline Booking",
      date: form.date,
      time: form.time,
      status: "Confirmed",
      address: form.address.trim() || "Direct client booking",
      clientName: form.clientName.trim(),
      clientPhone: form.clientPhone.trim(),
      price: form.price.trim(),
      notes:
        form.paymentMode === "person"
          ? `Paid in person. ${form.notes}`.trim()
          : `Payment pending. ${form.notes}`.trim(),
      createdAt: new Date().toISOString(),
    };

    actions.book(newBooking);
    toast.success(`Booking saved for ${form.clientName}! Slot locked.`);
    router.navigate({ to: "/provider/dashboard" });
  };

  return (
    <Shell hideBottomNav>
      <div className="mx-auto max-w-lg px-3 sm:px-6 py-4 md:py-8 space-y-6">
        {/* Header with Back button */}
        <div className="flex items-center gap-3 border-b pb-4">
          <button
            type="button"
            onClick={() => router.history.back()}
            className="grid h-10 w-10 place-items-center rounded-xl border border-black/10 bg-background shadow-xs hover:bg-muted active:scale-95 transition dark:border-white/10"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Add offline booking
            </h1>
            <p className="text-xs text-muted-foreground">For walk-ins, calls and regular clients</p>
          </div>
        </div>

        {/* Full Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-foreground block mb-1">Client Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                required
                placeholder="e.g. John Harrington"
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                className="h-11 w-full rounded-2xl border border-black/15 bg-muted/20 pl-9 pr-3 text-sm outline-none focus:border-black dark:border-white/15"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="Optional"
                  value={form.clientPhone}
                  onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
                  className="h-11 w-full rounded-2xl border border-black/15 bg-muted/20 pl-9 pr-3 text-sm outline-none focus:border-black dark:border-white/15"
                />
              </div>
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Agreed Price (₹)</label>
              <input
                type="text"
                required
                placeholder="e.g. 1500"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="h-11 w-full rounded-2xl border border-black/15 bg-muted/20 px-3 text-sm outline-none focus:border-black dark:border-white/15"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-foreground block mb-1">Date</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="h-11 w-full rounded-2xl border border-black/15 bg-muted/20 px-3 text-sm outline-none focus:border-black dark:border-white/15"
              />
            </div>
            <div>
              <label className="font-bold text-foreground block mb-1">Time Slot</label>
              <select
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="h-11 w-full rounded-2xl border border-black/15 bg-muted/20 px-3 text-sm outline-none focus:border-black dark:border-white/15"
              >
                {ALL_SLOTS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">Service Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Consultation & Strategy Session"
              value={form.serviceName}
              onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
              className="h-11 w-full rounded-2xl border border-black/15 bg-muted/20 px-3 text-sm outline-none focus:border-black dark:border-white/15"
            />
          </div>

          <div>
            <label className="font-bold text-foreground block mb-1">
              Client Address / Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="e.g. Studio, Office or Client premise"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="h-11 w-full rounded-2xl border border-black/15 bg-muted/20 pl-9 pr-3 text-sm outline-none focus:border-black dark:border-white/15"
              />
            </div>
          </div>

          {/* Payment Status Segmented Pills */}
          <div className="space-y-1 pt-1">
            <label className="font-bold text-foreground block mb-1">Payment Status</label>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted/40 p-1 border border-black/5 dark:border-white/5">
              <button
                type="button"
                onClick={() => setForm({ ...form, paymentMode: "person" })}
                className={cn(
                  "rounded-xl py-2.5 text-xs font-bold transition active:scale-95",
                  form.paymentMode === "person"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Paid in person
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, paymentMode: "pending" })}
                className={cn(
                  "rounded-xl py-2.5 text-xs font-bold transition active:scale-95",
                  form.paymentMode === "pending"
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Not paid yet
              </button>
            </div>
          </div>

          {/* Callout */}
          <div className="flex items-start gap-2.5 rounded-2xl border border-black/10 bg-muted/20 p-3.5 text-xs text-muted-foreground dark:border-white/10">
            <Calendar className="h-4 w-4 shrink-0 text-foreground mt-0.5" />
            <span>
              This appointment locks the slot immediately so online clients cannot double-book.
            </span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#5B4DF5] font-bold text-sm text-white hover:bg-[#4F46E5] active:scale-98 shadow-md transition"
            >
              <Check className="h-4 w-4" />
              <span>Confirm Offline Booking &amp; Lock Slot</span>
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
