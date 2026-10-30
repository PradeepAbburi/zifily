import { AlertTriangle, Calendar, Clock, MapPin, Wrench, X } from "lucide-react";
import type { Booking } from "@/lib/store";
import { fmtDate, timeRange } from "@/lib/store";

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  booking?: Booking | null;
  traderName?: string;
  serviceName?: string;
  isProvider?: boolean;
}

export function CancelBookingModal({
  isOpen,
  onClose,
  onConfirm,
  booking,
  traderName,
  serviceName,
  isProvider = false,
}: CancelBookingModalProps) {
  if (!isOpen) return null;

  const displayService = serviceName || booking?.serviceId || "Service Appointment";
  const displayDate = booking?.date ? fmtDate(booking.date) : "Scheduled Date";
  const displayTime = booking?.time ? timeRange(booking.time) : "Scheduled Time";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl border border-black/10 bg-background p-5 shadow-2xl dark:border-white/10 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-black/10 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Cancel Booking?</h3>
              <p className="text-[10px] text-muted-foreground">Confirmation required</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-3.5 space-y-3 text-xs">
          <p className="text-muted-foreground leading-relaxed text-[11px]">
            Are you sure you want to cancel this booking? This will mark the appointment as{" "}
            <b className="text-rose-600 dark:text-rose-400">Cancelled</b> in the database and notify{" "}
            {isProvider ? "the client" : "the specialist"} directly in chat.
          </p>

          {/* Booking Summary Box */}
          <div className="rounded-2xl border border-black/10 bg-muted/30 p-3 space-y-2 dark:border-white/10 text-xs">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Wrench className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{displayService}</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5 truncate">
                <Calendar className="h-3 w-3 shrink-0 text-foreground" />
                <span className="truncate">{displayDate}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Clock className="h-3 w-3 shrink-0 text-foreground" />
                <span className="truncate">{displayTime}</span>
              </div>
            </div>

            {booking?.address && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate border-t border-black/5 dark:border-white/5 pt-1.5">
                <MapPin className="h-3 w-3 shrink-0 text-foreground" />
                <span className="truncate">{booking.address}</span>
              </div>
            )}

            {traderName && !isProvider && (
              <p className="text-[10px] text-muted-foreground">
                Specialist: <b className="text-foreground">{traderName}</b>
              </p>
            )}
            {booking?.clientName && isProvider && (
              <p className="text-[10px] text-muted-foreground">
                Client: <b className="text-foreground">{booking.clientName}</b>
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons: Tall, High-contrast */}
        <div className="flex gap-2 pt-2 border-t border-black/5 dark:border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-black/15 text-xs font-bold text-foreground hover:bg-muted active:scale-95 transition dark:border-white/15"
          >
            Keep Booking
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 h-11 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 active:scale-95 transition shadow-sm"
          >
            Yes, Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
}
