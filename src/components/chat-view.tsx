import { useState, useRef, useEffect } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  CheckCheck,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  MoreVertical,
  Paperclip,
  Send,
  Smile,
  Tag,
  Video,
  X,
  Ban,
  Pin,
  Trash2,
  ShieldAlert,
  Download,
  Info,
  SmilePlus,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  ChevronRight,
  Star,
} from "lucide-react";
import { actions, useStore, type Message } from "@/lib/store";
import { getTrader, type Trader } from "@/lib/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  auth,
  sendChatMessageToFirestore,
  subscribeToChatMessages,
  markMessageAsReadInFirestore,
  updateMessageReactionsInFirestore,
} from "@/lib/firebase";

const QUICK_EMOJIS = ["👍", "🤝", "❤️", "🔥", "📍", "👏", "💰", "😂", "👋", "🚀", "⚡", "✨"];
const REACTION_EMOJIS = ["👍", "❤️", "😂", "🔥", "👏", "😮", "🚀"];

export type ParsedBookingDetails = {
  bookingId?: string;
  serviceName: string;
  price?: number | string;
  date?: string;
  time?: string;
  address?: string;
  clientName?: string;
  clientPhone?: string;
  notes?: string;
};

function getBookingDetails(m: Message): ParsedBookingDetails | null {
  if (m.bookingDetails) {
    return m.bookingDetails;
  }

  const text = m.text || "";
  const isBookingText =
    m.type === "booking" ||
    text.includes("Booking Request & Details") ||
    text.includes("NEW BOOKING CONFIRMED") ||
    (text.includes("Service:") && (text.includes("Site Address:") || text.includes("Date:")));

  if (!isBookingText) return null;

  const serviceMatch = text.match(/Service:\s*([^\n\r]+)/i);
  const dateMatch = text.match(/Date:\s*([^\n\r]+)/i);
  const timeMatch = text.match(/Time:\s*([^\n\r]+)/i);
  const addrMatch = text.match(/(?:Site Address|Address):\s*([^\n\r]+)/i);
  const clientMatch = text.match(/Client:\s*([^\n\r]+)/i);
  const phoneMatch = text.match(/(?:Contact Phone|Phone):\s*([^\n\r]+)/i);
  const notesMatch = text.match(/Notes:\s*([^\n\r]+)/i);

  return {
    serviceName: serviceMatch ? serviceMatch[1].trim() : "Specialist Service Booking",
    date: dateMatch ? dateMatch[1].trim() : undefined,
    time: timeMatch ? timeMatch[1].trim() : undefined,
    address: addrMatch ? addrMatch[1].trim() : undefined,
    clientName: clientMatch ? clientMatch[1].trim() : "Client",
    clientPhone: phoneMatch ? phoneMatch[1].trim() : undefined,
    notes: notesMatch ? notesMatch[1].trim() : undefined,
  };
}

function BookingCard({
  details,
  isMe,
  traderId,
}: {
  details: ParsedBookingDetails;
  isMe: boolean;
  traderId: string;
}) {
  const bookings = useStore((s) => s.bookings);
  const userRole = useStore((s) => s.userRole);

  const matchedBooking = details.bookingId
    ? bookings.find((b) => b.id === details.bookingId)
    : bookings.find((b) => b.serviceId === details.serviceName && b.traderId === traderId);

  const currentStatus: "Pending" | "Confirmed" | "Rejected" | "Cancelled" =
    matchedBooking?.status ??
    (details.notes?.includes("Confirmed")
      ? "Confirmed"
      : details.notes?.includes("Declined") || details.notes?.includes("Rejected")
        ? "Rejected"
        : "Pending");

  const isPending = currentStatus === "Pending";
  const isConfirmed = currentStatus === "Confirmed";
  const isRejected = currentStatus === "Rejected";

  const isProvider = userRole === "provider";
  const canManage = isProvider && isPending;

  const handleAccept = () => {
    if (matchedBooking) {
      actions.acceptBooking(matchedBooking.id);
    } else {
      actions.send(traderId, {
        text: `✅ Booking Request Accepted! Your appointment for ${details.serviceName} on ${details.date || "the scheduled date"} has been confirmed by the specialist.`,
        type: "booking",
        bookingDetails: {
          ...details,
          notes: "Confirmed by Specialist",
        },
      });
    }
    toast.success("Booking request accepted and confirmed!");
  };

  const handleDecline = () => {
    if (matchedBooking) {
      actions.rejectBooking(matchedBooking.id);
    } else {
      actions.send(traderId, {
        text: `❌ Booking Request Declined. The specialist is unable to accept this booking slot. Please feel free to select another time or discuss in chat.`,
        type: "text",
      });
    }
    toast("Booking request declined");
  };

  return (
    <div
      className={cn(
        "rounded-2xl border p-3.5 sm:p-4 shadow-sm space-y-2.5 max-w-sm sm:max-w-md w-full text-left transition-all",
        isConfirmed &&
          (isMe
            ? "border-emerald-600/35 bg-emerald-50/70 dark:bg-emerald-950/25 dark:border-emerald-500/30"
            : "border-black/15 bg-card dark:border-white/15"),
        isPending &&
          "border-amber-500/35 bg-amber-50/70 dark:bg-amber-950/20 dark:border-amber-500/30",
        isRejected &&
          "border-rose-500/30 bg-rose-50/70 dark:bg-rose-950/20 dark:border-rose-500/30",
      )}
    >
      {/* Top Banner / Badge */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "grid h-7 w-7 place-items-center rounded-xl text-white shadow-xs shrink-0",
              isConfirmed && "bg-emerald-600",
              isPending && "bg-amber-600",
              isRejected && "bg-rose-600",
            )}
          >
            {isConfirmed && <CheckCircle2 className="h-4 w-4" />}
            {isPending && <Clock className="h-4 w-4" />}
            {isRejected && <X className="h-4 w-4" />}
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-foreground">
              {isConfirmed
                ? "Confirmed Booking"
                : isPending
                  ? "Booking Request"
                  : "Declined Request"}
            </p>
            <p className="text-[10px] text-muted-foreground">Order verified on Zifily</p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
            isConfirmed && "bg-emerald-600/15 text-emerald-800 dark:text-emerald-300",
            isPending && "bg-amber-500/20 text-amber-900 dark:text-amber-300",
            isRejected && "bg-rose-500/20 text-rose-800 dark:text-rose-300",
          )}
        >
          {isConfirmed && <CheckCircle2 className="h-3 w-3" />}
          {isPending && <Clock className="h-3 w-3" />}
          {isRejected && <X className="h-3 w-3" />}
          {isConfirmed ? "Confirmed" : isPending ? "Pending Review" : "Declined"}
        </span>
      </div>

      {/* Service Title & Price */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Service Booked
          </p>
          <p className="text-xs sm:text-sm font-extrabold text-foreground truncate">
            {details.serviceName}
          </p>
        </div>
        {details.price && (
          <span className="shrink-0 text-xs sm:text-sm font-black text-foreground rounded-lg bg-black/5 dark:bg-white/10 px-2.5 py-1">
            {typeof details.price === "number" ? `£${details.price}` : details.price}
          </span>
        )}
      </div>

      {/* Appointment Information Card Details */}
      <div className="rounded-xl bg-background/90 p-2.5 sm:p-3 border border-black/10 dark:border-white/10 space-y-2 text-xs shadow-2xs">
        {details.date && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-foreground shrink-0" />
            <span className="font-bold text-foreground">{details.date}</span>
            {details.time && (
              <span className="font-semibold text-muted-foreground">• {details.time}</span>
            )}
          </div>
        )}
        {details.address && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-foreground shrink-0 mt-0.5" />
            <span className="text-foreground leading-snug">{details.address}</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/5 dark:border-white/5 text-[11px]">
          {details.clientName && (
            <div className="flex items-center gap-1.5 truncate">
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate text-foreground font-semibold">{details.clientName}</span>
            </div>
          )}
          {details.clientPhone && (
            <a
              href={`tel:${details.clientPhone}`}
              className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold hover:underline truncate"
            >
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{details.clientPhone}</span>
            </a>
          )}
        </div>
        {details.notes && (
          <div className="pt-2 border-t border-black/5 dark:border-white/5 text-[11px] text-muted-foreground">
            <span className="font-bold text-foreground">Special Notes: </span>
            <span>{details.notes}</span>
          </div>
        )}
      </div>

      {/* Accept / Decline Action Buttons STRICTLY for Provider on Pending Requests */}
      {isPending && canManage && (
        <div className="flex gap-2 pt-1 border-t border-black/10 dark:border-white/10">
          <button
            type="button"
            onClick={handleAccept}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 active:scale-95 transition shadow-2xs"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Accept Request</span>
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50/60 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 active:scale-95 transition dark:bg-rose-950/20 dark:border-rose-900 dark:text-rose-300"
          >
            <X className="h-3.5 w-3.5" />
            <span>Decline</span>
          </button>
        </div>
      )}

      {/* Client View while pending: informational message */}
      {isPending && !isProvider && (
        <div className="flex items-center gap-2 pt-1 border-t border-black/10 dark:border-white/10 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
          <Clock className="h-3.5 w-3.5 shrink-0 animate-pulse text-amber-600 dark:text-amber-400" />
          <span>Awaiting specialist confirmation</span>
        </div>
      )}

      {/* Card Action: View in Bookings */}
      <div className="pt-1 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>
          {isConfirmed
            ? "Confirmed appointment"
            : isPending
              ? "Awaiting specialist review"
              : "Request closed"}
        </span>
        <Link
          to="/bookings"
          className="inline-flex items-center gap-1 rounded-xl bg-black px-2.5 py-1 text-[11px] font-bold text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/90 active:scale-95 transition shadow-2xs"
        >
          <span>Bookings</span>
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function ReviewRequestCard({
  msg,
  traderId,
  isMe,
}: {
  msg: Message;
  traderId: string;
  isMe: boolean;
}) {
  const reviewedProviders = useStore((s) => s.reviewedProviders);
  const alreadyReviewed = reviewedProviders?.includes(traderId);
  const isSubmitted = msg.reviewRequest?.status === "submitted" || alreadyReviewed;

  const [rating, setRating] = useState(msg.reviewRequest?.submittedRating || 5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (alreadyReviewed) {
      toast.info("You have already reviewed this specialist.");
      return;
    }
    setIsSubmitting(true);
    actions.submitChatReview(traderId, msg.id, rating, comment.trim());
    toast.success("Review & Rating submitted! Updated on profile.");
    setIsSubmitting(false);
  };

  return (
    <div className="rounded-2xl border border-black/15 bg-card p-4 shadow-sm space-y-3 max-w-sm sm:max-w-md w-full text-left dark:border-white/15">
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-amber-500 text-white shadow-xs shrink-0">
            <Star className="h-4 w-4 fill-white" />
          </span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-foreground">
              Review &amp; Rating Request
            </p>
            <p className="text-[10px] text-muted-foreground truncate">
              {msg.reviewRequest?.traderName || "Specialist Provider"}
            </p>
          </div>
        </div>
        {isSubmitted ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" /> Submitted
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
            Pending
          </span>
        )}
      </div>

      {isSubmitted ? (
        <div className="rounded-xl bg-muted/40 p-3 text-center space-y-2 border border-black/5 dark:border-white/5">
          <div className="flex justify-center items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={cn(
                  "h-5 w-5",
                  s <= (msg.reviewRequest?.submittedRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-neutral-300 dark:text-neutral-700",
                )}
              />
            ))}
          </div>
          {msg.reviewRequest?.submittedText && (
            <p className="text-xs italic text-foreground">
              &ldquo;{msg.reviewRequest.submittedText}&rdquo;
            </p>
          )}
          <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            ✓ Rating &amp; Review recorded! Updated on public service profile.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="rounded-xl bg-muted/30 p-3 text-center border border-black/5 dark:border-white/5">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Tap to Rate
            </p>
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => {
                const active = (hoverRating ?? rating) >= s;
                return (
                  <button
                    key={s}
                    type="button"
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(s)}
                    className="p-1 transition hover:scale-115 active:scale-95"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition-colors",
                        active
                          ? "fill-amber-400 text-amber-400"
                          : "text-neutral-300 dark:text-neutral-700",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Leave a short comment (punctuality, craft, quality)..."
              className="w-full rounded-xl border border-black/15 bg-background p-2.5 text-xs outline-none focus:border-black dark:border-white/15 dark:focus:border-white"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-black py-2.5 text-xs font-bold text-white hover:bg-black/90 active:scale-95 transition dark:bg-white dark:text-black shadow-xs disabled:opacity-40"
          >
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>Submit Review</span>
          </button>
        </form>
      )}
    </div>
  );
}

export function ChatView({
  traderId,
  isSidebar = false,
  onClose,
}: {
  traderId: string;
  isSidebar?: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();
  const t = getTrader(traderId);
  const msgs = useStore((s) => s.chats[traderId] ?? []);
  const pinnedChats = useStore((s) => s.pinnedChats);
  const blockedChats = useStore((s) => s.blockedChats);
  const isOtherTyping = useStore((s) => s.typingStatus[traderId] ?? false);
  const isPinned = pinnedChats.includes(traderId);
  const isBlocked = blockedChats.includes(traderId);

  const [text, setText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSpecialistInfo, setShowSpecialistInfo] = useState(false);
  const [activeReactionMsgId, setActiveReactionMsgId] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [pickType, setPickType] = useState<"image" | "video" | "file">("image");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const profile = useStore((s) => s.profile);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationAddressInput, setLocationAddressInput] = useState("");
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const handleShareLocation = (
    locAddress: string,
    lat?: number,
    lng?: number,
    postcode?: string,
  ) => {
    if (!locAddress.trim()) return;
    const finalAddress = locAddress.trim();
    actions.send(traderId, {
      text: `📍 Shared Location: ${finalAddress}`,
      type: "location",
      location: {
        address: finalAddress,
        latitude: lat ?? 51.5074,
        longitude: lng ?? -0.1278,
        postcode:
          postcode || (finalAddress.match(/[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}/i)?.[0] ?? "UK"),
        mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(finalAddress)}`,
      },
    });

    if (auth.currentUser) {
      sendChatMessageToFirestore({
        conversationId: traderId,
        senderId: auth.currentUser.uid,
        recipientId: traderId,
        text: `📍 Shared Location: ${finalAddress}`,
        type: "location",
      }).catch(console.warn);
    }

    toast.success("Location shared in chat!");
    setShowLocationPicker(false);
    setShowAttachMenu(false);
  };

  const handleGetGPS = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your device");
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingLocation(false);
        const { latitude, longitude } = pos.coords;
        const coordsStr = `${latitude.toFixed(4)}° N, ${Math.abs(longitude).toFixed(4)}° ${longitude < 0 ? "W" : "E"}`;
        const autoAddr = profile.address
          ? `${profile.address} (GPS: ${coordsStr})`
          : `Current GPS Location (${coordsStr})`;
        setLocationAddressInput(autoAddr);
        toast.success("Device GPS coordinates located!");
      },
      () => {
        setIsDetectingLocation(false);
        if (profile.address) {
          setLocationAddressInput(profile.address);
          toast.info("Using saved profile address");
        } else {
          setLocationAddressInput("Covent Garden, London WC2E 8HD");
          toast.info("Defaulting to central London address");
        }
      },
      { timeout: 8000, enableHighAccuracy: true },
    );
  };

  // Subscribe to Firestore realtime messages & reactions
  useEffect(() => {
    if (!traderId) return;
    const unsub = subscribeToChatMessages(traderId, (firestoreMsgs) => {
      firestoreMsgs.forEach((fm) => {
        const id = fm["id"] as string | undefined;
        if (id) {
          if (!fm["read"]) {
            markMessageAsReadInFirestore(id);
          }
        }
      });
    });
    return () => {
      if (unsub) unsub();
    };
  }, [traderId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
    actions.markChatAsRead(traderId);
  }, [traderId, msgs.length, isOtherTyping]);

  if (!t) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground text-xs">
        Select a conversation from the left to start chatting.
      </div>
    );
  }

  const handleSend = async () => {
    if (!text.trim() || isBlocked) return;
    const msgText = text.trim();
    setText("");
    setShowEmojiPicker(false);

    // Optimistic local update
    actions.send(traderId, msgText);

    // Sync to Firestore in background
    if (auth.currentUser) {
      try {
        await sendChatMessageToFirestore({
          conversationId: traderId,
          senderId: auth.currentUser.uid,
          recipientId: traderId,
          text: msgText,
          type: "text",
        });
      } catch (err) {
        console.warn("Could not sync message to Firestore", err);
      }
    }
  };

  const handleToggleReaction = async (msgId: string, emoji: string) => {
    actions.toggleReaction(traderId, msgId, emoji);
    setActiveReactionMsgId(null);

    // Find current reactions and sync to Firestore
    const currentMsg = msgs.find((m) => m.id === msgId);
    const existingReactions = { ...(currentMsg?.reactions || {}) };
    existingReactions[emoji] = (existingReactions[emoji] || 0) + 1;

    try {
      await updateMessageReactionsInFirestore(msgId, existingReactions);
    } catch (err) {
      console.warn("Could not sync reaction to Firestore", err);
    }
  };

  const handlePickFile = (type: "image" | "video" | "file") => {
    setShowAttachMenu(false);
    setPickType(type);
    if (fileInputRef.current) {
      if (type === "image") {
        fileInputRef.current.accept = "image/*";
      } else if (type === "video") {
        fileInputRef.current.accept = "video/*";
      } else {
        fileInputRef.current.accept = ".pdf,.doc,.docx,.txt,application/pdf";
      }
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isBlocked) return;

    const sizeStr =
      file.size > 1024 * 1024
        ? (file.size / (1024 * 1024)).toFixed(1) + " MB"
        : Math.round(file.size / 1024) + " KB";

    const isImg = pickType === "image" || file.type.startsWith("image/");
    const isVid = pickType === "video" || file.type.startsWith("video/");

    // Use FileReader for persistent Base64 Data URL so images display across sessions
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;

      if (isImg) {
        actions.send(traderId, {
          text: `Sent photo: ${file.name}`,
          type: "image",
          mediaType: "image",
          mediaUrl: dataUrl,
          fileName: file.name,
          fileSize: sizeStr,
        });
        toast.success("Photo attachment sent");

        if (auth.currentUser && dataUrl.length < 900000) {
          sendChatMessageToFirestore({
            conversationId: traderId,
            senderId: auth.currentUser.uid,
            recipientId: traderId,
            text: `Sent photo: ${file.name}`,
            type: "image",
            mediaType: "image",
            mediaUrl: dataUrl,
            fileName: file.name,
            fileSize: sizeStr,
          }).catch(console.warn);
        }
      } else if (isVid) {
        const objectUrl = URL.createObjectURL(file);
        actions.send(traderId, {
          text: `Sent video: ${file.name}`,
          type: "file",
          mediaType: "video",
          mediaUrl: objectUrl,
          fileName: file.name,
          fileSize: sizeStr,
        });
        toast.success("Video message sent");
      } else {
        actions.send(traderId, {
          text: `Sent document: ${file.name}`,
          type: "file",
          mediaType: "pdf",
          mediaUrl: dataUrl,
          fileName: file.name,
          fileSize: sizeStr,
        });
        toast.success("Document attached");
      }
    };

    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div className="flex h-full flex-col bg-background text-foreground overflow-hidden">
      {/* Top Header with Back Button, Specialist Info & Action Menu */}
      <div className="flex h-14 items-center justify-between border-b border-black/10 px-3 sm:px-4 bg-background/95 backdrop-blur-md shadow-2xs z-10 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            aria-label="Back to conversations"
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                router.history.back();
              }
            }}
            className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 hover:bg-muted active:scale-95 transition dark:border-white/10 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Provider Clickable Header */}
          <div
            onClick={() => setShowSpecialistInfo(true)}
            className="flex items-center gap-2.5 min-w-0 cursor-pointer group hover:opacity-90 transition"
          >
            <div className="relative shrink-0">
              <img
                src={t.photo}
                alt={t.name}
                className="h-9 w-9 rounded-full object-cover border border-black/10 dark:border-white/10"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-background" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-xs truncate leading-tight group-hover:underline">
                  {t.name}
                </p>
                {isPinned && <Pin className="h-2.5 w-2.5 text-muted-foreground shrink-0" />}
              </div>
              <p className="text-[10px] text-muted-foreground truncate">
                {t.title} •{" "}
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Active now
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Action icons & More Menu */}
        <div className="flex items-center gap-1.5 relative shrink-0">
          <button
            aria-label="Chat options"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="grid h-8 w-8 place-items-center rounded-xl hover:bg-muted transition"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {/* More Menu Dropdown */}
          {showMoreMenu && (
            <div
              className="absolute right-0 top-10 z-40 w-48 rounded-2xl border border-black/10 bg-background p-1.5 shadow-2xl dark:border-white/10 animate-in fade-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  actions.togglePinChat(traderId);
                  setShowMoreMenu(false);
                  toast.success(isPinned ? "Unpinned from top" : "Pinned to top 📌");
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-muted text-left"
              >
                <Pin className="h-3.5 w-3.5" />
                <span>{isPinned ? "Unpin Chat" : "Pin Conversation"}</span>
              </button>

              <button
                onClick={() => {
                  actions.toggleBlockChat(traderId);
                  setShowMoreMenu(false);
                  toast(isBlocked ? "Specialist unblocked" : "Specialist blocked 🚫");
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-muted text-left"
              >
                <Ban className="h-3.5 w-3.5" />
                <span>{isBlocked ? "Unblock Specialist" : "Block Specialist"}</span>
              </button>

              <button
                onClick={() => {
                  setShowSpecialistInfo(true);
                  setShowMoreMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-muted text-left"
              >
                <Info className="h-3.5 w-3.5" />
                <span>View Profile & Rates</span>
              </button>

              <button
                onClick={() => {
                  actions.sendReviewCard(traderId, t?.name);
                  setShowMoreMenu(false);
                  toast.success("Review & Rating card sent to chat!");
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-muted text-left"
              >
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span>Request Review Card</span>
              </button>

              <div className="my-1 border-t border-black/5 dark:border-white/5" />

              <button
                onClick={() => {
                  actions.deleteChatForMe(traderId);
                  setShowMoreMenu(false);
                  if (onClose) onClose();
                  toast.success("Chat deleted for you");
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete for me</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Blocked banner notice */}
      {isBlocked && (
        <div className="flex items-center justify-between bg-rose-500/10 px-4 py-2 border-b border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            <span className="font-semibold">You have blocked this specialist.</span>
          </div>
          <button
            onClick={() => {
              actions.toggleBlockChat(traderId);
              toast.success("Specialist unblocked");
            }}
            className="font-bold underline hover:opacity-80"
          >
            Unblock
          </button>
        </div>
      )}

      {/* Messages Timeline */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 no-scrollbar">
        {msgs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground text-xs">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-muted/60 mb-2">
              <Smile className="h-6 w-6" />
            </div>
            <p className="font-semibold text-foreground">Direct Chat with {t.name}</p>
            <p className="text-[11px] mt-0.5 max-w-xs text-muted-foreground">
              Send messages, attach project briefs, or make custom price offers in realtime.
            </p>
          </div>
        )}

        {msgs.map((m) => {
          const bDetails = getBookingDetails(m);
          return (
            <div
              key={m.id}
              className={cn(
                "group/msg relative flex items-end gap-2",
                m.from === "me" && "justify-end",
              )}
            >
              {m.from === "them" && (
                <img
                  src={t.photo}
                  alt=""
                  className="h-7 w-7 rounded-full object-cover shrink-0 border border-black/10"
                />
              )}

              <div className="relative max-w-[85%] sm:max-w-[70%]">
                {/* Floating Emoji Reaction Trigger Button (visible on hover or tap) */}
                <div
                  className={cn(
                    "absolute -top-3 z-10 hidden group-hover/msg:flex items-center gap-1",
                    m.from === "me" ? "right-2" : "left-2",
                  )}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActiveReactionMsgId(activeReactionMsgId === m.id ? null : m.id)
                    }
                    className="grid h-6 w-6 place-items-center rounded-full bg-background border border-black/10 text-muted-foreground shadow-sm hover:text-foreground hover:scale-110 active:scale-95 transition dark:border-white/10"
                    title="Add reaction"
                  >
                    <SmilePlus className="h-3 w-3" />
                  </button>
                </div>

                {/* Reaction Emojis Picker Popup */}
                {activeReactionMsgId === m.id && (
                  <div
                    className={cn(
                      "absolute -top-10 z-30 flex items-center gap-1 rounded-full border border-black/10 bg-background/95 px-2 py-1 shadow-xl backdrop-blur-md dark:border-white/10 animate-in fade-in zoom-in-95",
                      m.from === "me" ? "right-0" : "left-0",
                    )}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleToggleReaction(m.id, emoji)}
                        className="text-sm p-1 hover:scale-125 active:scale-95 transition"
                      >
                        {emoji}
                      </button>
                    ))}
                    <button
                      onClick={() => setActiveReactionMsgId(null)}
                      className="p-1 text-muted-foreground hover:text-foreground ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {/* Booking Card if message is booking, else other message types */}
                {bDetails ? (
                  <BookingCard details={bDetails} isMe={m.from === "me"} traderId={traderId} />
                ) : m.type === "review_request" || m.reviewRequest ? (
                  <ReviewRequestCard msg={m} traderId={traderId} isMe={m.from === "me"} />
                ) : m.type === "offer" ? (
                  <div
                    className={cn(
                      "rounded-2xl border p-3.5 shadow-sm space-y-2",
                      m.from === "me"
                        ? "border-emerald-600/30 bg-emerald-50/50 dark:bg-emerald-950/20"
                        : "border-black/15 bg-card",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <Tag className="h-3 w-3" /> Rate Proposal
                      </span>
                      <span
                        className={cn(
                          "rounded-md px-1.5 py-0.5 text-[9px] font-bold uppercase",
                          m.offerStatus === "accepted"
                            ? "bg-emerald-600 text-white"
                            : m.offerStatus === "declined"
                              ? "bg-rose-500 text-white"
                              : "bg-amber-500/20 text-amber-700 dark:text-amber-300",
                        )}
                      >
                        {m.offerStatus || "Pending"}
                      </span>
                    </div>

                    <p className="text-base font-extrabold text-foreground">{m.offerPrice}</p>
                    {m.text && <p className="text-xs text-muted-foreground">{m.text}</p>}

                    {/* Accept / Decline Buttons */}
                    {m.from === "them" && m.offerStatus === "pending" && (
                      <div className="flex gap-2 pt-1 border-t border-black/10 dark:border-white/10">
                        <button
                          onClick={() => {
                            actions.respondToOffer(traderId, m.id, "accepted");
                            toast.success("Offer accepted!");
                          }}
                          className="flex-1 rounded-lg bg-emerald-600 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => {
                            actions.respondToOffer(traderId, m.id, "declined");
                            toast("Offer declined");
                          }}
                          className="flex-1 rounded-lg border border-black/15 py-1.5 text-xs font-bold text-foreground hover:bg-muted transition"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                ) : m.type === "image" && m.mediaUrl ? (
                  /* Image Attachment with Lightbox Zoom */
                  <div
                    onClick={() => setLightboxImage(m.mediaUrl || null)}
                    className={cn(
                      "rounded-2xl overflow-hidden border border-black/10 shadow-xs cursor-pointer group relative",
                      m.from === "me" ? "bg-black text-white" : "bg-card text-foreground",
                    )}
                  >
                    <img
                      src={m.mediaUrl}
                      alt={m.fileName || "attachment"}
                      className="max-h-64 w-full object-cover transition-transform group-hover:scale-[1.02]"
                    />
                    {m.text && (
                      <p className="p-2.5 text-xs font-medium border-t border-black/10 dark:border-white/10">
                        {m.text}
                      </p>
                    )}
                  </div>
                ) : m.mediaType === "video" && m.mediaUrl ? (
                  /* Native Video Player Attachment */
                  <div
                    className={cn(
                      "rounded-2xl overflow-hidden border border-black/10 shadow-xs max-w-sm",
                      m.from === "me" ? "bg-black text-white" : "bg-card text-foreground",
                    )}
                  >
                    <video
                      src={m.mediaUrl}
                      controls
                      playsInline
                      className="max-h-60 w-full rounded-t-2xl bg-black object-cover"
                    />
                    <div className="p-2.5 flex items-center justify-between text-xs">
                      <span className="truncate font-semibold">{m.fileName || "Video"}</span>
                      <span className="text-[10px] opacity-75">{m.fileSize || "Video file"}</span>
                    </div>
                  </div>
                ) : m.type === "file" ? (
                  /* Document / PDF Attachment */
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-3 text-xs shadow-xs",
                      m.from === "me"
                        ? "border-black/20 bg-black text-white dark:bg-white dark:text-black"
                        : "border-black/10 bg-muted/60 text-foreground",
                    )}
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/20">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold truncate text-xs">{m.fileName || "Document"}</p>
                      <p className="text-[10px] opacity-75">{m.fileSize || "Attachment"}</p>
                    </div>
                    {m.mediaUrl && (
                      <a
                        href={m.mediaUrl}
                        download={m.fileName || "attachment"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-white/20 px-2.5 py-1 text-[11px] font-bold hover:bg-white/30 flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        <span>Open</span>
                      </a>
                    )}
                  </div>
                ) : m.type === "location" || m.location ? (
                  /* Dedicated Location Sharing Card */
                  <div
                    className={cn(
                      "rounded-2xl border p-3.5 text-xs shadow-xs space-y-2.5 max-w-sm w-full",
                      m.from === "me"
                        ? "border-black/20 bg-black text-white dark:bg-white dark:text-black"
                        : "border-black/10 bg-card text-foreground",
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-xl",
                          m.from === "me"
                            ? "bg-white/15 text-white dark:bg-black/10 dark:text-black"
                            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                        )}
                      >
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                            Shared Location
                          </p>
                          {m.location?.postcode && (
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider",
                                m.from === "me"
                                  ? "bg-white/20 text-white dark:bg-black/15 dark:text-black"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {m.location.postcode}
                            </span>
                          )}
                        </div>
                        <p className="font-bold text-xs mt-0.5 leading-snug">
                          {m.location?.address || m.text}
                        </p>
                        {m.location?.latitude && m.location?.longitude && (
                          <p className="text-[10px] opacity-70 mt-0.5 font-mono">
                            {m.location.latitude.toFixed(4)}° N,{" "}
                            {Math.abs(m.location.longitude).toFixed(4)}° W
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions: Open in Google Maps & Copy Address */}
                    <div
                      className={cn(
                        "flex items-center gap-2 pt-2 border-t",
                        m.from === "me"
                          ? "border-white/15 dark:border-black/15"
                          : "border-black/10 dark:border-white/10",
                      )}
                    >
                      <a
                        href={
                          m.location?.mapUrl ||
                          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            m.location?.address || m.text || "London, UK",
                          )}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-1.5 text-[11px] font-bold transition active:scale-95 shadow-2xs",
                          m.from === "me"
                            ? "bg-white text-black hover:bg-white/90 dark:bg-black dark:text-white"
                            : "bg-black text-white hover:bg-black/85 dark:bg-white dark:text-black",
                        )}
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Open Maps</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => {
                          const addr = m.location?.address || m.text;
                          navigator.clipboard.writeText(addr);
                          toast.success("Address copied to clipboard");
                        }}
                        className={cn(
                          "rounded-xl px-2.5 py-1.5 text-[11px] font-bold border transition active:scale-95",
                          m.from === "me"
                            ? "border-white/25 hover:bg-white/15 dark:border-black/25"
                            : "border-black/10 hover:bg-muted dark:border-white/10",
                        )}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Standard Message Bubble */
                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2 text-xs leading-relaxed",
                      m.from === "me"
                        ? "rounded-br-xs bg-black text-white dark:bg-white dark:text-black shadow-xs font-medium"
                        : "rounded-bl-xs bg-muted text-foreground border border-black/5 dark:border-white/5",
                    )}
                  >
                    {m.text}
                  </div>
                )}

                {/* Message Emoji Reactions List (Persisted across reloads) */}
                {m.reactions && Object.entries(m.reactions).some(([_, count]) => count > 0) && (
                  <div
                    className={cn(
                      "flex flex-wrap items-center gap-1 mt-1",
                      m.from === "me" ? "justify-end" : "justify-start",
                    )}
                  >
                    {Object.entries(m.reactions).map(
                      ([emoji, count]) =>
                        count > 0 && (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => handleToggleReaction(m.id, emoji)}
                            className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-card px-2 py-0.5 text-[11px] font-bold shadow-2xs hover:scale-105 active:scale-95 transition dark:border-white/10"
                          >
                            <span>{emoji}</span>
                            <span className="text-[10px] text-muted-foreground">{count}</span>
                          </button>
                        ),
                    )}
                  </div>
                )}

                {/* Timestamp and Read Receipts */}
                <div
                  className={cn(
                    "mt-1 flex items-center gap-1 text-[10px] text-muted-foreground",
                    m.from === "me" && "justify-end",
                  )}
                >
                  <span>
                    {new Date(m.at).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {m.from === "me" && (
                    <span title={m.read ? "Read by specialist" : "Sent"}>
                      {m.read ? (
                        <CheckCheck className="h-3.5 w-3.5 text-sky-500 font-bold" />
                      ) : (
                        <Check className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Real-Time 'Typing...' Indicator */}
        {isOtherTyping && (
          <div className="flex items-center gap-2 pt-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <img
              src={t.photo}
              alt={t.name}
              className="h-7 w-7 rounded-full object-cover border border-black/10 shrink-0"
            />
            <div className="flex items-center gap-2 rounded-2xl bg-muted/80 px-3 py-1.5 border border-black/5 dark:border-white/5 shadow-2xs">
              <span className="text-[11px] font-semibold text-foreground">
                {t.name.split(" ")[0]} is typing
              </span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce" />
              </span>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Hidden File Picker Input */}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      {/* Quick Emojis Bar */}
      {showEmojiPicker && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 border-t border-black/10 bg-muted/30 overflow-x-auto no-scrollbar animate-in slide-in-from-bottom-2 shrink-0">
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setText((prev) => prev + emoji)}
              className="text-base p-1 hover:scale-125 transition active:scale-95"
            >
              {emoji}
            </button>
          ))}
          <button
            onClick={() => setShowEmojiPicker(false)}
            className="ml-auto text-muted-foreground p-1 hover:text-foreground shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Attachment Popover */}
      {showAttachMenu && (
        <div className="mx-3 mb-1 grid grid-cols-5 gap-1 sm:gap-2 rounded-2xl border border-black/10 bg-card p-2.5 shadow-xl dark:border-white/10 animate-in slide-in-from-bottom-2 shrink-0">
          <button
            type="button"
            onClick={() => handlePickFile("image")}
            className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-xl hover:bg-muted text-center text-[10px] font-semibold"
          >
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-500/10 text-blue-600">
              <ImageIcon className="h-4 w-4" />
            </div>
            <span>Photo</span>
          </button>

          <button
            type="button"
            onClick={() => handlePickFile("video")}
            className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-xl hover:bg-muted text-center text-[10px] font-semibold"
          >
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-purple-500/10 text-purple-600">
              <Video className="h-4 w-4" />
            </div>
            <span>Video</span>
          </button>

          <button
            type="button"
            onClick={() => handlePickFile("file")}
            className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-xl hover:bg-muted text-center text-[10px] font-semibold"
          >
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/10 text-amber-600">
              <FileText className="h-4 w-4" />
            </div>
            <span>PDF/Doc</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setLocationAddressInput(profile.address || "");
              setShowLocationPicker(true);
              setShowAttachMenu(false);
            }}
            className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-xl hover:bg-muted text-center text-[10px] font-semibold"
          >
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <MapPin className="h-4 w-4" />
            </div>
            <span>Location</span>
          </button>

          <button
            type="button"
            onClick={() => {
              actions.sendReviewCard(traderId, t?.name);
              setShowAttachMenu(false);
              toast.success("Review & Rating card sent in chat!");
            }}
            className="flex flex-col items-center gap-1 p-1.5 sm:p-2 rounded-xl hover:bg-muted text-center text-[10px] font-semibold"
          >
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Star className="h-4 w-4 fill-amber-500/30" />
            </div>
            <span>Review</span>
          </button>
        </div>
      )}

      {/* Input Form Bar: Firmly anchored at bottom */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 border-t border-black/10 p-2.5 bg-background shadow-xs pb-[calc(0.75rem+env(safe-area-inset-bottom))] shrink-0 sticky bottom-0 z-20"
      >
        <button
          type="button"
          aria-label="Add attachment"
          onClick={() => {
            setShowAttachMenu(!showAttachMenu);
            setShowEmojiPicker(false);
          }}
          disabled={isBlocked}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-black/10 hover:bg-muted active:scale-95 transition dark:border-white/10 disabled:opacity-40"
        >
          <Paperclip className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex h-9 flex-1 items-center gap-2 rounded-xl border border-black/15 bg-muted/20 px-3 transition focus-within:border-black dark:border-white/15 dark:focus-within:border-white">
          <button
            type="button"
            aria-label="Pick emoji"
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowAttachMenu(false);
            }}
            className="text-muted-foreground hover:text-foreground transition shrink-0"
          >
            <Smile className="h-4 w-4" />
          </button>

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isBlocked}
            placeholder={
              isBlocked ? "Contact blocked" : `Message ${t.name.split(" ")[0]} or attach brief...`
            }
            className="w-full bg-transparent text-xs font-medium outline-none placeholder:text-muted-foreground disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          aria-label="Send message"
          disabled={!text.trim() || isBlocked}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-black text-white hover:bg-black/90 active:scale-95 transition disabled:opacity-30 dark:bg-white dark:text-black"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

      {/* Specialist Quick Info Modal */}
      {showSpecialistInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowSpecialistInfo(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-black/10 bg-background p-5 shadow-2xl dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm">Specialist Details</h3>
              <button
                onClick={() => setShowSpecialistInfo(false)}
                className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="pt-4 text-center">
              <img
                src={t.photo}
                alt={t.name}
                className="h-20 w-20 rounded-2xl mx-auto object-cover border border-black/10 shadow-sm"
              />
              <h4 className="mt-2.5 text-base font-extrabold">{t.name}</h4>
              <p className="text-xs text-muted-foreground font-medium">{t.title}</p>
              <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                Hourly Rate: {t.hourlyRate}
              </p>

              <div className="mt-4 flex gap-2">
                <Link
                  to="/trader/$id"
                  params={{ id: traderId }}
                  className="flex-1 rounded-xl bg-black py-2.5 text-xs font-semibold text-white dark:bg-white dark:text-black text-center"
                >
                  View Full Profile
                </Link>
                <Link
                  to="/book/$id"
                  params={{ id: traderId }}
                  className="flex-1 rounded-xl border border-black/15 py-2.5 text-xs font-semibold text-center hover:bg-muted"
                >
                  Book Specialist
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Location Picker & Share Modal */}
      {showLocationPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowLocationPicker(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl border border-black/10 bg-background p-5 shadow-2xl dark:border-white/10 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Share Location</h3>
                  <p className="text-[10px] text-muted-foreground">
                    Send site address to {t.name.split(" ")[0]}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationPicker(false)}
                className="grid h-7 w-7 place-items-center rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 1-Tap GPS Detect */}
            <div className="space-y-2">
              <button
                type="button"
                disabled={isDetectingLocation}
                onClick={handleGetGPS}
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-muted/40 py-2.5 px-3 text-xs font-bold hover:bg-muted transition active:scale-98 disabled:opacity-60 dark:border-white/10"
              >
                <MapPin
                  className={cn(
                    "h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400",
                    isDetectingLocation && "animate-spin",
                  )}
                />
                <span>
                  {isDetectingLocation
                    ? "Detecting GPS coordinates..."
                    : "Detect Current GPS Location"}
                </span>
              </button>

              {profile.address && (
                <button
                  type="button"
                  onClick={() => setLocationAddressInput(profile.address)}
                  className="w-full text-left truncate rounded-xl border border-black/10 bg-card p-2 text-[11px] hover:border-black/30 dark:border-white/10"
                >
                  <span className="font-bold block text-muted-foreground text-[10px] uppercase">
                    Saved Profile Address
                  </span>
                  <span className="truncate block font-medium">{profile.address}</span>
                </button>
              )}
            </div>

            {/* Custom Address Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                Address or Postcode
              </label>
              <textarea
                value={locationAddressInput}
                onChange={(e) => setLocationAddressInput(e.target.value)}
                rows={3}
                placeholder="e.g. Flat 4B, 18 Great Portland St, London W1W 8QP"
                className="w-full rounded-xl border border-black/15 bg-muted/20 p-2.5 text-xs font-medium outline-none focus:border-black dark:border-white/15 dark:focus:border-white"
              />
            </div>

            {/* Send CTA */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowLocationPicker(false)}
                className="flex-1 rounded-xl border border-black/15 py-2.5 text-xs font-bold hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!locationAddressInput.trim()}
                onClick={() => handleShareLocation(locationAddressInput)}
                className="flex-1 rounded-xl bg-black py-2.5 text-xs font-bold text-white hover:bg-black/90 active:scale-98 transition disabled:opacity-30 dark:bg-white dark:text-black shadow-xs"
              >
                Share in Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            aria-label="Close image"
            className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Preview"
            className="max-h-[85vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
