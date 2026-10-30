import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  ArrowLeft,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Quote,
  List,
  ListOrdered,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Eye,
  Check,
  Sparkles,
  Upload,
} from "lucide-react";
import { Shell } from "@/components/app-ui";
import { useStore, actions, type CaseStudyItem } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/provider/case-study-editor")({
  head: () => ({
    meta: [
      { title: "Case Study Editor | Medium Style | Zifily" },
      {
        name: "description",
        content:
          "Write and format comprehensive project case studies in a distraction-free editor.",
      },
    ],
  }),
  component: CaseStudyEditorPage,
});

export function CaseStudyEditorPage() {
  const router = useRouter();
  const searchParams =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const editId = searchParams?.get("id");
  const business = useStore((s) => s.business);
  const existingItem = (business.caseStudies || []).find((c) => c.id === editId);

  const [title, setTitle] = useState(
    existingItem?.title || "Modern E-Commerce Redesign & Checkout Conversion Overhaul",
  );
  const [client, setClient] = useState(existingItem?.client || "Nordic Apparel Co.");
  const [cost, setCost] = useState(existingItem?.cost || "₹35,000");
  const [tag, setTag] = useState(existingItem?.tag || "Web Development");
  const [banner, setBanner] = useState(
    existingItem?.banner ||
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  );
  const [content, setContent] = useState(
    existingItem?.description ||
      `## The Challenge
The client experienced a 68% cart abandonment rate due to friction in their multi-step checkout and slow mobile page performance. They needed a seamless, modern web experience that preserved their Scandinavian aesthetic while optimizing for speed.

## Our Approach & Deliverables
We rebuilt the storefront using modern Next.js and Tailwind CSS with frictionless 1-click checkout:
- Redesigned product display pages with dynamic zoom and inventory badges
- Streamlined checkout flow from 5 steps down to a single optimized drawer
- Reduced Time to Interactive from 4.2s to 0.8s
- Implemented real-time order tracking and WhatsApp notifications

## The Outcome & Impact
> "Within two weeks of launch, our mobile conversion rate surged by +42%, and checkout abandonment dropped dramatically. Best investment we made this quarter."

- +42% mobile conversion increase
- 99.8% customer satisfaction score
- Delivered 4 days ahead of scheduled launch date`,
  );

  const [isPreview, setIsPreview] = useState(false);
  const [showImagePrompt, setShowImagePrompt] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Formatting helpers like Medium
  const insertFormat = (prefix: string, suffix: string = "") => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = prefix + (selectedText || "text") + suffix;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText.length || 4),
      );
    }, 50);
  };

  const insertTemplateBlock = (blockTitle: string) => {
    setContent(
      (prev) =>
        `${prev}\n\n## ${blockTitle}\nDetail your approach, milestones and key solutions here...`,
    );
    toast.success(`Added ${blockTitle} section`);
  };

  // Word count & read time
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 180));

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a case study title");
      return;
    }

    const item: CaseStudyItem = {
      id: editId || `cs-${Date.now()}`,
      title: title.trim(),
      client: client.trim() || "Verified Client",
      cost: cost.trim() || "₹25,000",
      tag: tag.trim() || "Featured",
      banner: banner.trim(),
      description: content.trim(),
    };

    if (editId) {
      actions.deleteCaseStudy(editId);
    }
    actions.addCaseStudy(item);
    toast.success("Case study published to your public profile!");
    router.navigate({ to: "/provider/case-studies" });
  };

  return (
    <Shell hideBottomNav>
      <div className="mx-auto max-w-3xl px-3 sm:px-6 py-4 md:py-8 space-y-6">
        {/* Medium-style Top Header Bar with Back Button & Actions */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.navigate({ to: "/provider/case-studies" })}
              className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-background shadow-xs hover:bg-muted active:scale-95 transition dark:border-white/10"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-foreground">Case Study Editor</span>
              <span className="rounded-full bg-emerald-500/10 text-emerald-600 px-2 py-0.5 text-[10px] font-bold">
                {wordCount} words · {readTime} min read
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPreview(!isPreview)}
              className={cn(
                "flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold transition active:scale-95 border",
                isPreview
                  ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                  : "bg-background text-foreground border-black/15 hover:bg-muted",
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>{isPreview ? "Edit" : "Preview"}</span>
            </button>

            <button
              type="button"
              onClick={handlePublish}
              className="flex items-center gap-1.5 rounded-2xl bg-[#5B4DF5] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#4F46E5] active:scale-95 transition"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Publish Story</span>
            </button>
          </div>
        </div>

        {/* Medium Floating/Sticky Formatting Toolbar */}
        {!isPreview && (
          <div className="sticky top-2 z-30 flex flex-wrap items-center gap-1 rounded-2xl border border-black/10 bg-background/95 p-1.5 shadow-md backdrop-blur-md dark:border-white/10">
            <button
              type="button"
              onClick={() => insertFormat("**", "**")}
              className="grid h-8 w-8 place-items-center rounded-xl hover:bg-muted active:scale-90 transition text-foreground"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat("*", "*")}
              className="grid h-8 w-8 place-items-center rounded-xl hover:bg-muted active:scale-90 transition text-foreground"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />
            <button
              type="button"
              onClick={() => insertFormat("# ")}
              className="grid h-8 w-8 place-items-center rounded-xl hover:bg-muted active:scale-90 transition text-foreground"
              title="Large Heading"
            >
              <Heading1 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat("## ")}
              className="grid h-8 w-8 place-items-center rounded-xl hover:bg-muted active:scale-90 transition text-foreground"
              title="Subheading"
            >
              <Heading2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat("> ")}
              className="grid h-8 w-8 place-items-center rounded-xl hover:bg-muted active:scale-90 transition text-foreground"
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </button>
            <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-0.5" />
            <button
              type="button"
              onClick={() => insertFormat("- ")}
              className="grid h-8 w-8 place-items-center rounded-xl hover:bg-muted active:scale-90 transition text-foreground"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat("1. ")}
              className="grid h-8 w-8 place-items-center rounded-xl hover:bg-muted active:scale-90 transition text-foreground"
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat("```\n", "\n```")}
              className="grid h-8 w-8 place-items-center rounded-xl hover:bg-muted active:scale-90 transition text-foreground"
              title="Code Block"
            >
              <Code className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat("[Link Title](", ")")}
              className="grid h-8 w-8 place-items-center rounded-xl hover:bg-muted active:scale-90 transition text-foreground"
              title="Link"
            >
              <LinkIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowImagePrompt(!showImagePrompt)}
              className="grid h-8 w-8 place-items-center rounded-xl hover:bg-muted active:scale-90 transition text-foreground"
              title="Cover / In-line Image"
            >
              <ImageIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormat("\n---\n")}
              className="grid h-8 w-8 place-items-center rounded-xl hover:bg-muted active:scale-90 transition text-foreground"
              title="Divider"
            >
              <Minus className="h-4 w-4" />
            </button>

            {/* Quick Section Inserts */}
            <div className="ml-auto hidden sm:flex items-center gap-1.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => insertTemplateBlock("The Problem & Scope")}
                className="rounded-lg bg-muted px-2 py-1 hover:bg-muted/80 text-muted-foreground"
              >
                + Problem
              </button>
              <button
                type="button"
                onClick={() => insertTemplateBlock("The Solution & Key Results")}
                className="rounded-lg bg-muted px-2 py-1 hover:bg-muted/80 text-muted-foreground"
              >
                + Results
              </button>
            </div>
          </div>
        )}

        {/* Banner Cover Image */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden rounded-3xl bg-muted border border-black/10 dark:border-white/10 group">
          <img src={banner} alt="Cover" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => setShowImagePrompt(true)}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-2xl bg-black/75 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md hover:bg-black transition shadow-md"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Change Cover</span>
          </button>
        </div>

        {/* Change Cover Prompt Modal */}
        {showImagePrompt && (
          <div className="rounded-2xl border border-black/10 bg-card p-4 space-y-2 dark:border-white/10">
            <label className="text-xs font-bold text-foreground block">Cover Image URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="h-10 flex-1 rounded-xl border border-black/15 bg-muted/20 px-3 text-xs outline-none focus:border-black dark:border-white/15"
              />
              <button
                type="button"
                onClick={() => setShowImagePrompt(false)}
                className="rounded-xl bg-[#5B4DF5] px-4 text-xs font-bold text-white"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Story Metadata Pills (Client, Project Value, Category) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-black uppercase text-muted-foreground block mb-1">
              Client / Organization
            </label>
            <input
              type="text"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              placeholder="e.g. Nordic Apparel Co."
              className="h-10 w-full rounded-xl border border-black/15 bg-muted/20 px-3 text-xs font-semibold outline-none focus:border-black dark:border-white/15"
            />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase text-muted-foreground block mb-1">
              Project Value
            </label>
            <input
              type="text"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="e.g. ₹35,000"
              className="h-10 w-full rounded-xl border border-black/15 bg-muted/20 px-3 text-xs font-semibold outline-none focus:border-black dark:border-white/15"
            />
          </div>
          <div>
            <label className="text-[11px] font-black uppercase text-muted-foreground block mb-1">
              Category Tag
            </label>
            <input
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder="e.g. Web Development"
              className="h-10 w-full rounded-xl border border-black/15 bg-muted/20 px-3 text-xs font-semibold outline-none focus:border-black dark:border-white/15"
            />
          </div>
        </div>

        {/* EDIT MODE vs PREVIEW MODE */}
        {!isPreview ? (
          <div className="space-y-4">
            {/* Medium-style large title input */}
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title..."
              className="w-full bg-transparent text-2xl sm:text-4xl font-black tracking-tight text-foreground placeholder:text-muted-foreground/50 outline-none border-b border-black/10 pb-3 dark:border-white/10"
            />

            {/* Medium-style story body */}
            <textarea
              ref={textareaRef}
              rows={18}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell your story... Describe the client problem, step-by-step implementation, deliverables, and final business impact."
              className="w-full rounded-2xl border border-black/10 bg-transparent p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/40 outline-none focus:border-black dark:border-white/10 font-mono"
            />
          </div>
        ) : (
          /* Medium-style Publication Reader View */
          <div className="space-y-6 pt-2">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
              {title}
            </h1>

            <div className="flex items-center gap-3 border-y border-black/10 py-3 text-xs text-muted-foreground dark:border-white/10">
              <span className="font-bold text-foreground">{client}</span>
              <span>·</span>
              <span className="font-bold text-[#5B4DF5]">{cost}</span>
              <span>·</span>
              <span>{tag}</span>
              <span>·</span>
              <span>{readTime} min read</span>
            </div>

            <div className="prose prose-neutral dark:prose-invert max-w-none space-y-4 text-sm leading-relaxed text-foreground">
              {content.split("\n\n").map((para, i) => {
                if (para.startsWith("# ")) {
                  return (
                    <h2 key={i} className="text-2xl font-black mt-6 mb-2">
                      {para.replace("# ", "")}
                    </h2>
                  );
                }
                if (para.startsWith("## ")) {
                  return (
                    <h3 key={i} className="text-lg font-black text-[#5B4DF5] mt-5 mb-1.5">
                      {para.replace("## ", "")}
                    </h3>
                  );
                }
                if (para.startsWith("> ")) {
                  return (
                    <blockquote
                      key={i}
                      className="border-l-4 border-[#5B4DF5] pl-4 italic text-muted-foreground my-4 font-serif text-base"
                    >
                      {para.replace("> ", "")}
                    </blockquote>
                  );
                }
                if (para.startsWith("- ") || para.startsWith("* ")) {
                  const items = para.split("\n").map((l) => l.replace(/^[-*]\s+/, ""));
                  return (
                    <ul key={i} className="list-disc pl-5 space-y-1 my-3">
                      {items.map((it, idx) => (
                        <li key={idx}>{it}</li>
                      ))}
                    </ul>
                  );
                }
                if (para.trim() === "---") {
                  return <hr key={i} className="my-6 border-black/10 dark:border-white/10" />;
                }
                return (
                  <p key={i} className="leading-relaxed">
                    {para}
                  </p>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Publish Bar */}
        <div className="flex items-center justify-between border-t pt-4">
          <button
            type="button"
            onClick={() => router.navigate({ to: "/provider/case-studies" })}
            className="rounded-2xl border border-black/15 bg-background px-4 py-2 text-xs font-bold hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="flex items-center gap-1.5 rounded-2xl bg-[#5B4DF5] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#4F46E5] active:scale-95 transition"
          >
            <Check className="h-4 w-4" />
            <span>Publish Case Study</span>
          </button>
        </div>
      </div>
    </Shell>
  );
}
