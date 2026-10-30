import { createFileRoute, notFound, useNavigate, useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Check,
  X,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Camera,
  Image as ImageIcon,
  HelpCircle,
  ArrowLeft,
  Circle,
} from "lucide-react";
import { Shell, TopBar } from "@/components/app-ui";
import { boilerImg, getTrader } from "@/lib/data";
import {
  actions,
  fmtDate,
  timeRange,
  useStore,
  isSlotBooked,
  type FormBlock,
  DEFAULT_BOOKING_FORM_BLOCKS,
} from "@/lib/store";
import { InteractiveClientInput } from "@/components/draggable-form-editor";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { auth, saveBookingToFirestore, sendChatMessageToFirestore } from "@/lib/firebase";
import confetti from "canvas-confetti";

export const Route = createFileRoute("/book/$id")({
  validateSearch: (s: Record<string, unknown>): { service?: string | undefined } => ({
    service: typeof s["service"] === "string" ? (s["service"] as string) : undefined,
  }),
  loader: ({ params }) => {
    if (!getTrader(params.id)) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Book a Specialist | Zifily" },
      { name: "description", content: "Choose a date and time to book your expert on Zifily." },
      { property: "og:title", content: "Book a Specialist | Zifily" },
      { property: "og:description", content: "Pick a date, time and confirm your booking." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Book,
});

const slots = {
  Morning: ["08:00", "08:30", "09:00", "10:00", "10:30", "11:00"],
  Afternoon: ["12:00", "12:30", "13:00", "14:00", "14:30", "15:00", "15:30"],
  Evening: ["16:00", "16:30", "17:00", "17:30", "18:30", "19:00"],
};

// Deterministic availability
const availability = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  const day = d.getDay();
  if (day === 0) return "none";
  return d.getDate() % 7 === 3 ? "none" : d.getDate() % 5 === 0 ? "limited" : "available";
};

const slotTaken = (iso: string, t: string) =>
  (Number(iso.slice(-2)) + Number(t.slice(0, 2)) + Number(t.slice(3))) % 4 === 0;

const isoOf = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const fmt24 = (t: string) => {
  const [h = 0, m = 0] = t.split(":").map(Number);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

function Book() {
  const { id } = Route.useParams();
  const { service } = Route.useSearch();
  const t = getTrader(id)!;
  const navigate = useNavigate();
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const allBookings = useStore((s) => s.bookings);
  const intakeConfig = useStore((s) => s.providerCustomization.intakeConfig);

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState(service ?? t.services[0]!.id);
  const [address, setAddress] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  // Dynamic Provider Intake Responses
  const [problemDesc, setProblemDesc] = useState("");
  const [urgency, setUrgency] = useState(
    intakeConfig.urgencyOptions?.[1] || "Standard (this week)",
  );
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [intakeSectionPage, setIntakeSectionPage] = useState(0);
  const [customBlockAnswers, setCustomBlockAnswers] = useState<Record<string, unknown>>({});

  const formBlocks = useMemo(() => {
    return (intakeConfig.formBlocks && intakeConfig.formBlocks.length > 0)
      ? intakeConfig.formBlocks
      : DEFAULT_BOOKING_FORM_BLOCKS;
  }, [intakeConfig.formBlocks]);

  const sectionPages = useMemo(() => {
    const result: { sectionBlock?: FormBlock; blocks: FormBlock[]; pageIndex: number }[] = [];
    let currentBlocks: FormBlock[] = [];
    let currentSection: FormBlock | undefined = undefined;

    for (const b of formBlocks) {
      if (b.type === "section") {
        if (currentBlocks.length > 0 || currentSection) {
          result.push({
            sectionBlock: currentSection,
            blocks: currentBlocks,
            pageIndex: result.length,
          });
          currentBlocks = [];
        }
        currentSection = b;
      } else {
        currentBlocks.push(b);
      }
    }
    if (currentBlocks.length > 0 || currentSection) {
      result.push({
        sectionBlock: currentSection,
        blocks: currentBlocks,
        pageIndex: result.length,
      });
    }
    return result.length > 0 ? result : [{ blocks: formBlocks, pageIndex: 0 }];
  }, [formBlocks]);

  const svc = t.services.find((s) => s.id === serviceId) ?? t.services[0]!;
  const addr = address ?? profile.address;

  const handleDetectGPS = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your device");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        const coordsStr = `${latitude.toFixed(4)}° N, ${Math.abs(longitude).toFixed(4)}° ${longitude < 0 ? "W" : "E"}`;
        const detected = profile.address
          ? `${profile.address} (GPS: ${coordsStr})`
          : `Current Location (${coordsStr}), UK`;
        setAddress(detected);
        toast.success("Location set from device GPS!");
      },
      () => {
        setIsLocating(false);
        if (profile.address) {
          setAddress(profile.address);
          toast.info("Using saved profile address");
        } else {
          setAddress("10 Downing Street, Westminster, London SW1A 2AA");
          toast.info("Defaulted to standard UK address");
        }
      },
      { timeout: 7000, enableHighAccuracy: true },
    );
  };

  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const offset = (first.getDay() + 6) % 7;
    const days = new Date(view.y, view.m + 1, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  }, [view]);

  const shift = (n: number) =>
    setView((v) => {
      const d = new Date(v.y, v.m + n, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  const canPrev = view.y > today.getFullYear() || view.m > today.getMonth();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessCelebration, setShowSuccessCelebration] = useState(false);
  const [createdBid, setCreatedBid] = useState<string | null>(null);

  const confirm = async () => {
    const bid = actions.addBooking({
      traderId: id,
      serviceId: svc.id,
      date: date!,
      time: time!,
      address: addr,
      notes: [
        notes,
        problemDesc ? `[Scope]: ${problemDesc}` : "",
        urgency ? `[Timeline]: ${urgency}` : "",
      ]
        .filter(Boolean)
        .join(" • "),
      status: "Pending",
      price: svc.price,
      clientName: profile.name || auth.currentUser?.displayName || "Client",
      clientPhone: profile.phone || "+44 7700 900123",
      intake: {
        problemHeading: intakeConfig.problemHeading,
        problemDescription: problemDesc,
        urgency,
        images: uploadedPhotos,
        accessNotes: notes,
        customAnswers: customBlockAnswers,
      },
    });
    setCreatedBid(bid);

    // Save booking to Firestore as Pending request
    if (auth.currentUser) {
      try {
        await saveBookingToFirestore({
          bookingId: bid,
          clientId: auth.currentUser.uid,
          providerId: id,
          serviceTitle: svc.name,
          date: date!,
          time: time!,
          address: addr,
          status: "Pending",
          notes,
          price: svc.price,
        });
      } catch (err) {
        console.warn("Could not sync booking to Firestore", err);
      }
    }

    // Auto-send full booking details to provider in chat as structured Booking Request Card
    const clientName = profile.name || auth.currentUser?.displayName || "Client";
    const clientPhone = profile.phone || "+44 7700 900123";
    const bookingDetails = {
      bookingId: bid,
      serviceName: svc.name,
      price: svc.price,
      date: fmtDate(date!),
      time: timeRange(time),
      address: addr,
      clientName,
      clientPhone,
      notes: notes || undefined,
    };
    const bookingChatMsg = `📅 New Booking Request & Details:\n• Service: ${svc.name}\n• Date: ${fmtDate(date!)}\n• Time: ${timeRange(time)}\n• Site Address: ${addr}\n• Client: ${clientName}\n• Contact Phone: ${clientPhone}${notes ? `\n• Notes: ${notes}` : ""}\n• Status: Pending Specialist Confirmation\n\nLooking forward to your confirmation!`;

    actions.send(id, {
      text: bookingChatMsg,
      type: "booking",
      bookingDetails,
    });
    if (auth.currentUser) {
      try {
        await sendChatMessageToFirestore({
          conversationId: id,
          senderId: auth.currentUser.uid,
          recipientId: id,
          text: bookingChatMsg,
          type: "booking",
        });
      } catch (err) {
        console.warn("Could not sync booking chat message to Firestore", err);
      }
    }

    // Show celebratory confetti and white tick on green circle
    setShowConfirmModal(false);
    setShowSuccessCelebration(true);

    confetti({
      particleCount: 110,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#10b981", "#34d399", "#059669", "#6ee7b7", "#ffffff", "#000000"],
    });

    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 250);
  };

  return (
    <Shell hideNav>
      <div className="mx-auto max-w-md pb-24 md:pb-8 text-xs">
        {/* Step Indicator */}
        <div className="px-4 pt-2">
          <div className="flex items-center justify-between pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Step {step + 1} of 3
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground">
              {step === 0 ? "Select Date" : step === 1 ? "Select Time" : "Confirm Booking"}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[0, 1, 2].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-1 rounded-full transition-colors",
                  step >= s ? "bg-black dark:bg-white" : "bg-black/10 dark:border-white/10",
                )}
              />
            ))}
          </div>
        </div>

        {/* STEP 0: DATE SELECTION */}
        {step === 0 && (
          <>
            <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-black/10 dark:border-white/10 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => router.history.back()}
                  aria-label="Back"
                  className="grid h-8 w-8 place-items-center rounded-xl border border-black/10 hover:bg-muted dark:border-white/10 shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-foreground truncate">
                  Book with {t.name}
                </h1>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground shrink-0 uppercase tracking-wider">
                Step 1/3
              </span>
            </div>
            <div className="px-4 space-y-3">
              {/* Compact Services selector */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Service Package
                </p>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {t.services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setServiceId(s.id)}
                      className={cn(
                        "shrink-0 rounded-xl border px-2.5 py-1 text-xs font-semibold transition active:scale-95",
                        s.id === svc.id
                          ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                          : "border-black/15 bg-card hover:bg-muted dark:border-white/15",
                      )}
                    >
                      {s.name} • £{s.price}
                    </button>
                  ))}
                </div>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between pt-1">
                <h2 className="text-sm font-bold text-foreground">
                  {new Date(view.y, view.m).toLocaleDateString("en-GB", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <div className="flex gap-1">
                  <button
                    aria-label="Previous month"
                    disabled={!canPrev}
                    onClick={() => shift(-1)}
                    className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 hover:bg-muted disabled:opacity-30 dark:border-white/10"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    aria-label="Next month"
                    onClick={() => shift(1)}
                    className="grid h-7 w-7 place-items-center rounded-lg border border-black/10 hover:bg-muted dark:border-white/10"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Compact Calendar Grid */}
              <div className="rounded-2xl border border-black/10 bg-card p-2.5 shadow-2xs dark:border-white/10">
                <div className="grid grid-cols-7 gap-y-1 text-center">
                  {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                    <span key={d} className="pb-1 text-[10px] font-bold text-muted-foreground">
                      {d}
                    </span>
                  ))}
                  {cells.map((d, i) => {
                    if (!d) return <span key={i} />;
                    const iso = isoOf(view.y, view.m, d);
                    const past = new Date(iso + "T00:00:00") < today;
                    const a = past ? "none" : availability(iso);
                    const isSelected = date === iso;

                    return (
                      <button
                        key={i}
                        disabled={a === "none"}
                        onClick={() => {
                          setDate(iso);
                          setTime(null);
                        }}
                        className="flex flex-col items-center py-0.5 disabled:opacity-25"
                      >
                        <span
                          className={cn(
                            "grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full text-xs font-semibold transition",
                            isSelected
                              ? "bg-black text-white dark:bg-white dark:text-black shadow-xs font-bold"
                              : "hover:bg-muted text-foreground",
                          )}
                        >
                          {d}
                        </span>
                        <span
                          className={cn(
                            "mt-0.5 h-1 w-1 rounded-full",
                            !past &&
                              (a === "available"
                                ? "bg-emerald-500"
                                : a === "limited"
                                  ? "bg-amber-400"
                                  : "bg-rose-400"),
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Availability Legend */}
              <div className="flex items-center justify-between px-1 text-[10px] text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Available
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Limited Slots
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                  Unavailable
                </span>
              </div>
            </div>

            {/* Bottom Floating CTA */}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-background/95 p-3 backdrop-blur-md pb-[calc(0.8rem+env(safe-area-inset-bottom))] dark:border-white/10 md:static md:mt-4 md:border-0 md:bg-transparent md:p-0">
              <button
                disabled={!date}
                onClick={() => setStep(1)}
                className="flex h-13 sm:h-14 w-full items-center justify-center gap-2 rounded-2xl bg-black text-sm sm:text-base font-bold text-white transition hover:bg-black/85 active:scale-[0.99] disabled:opacity-35 shadow-md dark:bg-white dark:text-black"
              >
                Continue to Time Selection &rarr;
              </button>
            </div>
          </>
        )}

        {/* STEP 1: TIME SELECTION */}
        {step === 1 && date && (
          <>
            <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-black/10 dark:border-white/10 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  aria-label="Back"
                  className="grid h-8 w-8 place-items-center rounded-xl border border-black/10 hover:bg-muted dark:border-white/10 shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-foreground truncate">
                  Select Time Slot
                </h1>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground shrink-0 uppercase tracking-wider">
                Step 2/3
              </span>
            </div>
            <div className="px-4 space-y-3.5">
              <div className="flex items-center justify-between rounded-xl bg-muted/40 p-2.5 border border-black/5 dark:border-white/5">
                <div>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">
                    Chosen Date
                  </p>
                  <p className="text-xs font-bold text-foreground mt-0.5">{fmtDate(date)}</p>
                </div>
                <button
                  onClick={() => setStep(0)}
                  className="text-[11px] font-bold text-sky-600 dark:text-sky-400 underline"
                >
                  Change Date
                </button>
              </div>

              {Object.entries(slots).map(([group, list]) => (
                <div key={group} className="space-y-1.5">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {group}
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                    {list.map((s) => {
                      const dateModes = useStore.getState().slotReservationModes[date] || {};
                      const isOfflineReserved = dateModes[s] === "offline_reserved";
                      const isBlocked = dateModes[s] === "blocked";
                      const taken =
                        slotTaken(date, s) ||
                        isSlotBooked(allBookings, id, date, s) ||
                        isOfflineReserved ||
                        isBlocked;
                      const isSelected = time === s;

                      return (
                        <button
                          key={s}
                          disabled={taken}
                          onClick={() => setTime(s)}
                          className={cn(
                            "h-8 sm:h-9 rounded-xl text-xs font-semibold transition active:scale-95 border",
                            isSelected
                              ? "bg-black text-white dark:bg-white dark:text-black border-transparent shadow-xs"
                              : taken
                                ? "bg-muted/30 text-muted-foreground/40 line-through border-transparent cursor-not-allowed"
                                : "bg-card border-black/10 hover:border-black text-foreground dark:border-white/10",
                          )}
                        >
                          {fmt24(s)}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Floating CTA */}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-background/95 p-3 backdrop-blur-md pb-[calc(0.8rem+env(safe-area-inset-bottom))] dark:border-white/10 md:static md:mt-4 md:border-0 md:bg-transparent md:p-0">
              <button
                disabled={!time}
                onClick={() => setStep(2)}
                className="flex h-11 sm:h-12 w-full items-center justify-center gap-2 rounded-2xl bg-black text-xs sm:text-sm font-bold text-white transition hover:bg-black/85 active:scale-[0.99] disabled:opacity-35 shadow-md dark:bg-white dark:text-black"
              >
                Continue &rarr;
              </button>
            </div>
          </>
        )}

        {/* STEP 2: REVIEW & CONFIRM */}
        {step === 2 && date && time && (
          <>
            <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-black/10 dark:border-white/10 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  aria-label="Back"
                  className="grid h-8 w-8 place-items-center rounded-xl border border-black/10 hover:bg-muted dark:border-white/10 shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <h1 className="text-sm sm:text-base font-black tracking-tight text-foreground truncate">
                  Review &amp; Confirm
                </h1>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground shrink-0 uppercase tracking-wider">
                Step 3/3
              </span>
            </div>
            <div className="px-4 space-y-3">
              {/* Compact Provider & Service Preview Card */}
              <div className="flex items-center gap-2.5 rounded-2xl border border-black/10 bg-card p-2.5 shadow-2xs dark:border-white/10">
                <img
                  src={boilerImg}
                  alt=""
                  className="h-12 w-12 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs truncate text-foreground">{svc.name}</p>
                    <span className="font-extrabold text-xs text-foreground">£{svc.price}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">{svc.desc}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                    Expert: {t.name}
                  </p>
                </div>
              </div>

              {/* Compact Booking Summary Details */}
              <div className="divide-y divide-black/5 rounded-2xl border border-black/10 bg-card dark:divide-white/5 dark:border-white/10 p-2 shadow-2xs space-y-1">
                <div className="flex items-center justify-between py-2 px-1">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Date</p>
                      <p className="font-bold text-xs">{fmtDate(date)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(0)}
                    className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="flex items-center justify-between py-2 px-1">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Time Slot
                      </p>
                      <p className="font-bold text-xs">{timeRange(time)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 underline"
                  >
                    Edit
                  </button>
                </div>

                <div className="py-2.5 px-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">
                        Service Address &amp; Job Site
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isLocating}
                      onClick={handleDetectGPS}
                      className="inline-flex items-center gap-1 rounded-lg border border-black/10 bg-muted/40 px-2 py-0.5 text-[10px] font-bold text-foreground hover:bg-muted active:scale-95 transition dark:border-white/10"
                    >
                      <MapPin
                        className={cn(
                          "h-3 w-3 text-emerald-600 dark:text-emerald-400",
                          isLocating && "animate-spin",
                        )}
                      />
                      <span>{isLocating ? "Locating..." : "Use GPS"}</span>
                    </button>
                  </div>

                  <input
                    value={addr}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full site address (e.g. 24 Kensington High St, London W8 4PT)..."
                    className="h-9 w-full rounded-xl border border-black/15 bg-muted/20 px-3 text-xs font-medium outline-none focus:border-black dark:border-white/15 dark:focus:border-white transition"
                  />

                  {/* Coverage confirmation indicator */}
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
                    <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                      <Check className="h-3 w-3" />
                      Within {t.name.split(" ")[0]}'s travel zone
                    </span>
                    {profile.address && addr !== profile.address && (
                      <button
                        type="button"
                        onClick={() => setAddress(profile.address)}
                        className="text-[10px] font-bold underline hover:text-foreground"
                      >
                        Reset to Profile Address
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Dynamic Multi-Step Intake Form Configured by Provider */}
              {intakeConfig.enabled && (
                <div className="space-y-3">
                  {/* Progress Header when divided into sections */}
                  {sectionPages.length > 1 && (
                    <div className="rounded-2xl border border-black/10 bg-card p-3 shadow-2xs dark:border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
                          Intake Progress
                        </span>
                        <span className="text-foreground">
                          Step {intakeSectionPage + 1} of {sectionPages.length}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black dark:bg-white transition-all duration-300"
                          style={{
                            width: `${((intakeSectionPage + 1) / sectionPages.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Current Section Card Header */}
                  <div className="overflow-hidden rounded-2xl border border-black/10 bg-card shadow-2xs dark:border-white/10">
                    <div className="h-2 w-full bg-black dark:bg-white" />
                    <div className="p-3 sm:p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-xs sm:text-sm text-foreground">
                          {sectionPages[intakeSectionPage]?.sectionBlock?.title ||
                            intakeConfig.heading ||
                            "Intake & Project Specifications"}
                        </h3>
                        <span className="rounded-md bg-black/10 dark:bg-white/10 px-2 py-0.5 text-[10px] font-bold text-foreground">
                          {sectionPages[intakeSectionPage]?.sectionBlock?.sectionBadge ||
                            `Page ${intakeSectionPage + 1} of ${sectionPages.length}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        {sectionPages[intakeSectionPage]?.sectionBlock?.description ||
                          intakeConfig.subheading ||
                          "Please provide project specifics to prepare tooling, schedules, and materials."}
                      </p>
                    </div>
                  </div>

                  {/* Current Section Blocks */}
                  <div className="space-y-2.5">
                    {sectionPages[intakeSectionPage]?.blocks.map((block) => (
                      <div
                        key={block.id}
                        className="rounded-2xl border border-black/10 bg-card p-3 shadow-2xs dark:border-white/10 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-foreground block">
                            {block.title}
                            {block.required && <span className="text-rose-500 ml-0.5">*</span>}
                          </label>
                          {block.required && (
                            <span className="text-[10px] font-semibold text-rose-500">Required</span>
                          )}
                        </div>
                        {block.description && (
                          <p className="text-[10px] text-muted-foreground">{block.description}</p>
                        )}
                        <InteractiveClientInput
                          block={block}
                          value={customBlockAnswers[block.id]}
                          onChange={(val) =>
                            setCustomBlockAnswers((prev) => ({ ...prev, [block.id]: val }))
                          }
                        />
                      </div>
                    ))}
                  </div>

                  {/* Multi-Section Page Navigation Controls */}
                  {sectionPages.length > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        disabled={intakeSectionPage === 0}
                        onClick={() => setIntakeSectionPage((p) => Math.max(0, p - 1))}
                        className="rounded-xl border border-black/10 bg-card px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition dark:border-white/10"
                      >
                        &larr; Previous Page
                      </button>

                      {intakeSectionPage < sectionPages.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => {
                            // Quick validation for required blocks on current section
                            const currentBlocks = sectionPages[intakeSectionPage]?.blocks || [];
                            const missingRequired = currentBlocks.find(
                              (b) => b.required && !customBlockAnswers[b.id],
                            );
                            if (missingRequired) {
                              toast.error(`Please answer: "${missingRequired.title}"`);
                              return;
                            }
                            setIntakeSectionPage((p) => Math.min(sectionPages.length - 1, p + 1));
                          }}
                          className="flex items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white hover:bg-black/85 transition dark:bg-white dark:text-black shadow-xs"
                        >
                          <span>
                            {sectionPages[intakeSectionPage]?.sectionBlock?.nextButtonLabel ||
                              "Next Page"}
                          </span>
                          &rarr;
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <Check className="h-4 w-4" />
                          <span>All Intake Sections Ready</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Compact Intake Notes */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Notes for Specialist (Optional)
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Mention access codes, parking, or specific issues..."
                  className="w-full rounded-xl border border-black/15 bg-muted/20 p-2 text-xs outline-none focus:border-black dark:border-white/15"
                />
              </div>
            </div>

            {/* Bottom Floating CTA */}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/10 bg-background/95 p-3 backdrop-blur-md pb-[calc(0.8rem+env(safe-area-inset-bottom))] dark:border-white/10 md:static md:mt-4 md:border-0 md:bg-transparent md:p-0">
              <button
                disabled={!addr.trim()}
                onClick={() => setShowConfirmModal(true)}
                className="flex h-13 sm:h-14 w-full items-center justify-center gap-2 rounded-2xl bg-black text-sm sm:text-base font-bold text-white transition hover:bg-black/85 active:scale-[0.99] disabled:opacity-35 shadow-md dark:bg-white dark:text-black"
              >
                <Check className="h-5 w-5" />
                <span>Confirm &amp; Lock Visit</span>
              </button>
            </div>
          </>
        )}

        {/* Confirmation Modal: Ask for Confirmation Before Booking */}
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="w-full max-w-sm rounded-3xl border border-black/10 bg-background p-5 shadow-2xl dark:border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-3 border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-bold text-sm">Confirm Booking</h3>
                </div>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="py-3 space-y-2.5 text-xs">
                <p className="text-muted-foreground">
                  Please review and confirm your appointment with{" "}
                  <b className="text-foreground">{t.name}</b>:
                </p>

                <div className="rounded-2xl border border-black/10 bg-muted/30 p-3 space-y-1.5 dark:border-white/10 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service:</span>
                    <span className="font-bold text-foreground text-right">{svc.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-semibold text-foreground">{fmtDate(date!)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Slot:</span>
                    <span className="font-semibold text-foreground">{timeRange(time)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Address:</span>
                    <span className="font-medium text-foreground truncate max-w-[180px]">
                      {addr}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rate:</span>
                    <span className="font-bold text-emerald-600">
                      {svc.price ? `£${svc.price}` : "Free Quote"}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Your address and contact details will be automatically sent to {t.name}'s chat
                  inbox for coordination.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 h-12 rounded-2xl border border-black/15 text-xs sm:text-sm font-semibold hover:border-black active:scale-95 transition dark:border-white/15 dark:hover:border-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirm}
                  className="flex-1 h-12 rounded-2xl bg-black text-xs sm:text-sm font-bold text-white hover:bg-black/90 active:scale-95 transition dark:bg-white dark:text-black"
                >
                  Yes, Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Celebratory Success Modal: Animated White Tick on Green Circle with Confetti */}
        {showSuccessCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div
              className="w-full max-w-sm rounded-3xl border border-black/10 bg-background p-6 shadow-2xl text-center dark:border-white/10 animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Animated White Tick on Green Circle */}
              <div className="relative mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 shadow-xl shadow-emerald-500/30 animate-in zoom-in-50 duration-500">
                {/* Ping wave */}
                <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-30 pointer-events-none" />

                {/* Animated White Tick SVG */}
                <svg
                  className="h-13 w-13 text-white drop-shadow-md"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h3 className="mt-4 text-lg font-black tracking-tight text-foreground">
                Booking Request Sent!
              </h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Your appointment request and details have been sent to{" "}
                <b className="text-foreground">{t.name}</b>. The specialist can accept or decline
                the request directly in chat.
              </p>

              <div className="mt-5 space-y-2.5">
                <button
                  onClick={() => navigate({ to: "/chat/$id", params: { id } })}
                  className="flex h-13 sm:h-14 w-full items-center justify-center gap-2 rounded-2xl bg-black text-sm font-bold text-white hover:bg-black/90 active:scale-95 transition dark:bg-white dark:text-black"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Open Chat with {t.name.split(" ")[0]}</span>
                </button>

                <button
                  onClick={() =>
                    createdBid
                      ? navigate({ to: "/confirmed/$bid", params: { bid: createdBid } })
                      : navigate({ to: "/bookings" })
                  }
                  className="flex h-12 sm:h-13 w-full items-center justify-center rounded-2xl border border-black/15 text-xs sm:text-sm font-semibold hover:border-black active:scale-95 transition dark:border-white/15 dark:hover:border-white"
                >
                  View Booking Order
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
