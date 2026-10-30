import { createFileRoute, notFound, useRouter } from "@tanstack/react-router";
import { Shell } from "@/components/app-ui";
import { getTrader } from "@/lib/data";
import { ChatView } from "@/components/chat-view";

export const Route = createFileRoute("/chat/$id")({
  loader: ({ params }) => {
    if (!getTrader(params.id)) throw notFound();
  },
  head: () => ({
    meta: [
      { title: "Direct Chat | Zifily" },
      {
        name: "description",
        content: "Message and coordinate with verified specialists on Zifily.",
      },
    ],
  }),
  component: ChatRoute,
});

function ChatRoute() {
  const { id } = Route.useParams();
  const router = useRouter();

  return (
    <Shell hideNav={false} hideBottomNav={true} noScroll={true} fullWidth={false}>
      <div className="mx-auto flex h-[100dvh] md:h-[calc(100vh-5rem)] w-full max-w-xl lg:max-w-2xl flex-col p-0 md:p-3 overflow-hidden">
        <div className="flex h-full w-full flex-col md:rounded-3xl border-0 md:border md:border-black/10 bg-card dark:border-white/10 overflow-hidden shadow-xs">
          <ChatView
            traderId={id}
            isSidebar={false}
            onClose={() => router.navigate({ to: "/messages" })}
          />
        </div>
      </div>
    </Shell>
  );
}
