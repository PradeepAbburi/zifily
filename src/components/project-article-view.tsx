import React from "react";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Globe,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import { PrimaryButton, IosShareIcon } from "@/components/app-ui";
import type { PortfolioProject } from "@/lib/store";

interface ProjectArticleViewProps {
  project: PortfolioProject;
  traderName: string;
  traderId: string;
  onClose: () => void;
  onBook: () => void;
  onShare: () => void;
}

export function ProjectArticleView({
  project,
  traderName,
  traderId: _traderId,
  onClose,
  onBook,
  onShare,
}: ProjectArticleViewProps) {
  const fallbackBanner =
    project.banner ||
    "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-background/95 backdrop-blur-md animate-in fade-in duration-200">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Navigation Top Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-black/10 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 rounded-xl border border-black/15 bg-background px-3.5 py-2 text-xs font-bold text-foreground transition hover:bg-muted active:scale-95 dark:border-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to {traderName}'s Profile</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onShare}
              title="Share Project"
              className="grid h-9 w-9 place-items-center rounded-full border border-black/15 bg-background hover:bg-muted active:scale-95 dark:border-white/15"
            >
              <IosShareIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full border border-black/15 bg-background text-sm font-bold hover:bg-muted active:scale-95 dark:border-white/15"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Article Content */}
        <article className="mt-6 space-y-8">
          {/* Hero Banner with Category Badge */}
          <div className="relative overflow-hidden rounded-3xl border border-black/10 shadow-sm dark:border-white/10">
            <img
              src={fallbackBanner}
              alt={project.title}
              className="h-64 sm:h-96 w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-6 text-white">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white border border-white/30">
                  {project.tag}
                </span>
                {project.date && (
                  <span className="flex items-center gap-1 text-[11px] text-white/80">
                    <Calendar className="h-3 w-3" />
                    {project.date}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {project.title}
              </h1>
              {project.client && (
                <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-white/90">
                  <User className="h-3.5 w-3.5" />
                  Client: <span className="font-semibold">{project.client}</span>
                </p>
              )}
            </div>
          </div>

          {/* Key Metrics / Highlights Bar */}
          {project.metrics && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 dark:border-emerald-400/20 dark:bg-emerald-400/5">
              <Sparkles className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Verified Outcome & Impact
                </p>
                <p className="mt-0.5 text-sm font-bold text-foreground">{project.metrics}</p>
              </div>
            </div>
          )}

          {/* Section 1: Executive Summary */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold tracking-tight text-foreground">Project Overview</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>
          </div>

          {/* Section 2: The Challenge & The Solution */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/10 bg-muted/20 p-5 dark:border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                The Challenge
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-foreground/90">
                {project.challenge ||
                  "The client required expert execution within strict deadlines, requiring specialized trade competence, precision diagnostics, and high-standard craftsmanship."}
              </p>
            </div>

            <div className="rounded-2xl border border-black/10 bg-muted/20 p-5 dark:border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                The Solution & Approach
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-foreground/90">
                {project.solution ||
                  "Conducted full preliminary inspection, formulated an optimized implementation plan using certified materials, and delivered immaculate results with full verification."}
              </p>
            </div>
          </div>

          {/* Section 3: Deliverables List */}
          {project.deliverables && project.deliverables.length > 0 && (
            <div className="space-y-3 border-t border-black/10 pt-6 dark:border-white/10">
              <h3 className="text-sm font-bold tracking-tight">
                Key Deliverables & Specifications
              </h3>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {project.deliverables.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 rounded-xl border border-black/10 bg-background p-3 text-xs font-medium dark:border-white/10"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Action Footer */}
          <div className="rounded-3xl border border-black/10 bg-card p-6 shadow-xs dark:border-white/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h4 className="text-base font-bold">Inspired by this project?</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Book {traderName} for your home, commercial, or digital requirements today.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-11 items-center gap-2 rounded-xl border border-black/15 bg-background px-4 text-xs font-bold text-foreground transition hover:bg-muted active:scale-95 dark:border-white/15"
                  >
                    <Globe className="h-4 w-4" />
                    <span>Visit Live Work</span>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                  </a>
                )}
                <PrimaryButton onClick={onBook} className="h-11 px-6 text-xs font-bold">
                  Book This Expert
                </PrimaryButton>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
