import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell,
  Calendar,
  MessageSquare,
  CheckCircle2,
  ShieldCheck,
  Trash2,
  ArrowLeft,
  CheckCheck,
} from "lucide-react";
import { Shell } from "@/components/app-ui";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications & Alerts | Zifily" },
      {
        name: "description",
        content: "View all your booking alerts, messages, and updates on Zifily.",
      },
    ],
  }),
  component: NotificationsPage,
});

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "booking" | "message" | "system" | "verified";
  isRead: boolean;
};

const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Booking Confirmed",
    description:
      "Your session with Alex Chen (Full Stack Developer) has been confirmed for tomorrow at 2:00 PM.",
    time: "10 mins ago",
    type: "booking",
    isRead: false,
  },
  {
    id: "notif-2",
    title: "New Message",
    description: "Elena Rostova sent you a design preview link for the landing page project.",
    time: "1 hour ago",
    type: "message",
    isRead: false,
  },
  {
    id: "notif-3",
    title: "Identity & Skills Verified",
    description:
      "Your Zifily professional badge is now active. You are now prioritized in search results.",
    time: "Yesterday",
    type: "verified",
    isRead: true,
  },
  {
    id: "notif-4",
    title: "Service Completed",
    description: "Sarah Miller marked the Deep Cleaning visit as completed. Please leave a review.",
    time: "2 days ago",
    type: "booking",
    isRead: true,
  },
  {
    id: "notif-5",
    title: "System Update",
    description: "Zifily location matching is now updated with real-time radius map selection.",
    time: "3 days ago",
    type: "system",
    isRead: true,
  },
];

function NotificationsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<"all" | "unread" | "booking" | "message">("all");

  const unreadCount = items.filter((i) => !i.isRead).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
    toast.success("All notifications marked as read");
  };

  const clearAll = () => {
    setItems([]);
    toast.success("Notifications cleared");
  };

  const toggleRead = (id: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, isRead: !i.isRead } : i)));
  };

  const filtered = items.filter((i) => {
    if (filter === "unread") return !i.isRead;
    if (filter === "booking") return i.type === "booking";
    if (filter === "message") return i.type === "message";
    return true;
  });

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "booking":
        return <Calendar className="h-4 w-4 text-black dark:text-white" />;
      case "message":
        return <MessageSquare className="h-4 w-4 text-black dark:text-white" />;
      case "verified":
        return <ShieldCheck className="h-4 w-4 text-black dark:text-white" />;
      default:
        return <Bell className="h-4 w-4 text-black dark:text-white" />;
    }
  };

  return (
    <Shell hideNav>
      <div className="mx-auto max-w-2xl px-3 sm:px-4 md:px-6 pt-3 pb-24 md:pt-6 md:pb-12">
        {/* Header with back button, proper lettering, two ticks icon for mark as read */}
        <div className="flex items-center justify-between border-b border-black/10 pb-3 dark:border-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => router.history.back()}
              aria-label="Back"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-black/10 transition hover:bg-muted active:scale-95 dark:border-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-foreground truncate">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="shrink-0 rounded-full bg-black px-2 py-0.5 text-[11px] font-bold text-white dark:bg-white dark:text-black shadow-2xs">
                  {unreadCount} new
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                title="Mark all as read"
                aria-label="Mark all as read"
                className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 text-foreground hover:bg-muted active:scale-95 transition dark:border-white/10"
              >
                <CheckCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </button>
            )}
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearAll}
                title="Clear all notifications"
                aria-label="Clear all"
                className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition dark:border-white/10"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: "all", label: `All (${items.length})` },
            { id: "unread", label: `Unread (${unreadCount})` },
            { id: "booking", label: "Bookings" },
            { id: "message", label: "Messages" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`rounded-full px-3.5 py-1.5 font-medium transition ${
                filter === tab.id
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="mt-4 space-y-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleRead(item.id)}
              className={`group relative flex cursor-pointer gap-3.5 rounded-2xl border p-4 transition hover:border-black dark:hover:border-white ${
                !item.isRead
                  ? "border-black/30 bg-muted/40 font-medium dark:border-white/30"
                  : "border-black/10 bg-background dark:border-white/10"
              }`}
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted">
                {getIcon(item.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-semibold text-foreground">{item.title}</h3>
                  <span className="text-[11px] text-muted-foreground">{item.time}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
              </div>
              {!item.isRead && (
                <span className="h-2 w-2 shrink-0 self-center rounded-full bg-black dark:bg-white" />
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-muted">
                <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="mt-3 text-sm font-medium">All caught up!</p>
              <p className="text-xs text-muted-foreground">
                No notifications matching your filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
