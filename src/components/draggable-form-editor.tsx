import React, { useState } from "react";
import {
  GripVertical,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Sparkles,
  HelpCircle,
  Mail,
  Hash,
  CheckSquare,
  Image as ImageIcon,
  FileUp,
  Video,
  BarChart2,
  Layers,
  Check,
  X,
  Eye,
  Sliders,
  RotateCcw,
  Maximize2,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  Play,
  Settings2,
} from "lucide-react";
import {
  useStore,
  actions,
  type FormBlock,
  type FormBlockType,
  DEFAULT_BOOKING_FORM_BLOCKS,
} from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Block Card metadata for the "+" block picker
export const BLOCK_TYPE_CARDS: {
  type: FormBlockType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badge: string;
}[] = [
  {
    type: "question",
    title: "Question",
    description: "Short answer or paragraph text input for client details & project scope",
    icon: HelpCircle,
    accentColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    badge: "Text Field",
  },
  {
    type: "email",
    title: "Email",
    description: "Validated email address input with automatic formatting",
    icon: Mail,
    accentColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    badge: "Contact",
  },
  {
    type: "number",
    title: "Number",
    description: "Numeric input for budget, dimensions, square footage, or hours",
    icon: Hash,
    accentColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    badge: "Numeric",
  },
  {
    type: "multiple_choice",
    title: "Multiple Choice",
    description: "Single or multi-select radio buttons or checkboxes with customizable options",
    icon: CheckSquare,
    accentColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    badge: "Choice",
  },
  {
    type: "image",
    title: "Image",
    description: "Visual reference photo upload or provider showcase preview banner",
    icon: ImageIcon,
    accentColor: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30",
    badge: "Media",
  },
  {
    type: "file",
    title: "File",
    description: "Upload architectural floorplans, spec sheets, PDFs, or documents",
    icon: FileUp,
    accentColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    badge: "Upload",
  },
  {
    type: "video",
    title: "Video",
    description: "Embed instructional video, demonstration walkthrough, or YouTube clip",
    icon: Video,
    accentColor: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    badge: "Embed",
  },
  {
    type: "poll",
    title: "Poll",
    description: "Interactive voting card with real-time percentage distribution bars",
    icon: BarChart2,
    accentColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    badge: "Voting",
  },
  {
    type: "section",
    title: "Section Divider",
    description: "Divides the booking form into a separate step or page with its own next action",
    icon: Layers,
    accentColor: "bg-black/10 text-black dark:bg-white/10 dark:text-white border-black/30 dark:border-white/30",
    badge: "Page Break",
  },
];

export function DraggableFormEditor() {
  const intakeConfig = useStore((s) => s.providerCustomization.intakeConfig);
  const blocks = intakeConfig.formBlocks || DEFAULT_BOOKING_FORM_BLOCKS;

  const [activeBlockId, setActiveBlockId] = useState<string | null>(blocks[0]?.id || null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Picker popover / modal state: index at which to insert new block
  const [insertModalIndex, setInsertModalIndex] = useState<number | null>(null);
  const [showChangeAllMenu, setShowChangeAllMenu] = useState(false);
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");

  // Multi-page preview simulation state
  const [previewCurrentPage, setPreviewCurrentPage] = useState(0);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, unknown>>({});

  // Helper to split blocks by Section cards into Pages
  const pages = React.useMemo(() => {
    const result: { sectionBlock?: FormBlock; blocks: FormBlock[]; pageIndex: number }[] = [];
    let currentBlocks: FormBlock[] = [];
    let currentSection: FormBlock | undefined = undefined;

    for (const b of blocks) {
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
    result.push({
      sectionBlock: currentSection,
      blocks: currentBlocks,
      pageIndex: result.length,
    });
    return result.filter((p) => p.blocks.length > 0 || p.sectionBlock);
  }, [blocks]);

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.setData("text/plain", index.toString());
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (draggedIndex !== targetIndex) {
      actions.reorderFormBlocks(draggedIndex, targetIndex);
      toast.success("Block reordered successfully");
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Insert a new block
  const handleAddBlock = (type: FormBlockType, index?: number) => {
    const id = "blk-" + Math.random().toString(36).slice(2, 8);
    let newBlock: FormBlock;

    switch (type) {
      case "question":
        newBlock = {
          id,
          type,
          title: "New Question",
          description: "Provide additional details for the specialist",
          required: false,
        };
        break;
      case "email":
        newBlock = {
          id,
          type,
          title: "Email Address",
          description: "We'll send booking notifications and invoices to this email",
          required: true,
        };
        break;
      case "number":
        newBlock = {
          id,
          type,
          title: "Estimated Quantity or Budget",
          description: "Enter the numeric scope or budget requirement",
          unitPrefix: "£",
          unitSuffix: "estimated",
          minValue: 1,
          maxValue: 10000,
          step: 10,
          required: false,
        };
        break;
      case "multiple_choice":
        newBlock = {
          id,
          type,
          title: "Select an Option",
          description: "Choose the service preference that best fits",
          options: ["Option A - Standard Delivery", "Option B - Express Service", "Option C - Custom Requirements"],
          allowMultiple: false,
          required: false,
        };
        break;
      case "image":
        newBlock = {
          id,
          type,
          title: "Upload Photo or Site Preview",
          description: "Provide visual images of the current setup or space",
          required: false,
        };
        break;
      case "file":
        newBlock = {
          id,
          type,
          title: "Upload Architectural Plans or Documents",
          description: "Upload PDFs, blueprints, spec sheets or receipts",
          allowedExtensions: [".pdf", ".png", ".jpg", ".dwg"],
          maxFileSizeMb: 25,
          required: false,
        };
        break;
      case "video":
        newBlock = {
          id,
          type,
          title: "Upload Video Demonstration or Scope",
          description: "Short video walkthrough before your scheduled visit",
          required: false,
        };
        break;
      case "poll":
        newBlock = {
          id,
          type,
          title: "Service Preference Poll",
          description: "Vote on your preferred service methodology or guarantee",
          options: ["Priority Service Guarantee", "Eco-Friendly Material Option", "Standard Workmanship"],
          pollVotes: { "0": 15, "1": 32, "2": 8 },
          required: false,
        };
        break;
      case "section": {
        const sectionCount = blocks.filter((b) => b.type === "section").length + 1;
        newBlock = {
          id,
          type,
          title: `Step ${sectionCount}: Additional Details`,
          description: "Divide your booking form into separate step-by-step pages",
          sectionBadge: `Page ${sectionCount}`,
          nextButtonLabel: "Proceed to Next Page",
        };
        break;
      }
    }

    actions.addFormBlock(newBlock, index);
    setActiveBlockId(newBlock.id);
    setInsertModalIndex(null);
    toast.success(`Added ${newBlock.title} block`);
  };

  // Change all actions
  const handleBulkRequired = (val: boolean) => {
    actions.bulkUpdateFormBlocks({ required: val });
    setShowChangeAllMenu(false);
    toast.success(val ? "All field blocks set to Required" : "All field blocks set to Optional");
  };

  const handleAutoSections = () => {
    // Inserts a section card between blocks if none exist or splits evenly
    const nonSections = blocks.filter((b) => b.type === "section" ? false : true);
    if (nonSections.length < 2) {
      toast.info("Add more question blocks first to split into sections");
      return;
    }
    const mid = Math.ceil(nonSections.length / 2);
    const sec1: FormBlock = {
      id: "sec-p1-" + Date.now(),
      type: "section",
      title: "Step 1: Core Requirements",
      description: "Initial client project overview and contacts",
      sectionBadge: "Page 1 of 2",
      nextButtonLabel: "Continue to Section 2",
    };
    const sec2: FormBlock = {
      id: "sec-p2-" + Date.now(),
      type: "section",
      title: "Step 2: Specifications & Media",
      description: "Files, photos, and preferences for the specialist",
      sectionBadge: "Page 2 of 2",
      nextButtonLabel: "Complete Booking",
    };
    const newBlocks = [sec1, ...nonSections.slice(0, mid), sec2, ...nonSections.slice(mid)];
    actions.setFormBlocks(newBlocks);
    setShowChangeAllMenu(false);
    toast.success("Booking form divided into 2 sections / pages!");
  };

  const handleResetDefaults = () => {
    actions.resetFormBlocksToDefault();
    setShowChangeAllMenu(false);
    toast.success("Booking form reset to default template");
  };

  const handleClearAll = () => {
    actions.setFormBlocks([]);
    setShowChangeAllMenu(false);
    toast.info("Cleared all blocks");
  };

  return (
    <div className="space-y-4">
      {/* Top Controls & Change All Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-2xl border border-border bg-card p-3 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-black text-white dark:bg-white dark:text-black">
            <Sliders className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-foreground flex items-center gap-2">
              <span>Draggable Booking Form Builder</span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                {blocks.length} Blocks • {pages.length} Pages
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Drag to reorder, click + between blocks, customize cards, and split with sections
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Mode Switcher: Edit vs Preview */}
          <div className="flex rounded-xl bg-muted p-0.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setPreviewMode("edit")}
              className={cn(
                "rounded-lg px-2.5 py-1 transition flex items-center gap-1",
                previewMode === "edit"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPreviewMode("preview");
                setPreviewCurrentPage(0);
              }}
              className={cn(
                "rounded-lg px-2.5 py-1 transition flex items-center gap-1",
                previewMode === "preview"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Live Preview</span>
            </button>
          </div>

          {/* CHANGE ALL Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowChangeAllMenu(!showChangeAllMenu)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/60 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted active:scale-95 transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Change All</span>
            </button>

            {showChangeAllMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-56 rounded-2xl border border-border bg-popover p-1.5 shadow-xl z-30 space-y-1 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Bulk Operations
                </div>
                <button
                  type="button"
                  onClick={() => handleBulkRequired(true)}
                  className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold hover:bg-muted text-left text-foreground"
                >
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Set All as Required</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkRequired(false)}
                  className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold hover:bg-muted text-left text-foreground"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Set All as Optional</span>
                </button>
                <button
                  type="button"
                  onClick={handleAutoSections}
                  className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold hover:bg-muted text-left text-foreground"
                >
                  <Layers className="h-3.5 w-3.5 text-purple-500" />
                  <span>Auto-Split into 2 Pages</span>
                </button>
                <div className="border-t border-border my-1" />
                <button
                  type="button"
                  onClick={handleResetDefaults}
                  className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold hover:bg-muted text-left text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-blue-500" />
                  <span>Reset to Default Template</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold hover:bg-rose-500/10 text-rose-600 text-left"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear All Blocks</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODE 1: EDIT / DRAG-AND-DROP CANVAS */}
      {/* ===================================================================== */}
      {previewMode === "edit" && (
        <div className="space-y-3">
          {/* Top Insertion Point */}
          <InsertDividerLine
            index={0}
            isOpen={insertModalIndex === 0}
            onToggle={() => setInsertModalIndex(insertModalIndex === 0 ? null : 0)}
            onSelectBlockType={(type) => {
              handleAddBlock(type, 0);
              setInsertModalIndex(null);
            }}
            isTop
          />

          {blocks.map((block, index) => {
            const isSection = block.type === "section";
            const isActive = activeBlockId === block.id;
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;

            return (
              <React.Fragment key={block.id}>
                {/* The Draggable Block Card */}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setActiveBlockId(block.id)}
                  className={cn(
                    "rounded-2xl border transition-all duration-150 cursor-pointer relative",
                    isSection
                      ? "bg-muted/40 border-black/20 dark:border-white/20 p-4 shadow-sm"
                      : "bg-card border-border p-3.5 shadow-xs hover:border-foreground/30",
                    isActive && !isSection && "ring-2 ring-black dark:ring-white border-transparent",
                    isActive && isSection && "ring-2 ring-black dark:ring-white border-transparent",
                    isDragging && "opacity-40 scale-[0.98]",
                    isDragOver && "border-blue-500 border-2 scale-[1.01]",
                  )}
                >
                  {/* Card Header with Grip Handle, Block Type Badge & Controls */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      {/* Drag Handle */}
                      <div
                        className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground/60 hover:text-foreground rounded-lg hover:bg-muted/60"
                        title="Drag to reorder block"
                      >
                        <GripVertical className="h-4 w-4" />
                      </div>

                      {/* Type Badge */}
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider border",
                          isSection
                            ? "bg-black text-white dark:bg-white dark:text-black border-transparent"
                            : "bg-muted text-foreground border-border",
                        )}
                      >
                        {isSection && <Layers className="h-3 w-3" />}
                        {block.type === "question" && <HelpCircle className="h-3 w-3" />}
                        {block.type === "email" && <Mail className="h-3 w-3" />}
                        {block.type === "number" && <Hash className="h-3 w-3" />}
                        {block.type === "multiple_choice" && <CheckSquare className="h-3 w-3" />}
                        {block.type === "image" && <ImageIcon className="h-3 w-3" />}
                        {block.type === "file" && <FileUp className="h-3 w-3" />}
                        {block.type === "video" && <Video className="h-3 w-3" />}
                        {block.type === "poll" && <BarChart2 className="h-3 w-3" />}
                        <span>{block.type.replace("_", " ")}</span>
                      </span>

                      {block.required && !isSection && (
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-md">
                          * Required
                        </span>
                      )}

                      {isSection && (
                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                          {block.sectionBadge || "Page Break"}
                        </span>
                      )}
                    </div>

                    {/* Quick Block Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          actions.reorderFormBlocks(index, index - 1);
                        }}
                        className="grid h-6 w-6 place-items-center rounded-md hover:bg-muted text-muted-foreground disabled:opacity-20"
                        title="Move Up"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={index === blocks.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          actions.reorderFormBlocks(index, index + 1);
                        }}
                        className="grid h-6 w-6 place-items-center rounded-md hover:bg-muted text-muted-foreground disabled:opacity-20"
                        title="Move Down"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          actions.duplicateFormBlock(block.id);
                          toast.success("Block duplicated");
                        }}
                        className="grid h-6 w-6 place-items-center rounded-md hover:bg-muted text-muted-foreground"
                        title="Duplicate"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          actions.removeFormBlock(block.id);
                          toast.info("Block removed");
                        }}
                        className="grid h-6 w-6 place-items-center rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500"
                        title="Delete block"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Block Content Display / Inline Preview */}
                  <div className="space-y-1.5 pl-6">
                    <h3
                      className={cn(
                        "font-bold text-foreground",
                        isSection ? "text-sm sm:text-base tracking-tight font-black" : "text-xs sm:text-sm",
                      )}
                    >
                      {block.title}
                    </h3>
                    {block.description && (
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {block.description}
                      </p>
                    )}

                    {/* Preview of block widget */}
                    <div className="pt-1">
                      <BlockWidgetPreview block={block} />
                    </div>
                  </div>

                  {/* ACTIVE CUSTOMIZATION DRAWER (when clicked) */}
                  {isActive && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3.5 pt-3.5 border-t border-border space-y-3 bg-muted/20 -mx-3.5 -mb-3.5 p-3.5 rounded-b-2xl cursor-default"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                        <span>Customize Block Details</span>
                        <span className="text-[10px] text-muted-foreground">Auto-saved</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">
                            Block Title / Label
                          </label>
                          <input
                            type="text"
                            value={block.title}
                            onChange={(e) =>
                              actions.updateFormBlock(block.id, { title: e.target.value })
                            }
                            className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold outline-none focus:border-foreground"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">
                            Description / Help Text
                          </label>
                          <input
                            type="text"
                            value={block.description || ""}
                            onChange={(e) =>
                              actions.updateFormBlock(block.id, { description: e.target.value })
                            }
                            placeholder="Optional instructions for client..."
                            className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium outline-none focus:border-foreground"
                          />
                        </div>
                      </div>

                      {/* Block Specific Controls */}
                      <BlockSpecificCustomizer block={block} />

                      {/* Footer options: Required toggle & Type switch */}
                      <div className="flex items-center justify-between pt-1">
                        {!isSection ? (
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                            <input
                              type="checkbox"
                              checked={Boolean(block.required)}
                              onChange={(e) =>
                                actions.updateFormBlock(block.id, { required: e.target.checked })
                              }
                              className="h-4 w-4 rounded accent-black dark:accent-white"
                            />
                            <span>Client must answer this block</span>
                          </label>
                        ) : (
                          <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                            Page break active: splits booking into multi-step pages
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase">
                            Type:
                          </label>
                          <select
                            value={block.type}
                            onChange={(e) => {
                              const newType = e.target.value as FormBlockType;
                              actions.updateFormBlock(block.id, { type: newType });
                            }}
                            className="rounded-lg border border-border bg-card px-2 py-1 text-xs font-semibold outline-none"
                          >
                            {BLOCK_TYPE_CARDS.map((c) => (
                              <option key={c.type} value={c.type}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Insertion line with + button between every block */}
                <InsertDividerLine
                  index={index + 1}
                  isOpen={insertModalIndex === index + 1}
                  onToggle={() =>
                    setInsertModalIndex(insertModalIndex === index + 1 ? null : index + 1)
                  }
                  onSelectBlockType={(type) => {
                    handleAddBlock(type, index + 1);
                    setInsertModalIndex(null);
                  }}
                />
              </React.Fragment>
            );
          })}

          {blocks.length === 0 && (
            <div className="py-8 text-center rounded-2xl border-2 border-dashed border-border p-6 text-muted-foreground space-y-3">
              <Layers className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <div>
                <p className="font-bold text-foreground text-sm">No blocks in this booking form yet</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose a block from the cards below to construct your custom booking form
                </p>
              </div>
              <InsertDividerLine
                index={0}
                isOpen={true}
                onToggle={() => {}}
                onSelectBlockType={(type) => {
                  handleAddBlock(type, 0);
                  setInsertModalIndex(null);
                }}
                isTop
              />
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODE 2: LIVE MULTI-PAGE BOOKING FORM PREVIEW */}
      {/* ===================================================================== */}
      {previewMode === "preview" && (
        <div className="space-y-4 rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm">
          {/* Header indicator */}
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                Client View • Interactive Booking Form
              </span>
              <h2 className="text-sm sm:text-base font-black text-foreground">
                {pages[previewCurrentPage]?.sectionBlock?.title || `Page ${previewCurrentPage + 1}`}
              </h2>
              {pages[previewCurrentPage]?.sectionBlock?.description && (
                <p className="text-xs text-muted-foreground">
                  {pages[previewCurrentPage]?.sectionBlock?.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-extrabold text-foreground">
                Page {previewCurrentPage + 1} of {Math.max(1, pages.length)}
              </span>
            </div>
          </div>

          {/* Stepper progress indicator bar */}
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(1, pages.length)}, minmax(0, 1fr))` }}>
            {pages.map((p, idx) => (
              <div
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  previewCurrentPage >= idx ? "bg-black dark:bg-white" : "bg-muted",
                )}
              />
            ))}
          </div>

          {/* Render Current Page's Blocks */}
          <div className="space-y-4 pt-2">
            {pages[previewCurrentPage]?.blocks.map((block) => (
              <div key={block.id} className="rounded-2xl border border-border p-3.5 space-y-2 bg-muted/10">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <label className="text-xs font-bold text-foreground block">
                      {block.title}
                      {block.required && <span className="text-rose-500 ml-1">*</span>}
                    </label>
                    {block.description && (
                      <p className="text-[11px] text-muted-foreground">{block.description}</p>
                    )}
                  </div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {block.type.replace("_", " ")}
                  </span>
                </div>

                {/* Interactive Client Input for this block */}
                <div className="pt-1">
                  <InteractiveClientInput
                    block={block}
                    value={previewAnswers[block.id]}
                    onChange={(val) =>
                      setPreviewAnswers((prev) => ({ ...prev, [block.id]: val }))
                    }
                  />
                </div>
              </div>
            ))}

            {(!pages[previewCurrentPage] || pages[previewCurrentPage].blocks.length === 0) && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No question blocks on this section page. Click Edit to add some!
              </div>
            )}
          </div>

          {/* Bottom Page Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button
              type="button"
              disabled={previewCurrentPage === 0}
              onClick={() => setPreviewCurrentPage((p) => Math.max(0, p - 1))}
              className="flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-xs font-bold text-foreground hover:bg-muted disabled:opacity-30 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Previous Page</span>
            </button>

            {previewCurrentPage < pages.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  setPreviewCurrentPage((p) => Math.min(pages.length - 1, p + 1));
                  toast.success("Advanced to next section page");
                }}
                className="flex items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800 dark:bg-white dark:text-black transition"
              >
                <span>
                  {pages[previewCurrentPage]?.sectionBlock?.nextButtonLabel || "Next Page"}
                </span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  toast.success("Booking form completed! In real booking, client is taken to final confirmation.");
                }}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Confirm & Submit Booking</span>
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// ---------------------------------------------------------------------------
// SUB-COMPONENT: The "+" Divider line between blocks with inline side-by-side cards
// ---------------------------------------------------------------------------
function InsertDividerLine({
  index,
  isOpen,
  onToggle,
  onSelectBlockType,
  isTop = false,
}: {
  index: number;
  isOpen?: boolean;
  onToggle?: () => void;
  onSelectBlockType?: (type: FormBlockType) => void;
  isTop?: boolean;
}) {
  if (isOpen && onSelectBlockType) {
    return (
      <div className="rounded-2xl border border-black/20 dark:border-white/20 bg-muted/40 p-3 my-2 space-y-2 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-black text-white dark:bg-white dark:text-black text-[10px] font-black">
              +
            </span>
            <span className="text-xs font-bold text-foreground">
              Select Block to Insert at Position #{index + 1}
            </span>
          </div>
          {onToggle && (
            <button
              type="button"
              onClick={onToggle}
              className="rounded-lg px-2 py-0.5 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              Cancel ✕
            </button>
          )}
        </div>

        {/* Side-by-side cards strip directly between blocks (NO POPUP) */}
        <div className="flex items-stretch gap-2.5 overflow-x-auto pb-2 pt-1 no-scrollbar">
          {BLOCK_TYPE_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.type}
                type="button"
                onClick={() => onSelectBlockType(card.type)}
                className="flex flex-col justify-between min-w-[145px] max-w-[160px] p-2.5 rounded-xl border border-border bg-card hover:border-black dark:hover:border-white text-left transition shrink-0 active:scale-95 group shadow-2xs"
              >
                <div>
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <div className={cn("grid h-7 w-7 place-items-center rounded-lg border", card.accentColor)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{card.badge}</span>
                  </div>
                  <span className="font-bold text-xs text-foreground group-hover:underline block">{card.title}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2 leading-tight block">
                    {card.description}
                  </span>
                </div>
                <div className="mt-2 text-[10px] font-bold text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform">
                  + Select &rarr;
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative flex items-center justify-center my-1.5 py-1">
      {/* Background divider line */}
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-dashed border-border group-hover:border-foreground/30 transition" />
      </div>

      {/* Centered + Button */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "relative flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-bold text-muted-foreground shadow-2xs transition group-hover:border-foreground group-hover:text-foreground group-hover:scale-105 active:scale-95",
          isTop && "opacity-80",
        )}
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SUB-COMPONENT: Preview of widget based on block type
// ---------------------------------------------------------------------------
function BlockWidgetPreview({ block }: { block: FormBlock }) {
  switch (block.type) {
    case "question":
      return (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          Text Input Field
        </div>
      );
    case "email":
      return (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Email Address Input</span>
        </div>
      );
    case "number":
      return (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          <Hash className="h-3.5 w-3.5" />
          <span>
            {block.unitPrefix || ""} Number Input {block.unitSuffix || ""}
          </span>
        </div>
      );
    case "multiple_choice":
      return (
        <div className="space-y-1.5 pt-0.5">
          {(block.options || ["Choice 1", "Choice 2"]).slice(0, 3).map((opt, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-3.5 w-3.5 rounded-full border border-border shrink-0" />
              <span>{opt}</span>
            </div>
          ))}
          {(block.options?.length || 0) > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{block.options!.length - 3} more options...
            </span>
          )}
        </div>
      );
    case "image":
      return (
        <div className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground">
          <UploadCloud className="h-4 w-4 text-pink-600" />
          <span>Upload Image</span>
        </div>
      );
    case "file":
      return (
        <div className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground">
          <FileUp className="h-4 w-4 text-cyan-600" />
          <span>Upload Document</span>
        </div>
      );
    case "video":
      return (
        <div className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border bg-card px-3.5 py-2 text-xs font-bold text-foreground">
          <Video className="h-4 w-4 text-red-600" />
          <span>Upload Video</span>
        </div>
      );
    case "poll":
      return (
        <div className="space-y-1.5 pt-0.5">
          {(block.options || ["Option 1", "Option 2"]).map((opt, i) => {
            const votes = block.pollVotes?.[String(i)] || 10 * (i + 1);
            const total = 50;
            const pct = Math.min(100, Math.round((votes / total) * 100));
            return (
              <div key={i} className="rounded-lg bg-muted/40 p-2 text-xs relative overflow-hidden">
                <div
                  className="absolute left-0 top-0 bottom-0 bg-indigo-500/15"
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center justify-between">
                  <span className="font-semibold text-foreground">{opt}</span>
                  <span className="text-[10px] font-bold text-muted-foreground">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      );
    case "section":
      return (
        <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-bold pt-1">
          <Layers className="h-4 w-4" />
          <span>Next Button Label: "{block.nextButtonLabel || "Next Page"}"</span>
        </div>
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// SUB-COMPONENT: Block-specific customizer inputs
// ---------------------------------------------------------------------------
function BlockSpecificCustomizer({ block }: { block: FormBlock }) {
  switch (block.type) {
    case "question":
    case "email":
      return null;
    case "number":
      return (
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Prefix</label>
            <input
              type="text"
              value={block.unitPrefix || ""}
              onChange={(e) => actions.updateFormBlock(block.id, { unitPrefix: e.target.value })}
              placeholder="e.g. £"
              className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Suffix</label>
            <input
              type="text"
              value={block.unitSuffix || ""}
              onChange={(e) => actions.updateFormBlock(block.id, { unitSuffix: e.target.value })}
              placeholder="e.g. sq ft"
              className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase">Step</label>
            <input
              type="number"
              value={block.step || 1}
              onChange={(e) => actions.updateFormBlock(block.id, { step: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold outline-none"
            />
          </div>
        </div>
      );
    case "multiple_choice":
    case "poll":
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-muted-foreground uppercase">
              Manage Choices / Poll Options
            </label>
            <button
              type="button"
              onClick={() => {
                const current = block.options || [];
                actions.updateFormBlock(block.id, {
                  options: [...current, `Choice ${current.length + 1}`],
                });
              }}
              className="text-[10px] font-bold text-foreground underline flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              <span>Add Option</span>
            </button>
          </div>
          <div className="space-y-1.5">
            {(block.options || []).map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}.</span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const next = [...(block.options || [])];
                    next[i] = e.target.value;
                    actions.updateFormBlock(block.id, { options: next });
                  }}
                  className="flex-1 rounded-xl border border-border bg-card px-3 py-1 text-xs font-medium outline-none focus:border-foreground"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = (block.options || []).filter((_, idx) => idx !== i);
                    actions.updateFormBlock(block.id, { options: next });
                  }}
                  className="text-muted-foreground hover:text-rose-500 p-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      );
    case "image":
    case "video":
      return (
        <div>
          <label className="text-[10px] font-bold text-muted-foreground uppercase">
            Upload Instructions / Notes
          </label>
          <input
            type="text"
            value={block.caption || ""}
            onChange={(e) => actions.updateFormBlock(block.id, { caption: e.target.value })}
            className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium outline-none focus:border-foreground"
          />
        </div>
      );
    case "file":
      return (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase">
              Allowed Extensions (comma separated)
            </label>
            <input
              type="text"
              value={(block.allowedExtensions || []).join(", ")}
              onChange={(e) =>
                actions.updateFormBlock(block.id, {
                  allowedExtensions: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                })
              }
              className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase">
              Max Size (MB)
            </label>
            <input
              type="number"
              value={block.maxFileSizeMb || 25}
              onChange={(e) =>
                actions.updateFormBlock(block.id, { maxFileSizeMb: Number(e.target.value) })
              }
              className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium outline-none"
            />
          </div>
        </div>
      );
    case "section":
      return (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase">
              Section Badge Tag
            </label>
            <input
              type="text"
              value={block.sectionBadge || ""}
              onChange={(e) => actions.updateFormBlock(block.id, { sectionBadge: e.target.value })}
              placeholder="e.g. Page 2"
              className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase">
              Next Button Text
            </label>
            <input
              type="text"
              value={block.nextButtonLabel || ""}
              onChange={(e) => actions.updateFormBlock(block.id, { nextButtonLabel: e.target.value })}
              placeholder="e.g. Next Page"
              className="mt-1 w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium outline-none"
            />
          </div>
        </div>
      );
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// SUB-COMPONENT: Interactive Client Input in Live Booking Form Preview
// ---------------------------------------------------------------------------
export function InteractiveClientInput({
  block,
  value,
  onChange,
}: {
  block: FormBlock;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  switch (block.type) {
    case "question":
      return (
        <textarea
          rows={2}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-card p-2.5 text-xs outline-none focus:border-foreground resize-none"
        />
      );
    case "email":
      return (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <input
            type="email"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-xs font-medium outline-none"
          />
        </div>
      );
    case "number":
      return (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
          {block.unitPrefix && <span className="font-bold text-xs">{block.unitPrefix}</span>}
          <input
            type="number"
            min={block.minValue}
            max={block.maxValue}
            step={block.step || 1}
            value={typeof value === "number" || typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-transparent text-xs font-semibold outline-none"
          />
          {block.unitSuffix && (
            <span className="text-xs text-muted-foreground">{block.unitSuffix}</span>
          )}
        </div>
      );
    case "multiple_choice":
      return (
        <div className="space-y-1.5">
          {(block.options || []).map((opt) => {
            const isSelected = value === opt;
            return (
              <label
                key={opt}
                onClick={() => onChange(opt)}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl border p-2.5 text-xs font-semibold cursor-pointer transition",
                  isSelected
                    ? "border-black bg-black text-white dark:border-white dark:bg-white dark:text-black font-bold shadow-2xs"
                    : "border-border bg-card text-foreground hover:bg-muted/50",
                )}
              >
                <div
                  className={cn(
                    "grid h-4 w-4 place-items-center rounded-full border shrink-0",
                    isSelected ? "border-current bg-current text-white dark:text-black" : "border-border",
                  )}
                >
                  {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-card" />}
                </div>
                <span>{opt}</span>
              </label>
            );
          })}
        </div>
      );
    case "image":
      return (
        <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card p-3 text-xs font-bold text-foreground cursor-pointer hover:bg-muted/40 transition">
          <UploadCloud className="h-4 w-4 text-muted-foreground" />
          <span>{value ? "Image Uploaded" : "Upload Image"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                onChange(URL.createObjectURL(f));
                toast.success("Image uploaded");
              }
            }}
          />
        </label>
      );
    case "file":
      return (
        <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card p-3 text-xs font-bold text-foreground cursor-pointer hover:bg-muted/40 transition">
          <FileUp className="h-4 w-4 text-muted-foreground" />
          <span>{typeof value === "string" ? value : "Upload Document"}</span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                onChange(f.name);
                toast.success(`Attached ${f.name}`);
              }
            }}
          />
        </label>
      );
    case "video":
      return (
        <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-card p-3 text-xs font-bold text-foreground cursor-pointer hover:bg-muted/40 transition">
          <Video className="h-4 w-4 text-muted-foreground" />
          <span>{value ? "Video Uploaded" : "Upload Video"}</span>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                onChange(f.name);
                toast.success(`Attached ${f.name}`);
              }
            }}
          />
        </label>
      );
    case "poll":
      return (
        <div className="space-y-1.5">
          {(block.options || []).map((opt, i) => {
            const isVoted = value === opt;
            const currentVotes = (block.pollVotes?.[String(i)] || 10) + (isVoted ? 1 : 0);
            const totalVotes = 60 + (value ? 1 : 0);
            const pct = Math.round((currentVotes / totalVotes) * 100);

            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={cn(
                  "w-full text-left rounded-xl border p-2.5 text-xs transition relative overflow-hidden group",
                  isVoted
                    ? "border-black dark:border-white font-bold"
                    : "border-border bg-card hover:bg-muted/40",
                )}
              >
                <div
                  className={cn(
                    "absolute left-0 top-0 bottom-0 transition-all duration-300",
                    isVoted ? "bg-indigo-500/25" : "bg-muted/60",
                  )}
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "grid h-3.5 w-3.5 place-items-center rounded-full border",
                        isVoted ? "border-indigo-600 bg-indigo-600 text-white" : "border-border",
                      )}
                    >
                      {isVoted && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-foreground">{opt}</span>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground">{pct}%</span>
                </div>
              </button>
            );
          })}
        </div>
      );
    default:
      return null;
  }
}
