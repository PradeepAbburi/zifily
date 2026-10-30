import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, Trash2, ExternalLink, Layers, X, Check } from "lucide-react";
import { Shell } from "@/components/app-ui";
import { useStore, actions, type CaseStudyItem } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/provider/case-studies")({
  head: () => ({
    meta: [
      { title: "Case Studies | Expertene" },
      {
        name: "description",
        content: "Verified client case studies, deliverables, project scopes and testimonials.",
      },
    ],
  }),
  component: ProviderCaseStudiesPage,
});

export function ProviderCaseStudiesPage() {
  const router = useRouter();
  const business = useStore((s) => s.business);
  const caseStudiesList = business.caseStudies || [];

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCaseStudy, setNewCaseStudy] = useState({
    title: "",
    client: "",
    cost: "₹15,000",
    banner:
      "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
    description: "",
  });

  const handleAddCaseStudy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseStudy.title.trim()) {
      toast.error("Please enter a project title");
      return;
    }
    const item: CaseStudyItem = {
      id: `cs-${Date.now()}`,
      title: newCaseStudy.title.trim(),
      client: newCaseStudy.client.trim() || "Client Project",
      cost: newCaseStudy.cost.trim(),
      banner:
        newCaseStudy.banner.trim() ||
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
      description:
        newCaseStudy.description.trim() || "High quality delivery and client satisfaction.",
    };
    actions.addCaseStudy(item);
    toast.success("Case study added to your portfolio!");
    setShowAddModal(false);
    setNewCaseStudy({
      title: "",
      client: "",
      cost: "₹15,000",
      banner:
        "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=800&q=80",
      description: "",
    });
  };

  const handleDeleteCaseStudy = (id: string) => {
    actions.deleteCaseStudy(id);
    toast.success("Case study removed");
  };

  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-3 sm:px-6 py-4 md:py-8 space-y-6">
        {/* Header with Back button and responsive action button */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.history.back()}
              className="grid h-9 w-9 place-items-center rounded-xl border border-black/10 bg-background shadow-xs hover:bg-muted active:scale-95 transition dark:border-white/10"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Case Studies
              </h1>
              <span className="rounded-full bg-[#5B4DF5]/10 text-[#5B4DF5] dark:bg-[#5B4DF5]/25 dark:text-purple-300 px-2.5 py-0.5 text-[10px] font-extrabold uppercase">
                {caseStudiesList.length}
              </span>
            </div>
          </div>

          <Link
            to="/provider/case-study-editor"
            className="flex items-center gap-1.5 rounded-2xl bg-[#5B4DF5] p-2.5 sm:px-4 sm:py-2 text-xs font-bold text-white transition hover:bg-[#4F46E5] active:scale-95 shadow-xs"
            title="Write New Case Study"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New case study</span>
          </Link>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {caseStudiesList.map((cs) => (
            <div
              key={cs.id}
              className="rounded-3xl border border-black/10 bg-card overflow-hidden shadow-xs dark:border-white/10 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-muted">
                  <img src={cs.banner} alt={cs.title} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleDeleteCaseStudy(cs.id)}
                    className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white hover:bg-rose-600 transition shadow-md"
                    title="Delete case study"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="absolute left-3 bottom-3 rounded-lg bg-black/80 px-2.5 py-1 text-xs font-black text-white backdrop-blur-xs">
                    {cs.cost}
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">{cs.client}</span>
                    <span>Verified Project</span>
                  </div>
                  <h3 className="text-base font-black text-foreground">{cs.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {cs.description}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 pt-0 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs mt-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#5B4DF5]">Published</span>
                  <span>·</span>
                  <Link
                    to="/provider/case-study-editor"
                    className="font-bold text-muted-foreground hover:text-foreground hover:underline"
                  >
                    Edit
                  </Link>
                </div>
                <Link
                  to="/trader/james-wilson"
                  className="font-bold text-foreground hover:underline flex items-center gap-1"
                >
                  <span>Preview</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}

          {caseStudiesList.length === 0 && (
            <div className="col-span-full rounded-3xl border border-dashed border-black/15 p-8 text-center dark:border-white/15 bg-muted/20 space-y-3">
              <Layers className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="font-bold text-sm text-foreground">No case studies published yet</p>
              <Link
                to="/provider/case-study-editor"
                className="inline-block rounded-2xl bg-[#5B4DF5] px-4 py-2 text-xs font-bold text-white shadow-xs"
              >
                Create your first case study
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: ADD CASE STUDY */}
      {showAddModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-black/10 bg-background p-5 sm:p-6 shadow-2xl dark:border-white/10 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 border-black/10 dark:border-white/10">
              <h3 className="font-black text-sm sm:text-base">Add Case Study</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddCaseStudy} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-foreground">Project Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. High-converting SaaS Landing Page Overhaul"
                  value={newCaseStudy.title}
                  onChange={(e) => setNewCaseStudy({ ...newCaseStudy, title: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-black/15 bg-muted/20 px-3 outline-none focus:border-black dark:border-white/15"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-foreground">Client Name / Org</label>
                  <input
                    type="text"
                    placeholder="e.g. Nexus Tech"
                    value={newCaseStudy.client}
                    onChange={(e) => setNewCaseStudy({ ...newCaseStudy, client: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-black/15 bg-muted/20 px-3 outline-none focus:border-black dark:border-white/15"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground">Project Value</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹25,000"
                    value={newCaseStudy.cost}
                    onChange={(e) => setNewCaseStudy({ ...newCaseStudy, cost: e.target.value })}
                    className="mt-1 h-10 w-full rounded-xl border border-black/15 bg-muted/20 px-3 outline-none focus:border-black dark:border-white/15"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newCaseStudy.banner}
                  onChange={(e) => setNewCaseStudy({ ...newCaseStudy, banner: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-black/15 bg-muted/20 px-3 outline-none focus:border-black dark:border-white/15"
                />
              </div>

              <div>
                <label className="font-bold text-foreground">Project Summary &amp; Results</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain the scope, timeline, and measurable outcome..."
                  value={newCaseStudy.description}
                  onChange={(e) =>
                    setNewCaseStudy({ ...newCaseStudy, description: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-black/15 bg-muted/20 p-2.5 outline-none focus:border-black dark:border-white/15"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#5B4DF5] font-bold text-xs text-white hover:bg-[#4F46E5] active:scale-95 shadow-md transition"
                >
                  <Check className="h-4 w-4" />
                  <span>Publish Case Study</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
