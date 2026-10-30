import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  Ban,
  CheckCheck,
  Check,
  MessageSquare,
  MoreVertical,
  Pin,
  Search,
  Trash2,
  X,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { Shell } from "@/components/app-ui";
import { traders } from "@/lib/data";
import { actions, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ChatView } from "@/components/chat-view";
import { toast } from "sonner";

export const Route = createFileRoute("/messages")({
  validateSearch: (s: Record<string, unknown>): { trader?: string } => ({
    trader: typeof s["trader"] === "string" ? (s["trader"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Messages & Chats | Expertene" },
      {
        name: "description",
        content:
          "Direct messaging, file sharing, and project consultations with verified specialists.",
      },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { trader: searchTrader } = Route.useSearch();
  const navigate = Route.useNavigate();
  const chats = useStore((s) => s.chats);
  const pinnedChats = useStore((s) => s.pinnedChats);
  const blockedChats = useStore((s) => s.blockedChats);
  const deletedChats = useStore((s) => s.deletedChats);

  // Single-screen mobile flow across all viewports (mobile, tablet, and web desktop)
  // Default to null so the conversations list is always presented first
  const [activeTraderId, setActiveTraderId] = useState<string | null>(() => {
    if (searchTrader && traders.some((t) => t.id === searchTrader)) {
      return searchTrader;
    }
    return null;
  });

  const [search, setSearch] = useState("");
  const [contextMenuId, setContextMenuId] = useState<string | null>(null);

  // Sync when search trader query changes
  useEffect(() => {
    if (searchTrader && traders.some((t) => t.id === searchTrader)) {
      setActiveTraderId(searchTrader);
    } else if (!searchTrader) {
      setActiveTraderId(null);
    }
  }, [searchTrader]);

  // Filter out deleted chats and filter by search
  const visibleTraders = useMemo(() => {
    return traders
      .filter((t) => !deletedChats.includes(t.id))
      .filter((t) => {
        if (!search.trim()) return true;
        const query = search.toLowerCase();
        return (
          t.name.toLowerCase().includes(query) ||
          t.title.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        // Pinned chats float to the top
        const aPinned = pinnedChats.includes(a.id);
        const bPinned = pinnedChats.includes(b.id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;

        // Otherwise by latest message timestamp
        const aLast = chats[a.id]?.at(-1)?.at ?? 0;
        const bLast = chats[b.id]?.at(-1)?.at ?? 0;
        return bLast - aLast;
      });
  }, [chats, pinnedChats, deletedChats, search]);

  const handleOpenChat = (traderId: string) => {
    setActiveTraderId(traderId);
    navigate({ to: "/messages", search: { trader: traderId }, replace: true });
    actions.markChatAsRead(traderId);
  };

  const handleCloseChat = () => {
    setActiveTraderId(null);
    navigate({ to: "/messages", search: {}, replace: true });
  };

  return (
    <Shell
      noScroll={true}
      hideBottomNav={Boolean(activeTraderId)}
      hideNav={false}
      fixedBottomNav={!activeTraderId}
      fullWidth={false}
    >
      <div className="mx-auto flex h-[100dvh] md:h-[calc(100vh-5rem)] w-full max-w-xl lg:max-w-2xl flex-col p-0 md:p-3 overflow-hidden">
        <div className="flex h-full w-full flex-col md:rounded-3xl border-0 md:border md:border-black/10 bg-card dark:border-white/10 overflow-hidden shadow-xs relative">
          {/* SINGLE-VIEW MOBILE FLOW ON ALL DEVICES: Either show conversations list OR active chat */}
          {!activeTraderId ? (
            /* CONVERSATIONS LIST */
            <div className="flex flex-col h-full bg-background">
              {/* Header & Fixed Search Bar: Permanently fixed on top */}
              <div className="p-3.5 sm:p-4 border-b border-black/10 space-y-2.5 bg-background/95 backdrop-blur-md sticky top-0 z-20 dark:border-white/10 shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-xl font-black tracking-tight text-foreground">
                      Messages
                    </h1>
                    <span className="grid h-5 px-2 place-items-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                      {visibleTraders.length}
                    </span>
                  </div>
                  {deletedChats.length > 0 && (
                    <button
                      onClick={() => {
                        deletedChats.forEach((id) => actions.deleteChatForMe(id));
                        toast.success("Chats refreshed");
                      }}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground underline"
                    >
                      Reset List
                    </button>
                  )}
                </div>

                {/* Search input with smooth active styling */}
                <label className="flex h-10 items-center gap-2 rounded-xl border border-black/15 bg-muted/30 px-3 text-xs transition-all duration-200 focus-within:border-black focus-within:bg-background focus-within:ring-1 focus-within:ring-black dark:border-white/15 dark:focus-within:border-white dark:focus-within:ring-white">
                  <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                  <input
                    type="text"
                    placeholder="Search specialists by name or trade..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent text-xs font-medium outline-none placeholder:text-muted-foreground"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </label>
              </div>

              {/* Providers Conversation List */}
              <div className="flex-1 overflow-y-auto divide-y divide-black/5 dark:divide-white/5 no-scrollbar pb-24 md:pb-4">
                {visibleTraders.length === 0 && (
                  <div className="p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center h-48">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-2" />
                    <p className="font-semibold text-foreground">No conversations found</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Search for a specialist above or pick from Explore.
                    </p>
                  </div>
                )}

                {visibleTraders.map((t) => {
                  const thread = chats[t.id] ?? [];
                  const lastMsg = thread.at(-1);
                  const isPinned = pinnedChats.includes(t.id);
                  const isBlocked = blockedChats.includes(t.id);
                  const hasUnread = lastMsg && lastMsg.from === "them" && !lastMsg.read;

                  return (
                    <div
                      key={t.id}
                      className="group relative flex items-center gap-3 p-3.5 transition-colors cursor-pointer select-none hover:bg-muted/35 active:bg-muted/50"
                      onClick={() => handleOpenChat(t.id)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenuId(contextMenuId === t.id ? null : t.id);
                      }}
                    >
                      {/* Provider Avatar */}
                      <div className="relative shrink-0">
                        <img
                          src={t.photo}
                          alt={t.name}
                          className="h-12 w-12 rounded-full object-cover border border-black/10 dark:border-white/10"
                        />
                        {/* Active status indicator (monochrome in dark mode) */}
                        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-background dark:bg-white" />

                        {/* Pin badge */}
                        {isPinned && (
                          <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-black text-white dark:bg-white dark:text-black shadow-xs">
                            <Pin className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>

                      {/* Provider Info & Last Message Snippet */}
                      <div className="min-w-0 flex-1 py-0.5">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary">
                              {t.name}
                            </span>
                            <span className="rounded-md bg-muted px-1.5 py-0.2 text-[9px] font-semibold text-muted-foreground shrink-0 hidden sm:inline">
                              {t.category}
                            </span>
                          </div>
                          {lastMsg && (
                            <span className="text-[10px] text-muted-foreground shrink-0 font-normal">
                              {new Date(lastMsg.at).toLocaleTimeString("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="truncate text-xs text-muted-foreground">
                            {isBlocked ? (
                              <span className="text-rose-500 font-semibold flex items-center gap-1 dark:text-white">
                                <Ban className="h-3 w-3 inline" /> Blocked
                              </span>
                            ) : lastMsg ? (
                              <span className="inline-flex items-center gap-1">
                                {lastMsg.from === "me" && (
                                  <span className="inline-flex items-center">
                                    {lastMsg.read ? (
                                      <CheckCheck className="h-3 w-3 text-sky-500 inline dark:text-white" />
                                    ) : (
                                      <Check className="h-3 w-3 text-muted-foreground inline" />
                                    )}
                                  </span>
                                )}
                                {lastMsg.type === "offer" ? (
                                  <span className="font-semibold text-foreground">
                                    Proposal: {lastMsg.offerPrice}
                                  </span>
                                ) : lastMsg.type === "image" ? (
                                  <span className="inline-flex items-center gap-1">
                                    <ImageIcon className="h-3 w-3" /> Photo
                                  </span>
                                ) : lastMsg.type === "file" ? (
                                  <span className="inline-flex items-center gap-1">
                                    <FileText className="h-3 w-3" /> {lastMsg.fileName || "File"}
                                  </span>
                                ) : (
                                  lastMsg.text
                                )}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/80">
                                Tap to chat with {t.name.split(" ")[0]}
                              </span>
                            )}
                          </div>

                          {hasUnread && (
                            <span className="h-2.5 w-2.5 rounded-full bg-black dark:bg-white shrink-0 ring-2 ring-background" />
                          )}
                        </div>
                      </div>

                      {/* Quick 3-Dots Action Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setContextMenuId(contextMenuId === t.id ? null : t.id);
                        }}
                        aria-label="Thread menu"
                        className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition opacity-70 hover:opacity-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {/* Context Action Menu (Pin, Block, Delete for me) */}
                      {contextMenuId === t.id && (
                        <div
                          className="absolute right-4 top-10 z-40 w-44 rounded-2xl border border-black/10 bg-background p-1.5 shadow-2xl dark:border-white/10 animate-in fade-in zoom-in-95"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              actions.togglePinChat(t.id);
                              setContextMenuId(null);
                              toast.success(isPinned ? "Unpinned" : "Pinned to top 📌");
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-muted text-left"
                          >
                            <Pin className="h-3.5 w-3.5" />
                            <span>{isPinned ? "Unpin Chat" : "Pin to Top"}</span>
                          </button>

                          <button
                            onClick={() => {
                              actions.toggleBlockChat(t.id);
                              setContextMenuId(null);
                              toast(isBlocked ? "Contact unblocked" : "Contact blocked 🚫");
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-muted text-left"
                          >
                            <Ban className="h-3.5 w-3.5" />
                            <span>{isBlocked ? "Unblock" : "Block Specialist"}</span>
                          </button>

                          <button
                            onClick={() => {
                              actions.deleteChatForMe(t.id);
                              setContextMenuId(null);
                              toast.success("Chat deleted for you");
                            }}
                            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-neutral-800 dark:text-white text-left"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Delete for me</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* FOCUSED CHAT VIEW: Exactly same mobile UI on web, tablet, and phone */
            <div className="flex h-full w-full flex-col bg-background">
              <ChatView traderId={activeTraderId} isSidebar={false} onClose={handleCloseChat} />
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
