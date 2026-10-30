import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  GripVertical,
  X,
  Type,
  AlignLeft,
  Image as ImageIcon,
  Hash,
  ChevronDown,
  Calendar,
  Eye,
  Check,
  Edit2,
  ChevronUp,
  Plus,
} from "lucide-react";
import { Shell } from "@/components/app-ui";
import { useStore, actions, type BookingFormField } from "@/lib/store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/provider/intake")({
  head: () => ({
    meta: [
      { title: "Booking Form Setup | Zifly" },
      {
        name: "description",
        content: "Fields customers fill in when they book.",
      },
    ],
  }),
  component: ProviderIntakePage,
});

type FieldType = "text" | "longtext" | "image" | "number" | "dropdown" | "date";

export function ProviderIntakePage() {
  const router = useRouter();
  const userRole = useStore((s) => s.userRole);
  const intakeConfig = useStore((s) => s.providerCustomization.intakeConfig);

  useEffect(() => {
    if (userRole !== "provider") {
      actions.setUserRole("provider");
    }
  }, [userRole]);

  // Load from store or use initial PDF Page 48 fields
  const [fields, setFields] = useState<BookingFormField[]>(() => {
    if (intakeConfig?.formFields && intakeConfig.formFields.length > 0) {
      return intakeConfig.formFields;
    }
    return [
      {
        id: "f-1",
        name: "Project name",
        typeLabel: "Short text",
        fieldType: "text",
        required: true,
        enabled: true,
        placeholder: "e.g. Studio website",
      },
      {
        id: "f-2",
        name: "What do you need?",
        typeLabel: "Long text",
        fieldType: "longtext",
        required: true,
        enabled: true,
        placeholder: "Goals, pages, deadline",
      },
      {
        id: "f-3",
        name: "Reference images",
        typeLabel: "Image upload, up to 3",
        fieldType: "image",
        required: false,
        enabled: true,
        placeholder: "Up to 3 images. Optional.",
      },
      {
        id: "f-4",
        name: "Budget range",
        typeLabel: "Dropdown, 4 options",
        fieldType: "dropdown",
        required: false,
        enabled: true,
        options: ["₹10,000 to ₹25,000", "₹25,000 to ₹50,000", "₹50,000 to ₹1,00,000", "₹1,00,000+"],
      },
    ];
  });

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Edit field modal state
  const [editingField, setEditingField] = useState<BookingFormField | null>(null);
  const [editName, setEditName] = useState("");
  const [editPlaceholder, setEditPlaceholder] = useState("");
  const [editOptions, setEditOptions] = useState<string[]>([]);
  const [newOptionText, setNewOptionText] = useState("");

  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Open Edit Modal
  const openEditModal = (f: BookingFormField) => {
    setEditingField(f);
    setEditName(f.name);
    setEditPlaceholder(f.placeholder || "");
    setEditOptions(f.options ? [...f.options] : ["Option 1", "Option 2"]);
    setNewOptionText("");
  };

  const handleSaveFieldEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField || !editName.trim()) return;

    setFields((prev) =>
      prev.map((f) =>
        f.id === editingField.id
          ? {
              ...f,
              name: editName.trim(),
              placeholder: editPlaceholder.trim(),
              options: f.fieldType === "dropdown" ? editOptions : f.options,
            }
          : f,
      ),
    );
    toast.success(`Updated "${editName}" field`);
    setEditingField(null);
  };

  // Toggle field required
  const toggleRequired = (id: string) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, required: !f.required, enabled: !f.required ? true : f.enabled } : f,
      ),
    );
  };

  // Remove field
  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    toast.success("Field removed from booking form");
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
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
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const updated = [...fields];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, moved);
    setFields(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
    toast.success(`Moved "${moved.name}" to position ${targetIndex + 1}`);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Up/Down move for keyboard / mobile touch
  const moveField = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const updated = [...fields];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    setFields(updated);
  };

  // Add field from "ADD A FIELD" palette
  const addField = (type: FieldType) => {
    const typeMap: Record<FieldType, { name: string; label: string }> = {
      text: { name: "Client reference / Note", label: "Short text" },
      longtext: { name: "Additional specifications", label: "Long text" },
      image: { name: "Site photos / sketches", label: "Image upload, up to 3" },
      number: { name: "Estimated units / rooms", label: "Number" },
      dropdown: { name: "Preferred contact method", label: "Dropdown, 3 options" },
      date: { name: "Target completion date", label: "Date picker" },
    };

    const info = typeMap[type];
    const newField: BookingFormField = {
      id: "f-" + Math.random().toString(36).slice(2, 7),
      name: info.name,
      typeLabel: info.label,
      fieldType: type,
      required: false,
      enabled: true,
      placeholder: `Enter ${info.name.toLowerCase()}...`,
      options: type === "dropdown" ? ["Standard", "Express", "Custom"] : undefined,
    };

    setFields([...fields, newField]);
    toast.success(`Added ${info.name} field`);
  };

  const saveForm = () => {
    actions.updateIntakeConfig({
      enabled: true,
      formFields: fields,
      customQuestions: fields.map((f) => ({
        id: f.id,
        question: f.name,
        type: f.fieldType === "dropdown" ? "select" : "text",
        required: f.required,
        options: f.options,
      })),
    });
    toast.success("Booking form saved successfully!");
  };

  return (
    <Shell hideBottomNav>
      <div className="mx-auto max-w-md md:max-w-xl pb-28 pt-2 md:pt-6 px-3 sm:px-4 space-y-6">
        {/* Header matching Page 48 */}
        <div className="flex items-center gap-3">
          <Link
            to="/provider/dashboard"
            aria-label="Back"
            className="grid h-10 w-10 place-items-center rounded-full border border-black/10 hover:bg-muted active:scale-95 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Booking form</h1>
            <p className="text-xs text-muted-foreground">Fields customers fill in when they book</p>
          </div>
        </div>

        {/* Drag & Drop Hint */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-1">
          <span>Drag handle to reorder • Click field title to edit</span>
          <span>{fields.length} fields</span>
        </div>

        {/* Form Fields List matching Page 48 with Drag and Drop */}
        <div className="space-y-3">
          {fields.map((f, index) => {
            const isDragging = draggedIndex === index;
            const isOver = dragOverIndex === index;

            return (
              <div
                key={f.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "group relative flex items-center justify-between gap-3 rounded-2xl border border-black/10 bg-card p-3.5 shadow-xs transition-all duration-200 select-none dark:border-white/10",
                  isDragging && "opacity-40 scale-[0.98] ring-2 ring-[#5B4DF5]",
                  isOver &&
                    "border-[#5B4DF5] bg-[#EEF0FF]/30 dark:bg-indigo-950/20 ring-1 ring-[#5B4DF5]",
                )}
              >
                {/* Drag Handle & Info */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    title="Drag to reorder"
                    className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted-foreground/60 hover:text-foreground transition"
                  >
                    <GripVertical className="h-5 w-5 shrink-0" />
                  </div>

                  {/* Reorder arrows for mobile/touch */}
                  <div className="flex flex-col gap-0.5 sm:hidden">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveField(index, "up")}
                      className="text-muted-foreground/50 hover:text-foreground disabled:opacity-20"
                    >
                      <ChevronUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      disabled={index === fields.length - 1}
                      onClick={() => moveField(index, "down")}
                      className="text-muted-foreground/50 hover:text-foreground disabled:opacity-20"
                    >
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </div>

                  <div
                    onClick={() => openEditModal(f)}
                    className="min-w-0 flex-1 cursor-pointer hover:opacity-85"
                  >
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-xs sm:text-sm text-foreground truncate">
                        {f.name}
                      </p>
                      <Edit2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">{f.typeLabel}</p>
                  </div>
                </div>

                {/* Right controls: Purple Toggle switch + Delete button */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    {/* Purple toggle switch matching PDF Page 48 */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={f.required}
                      onClick={() => toggleRequired(f.id)}
                      className={cn(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none",
                        f.required ? "bg-[#5B4DF5]" : "bg-neutral-200 dark:bg-neutral-800",
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out mt-0.5",
                          f.required ? "translate-x-5" : "translate-x-0.5",
                        )}
                      />
                    </button>
                    <span className="text-[11px] font-semibold text-muted-foreground hidden xs:inline">
                      Required
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeField(f.id)}
                    aria-label="Delete field"
                    className="grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ADD A FIELD SECTION matching Page 48 */}
        <div className="space-y-2.5 pt-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            ADD A FIELD
          </h2>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => addField("text")}
              className="flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-card p-3.5 hover:border-black transition active:scale-95 dark:border-white/10 dark:hover:border-white shadow-xs"
            >
              <Type className="h-5 w-5 text-foreground" />
              <span className="mt-1.5 text-xs font-bold text-foreground">Text</span>
            </button>

            <button
              type="button"
              onClick={() => addField("longtext")}
              className="flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-card p-3.5 hover:border-black transition active:scale-95 dark:border-white/10 dark:hover:border-white shadow-xs"
            >
              <AlignLeft className="h-5 w-5 text-foreground" />
              <span className="mt-1.5 text-xs font-bold text-foreground">Long text</span>
            </button>

            <button
              type="button"
              onClick={() => addField("image")}
              className="flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-card p-3.5 hover:border-black transition active:scale-95 dark:border-white/10 dark:hover:border-white shadow-xs"
            >
              <ImageIcon className="h-5 w-5 text-foreground" />
              <span className="mt-1.5 text-xs font-bold text-foreground">Image</span>
            </button>

            <button
              type="button"
              onClick={() => addField("number")}
              className="flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-card p-3.5 hover:border-black transition active:scale-95 dark:border-white/10 dark:hover:border-white shadow-xs"
            >
              <Hash className="h-5 w-5 text-foreground" />
              <span className="mt-1.5 text-xs font-bold text-foreground">Number</span>
            </button>

            <button
              type="button"
              onClick={() => addField("dropdown")}
              className="flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-card p-3.5 hover:border-black transition active:scale-95 dark:border-white/10 dark:hover:border-white shadow-xs"
            >
              <ChevronDown className="h-5 w-5 text-foreground" />
              <span className="mt-1.5 text-xs font-bold text-foreground">Dropdown</span>
            </button>

            <button
              type="button"
              onClick={() => addField("date")}
              className="flex flex-col items-center justify-center rounded-2xl border border-black/10 bg-card p-3.5 hover:border-black transition active:scale-95 dark:border-white/10 dark:hover:border-white shadow-xs"
            >
              <Calendar className="h-5 w-5 text-foreground" />
              <span className="mt-1.5 text-xs font-bold text-foreground">Date</span>
            </button>
          </div>
        </div>

        {/* Bottom Buttons matching Page 48 */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="flex items-center justify-center rounded-2xl border border-black/20 bg-background py-3.5 text-xs font-bold text-foreground hover:bg-muted active:scale-95 transition dark:border-white/20"
          >
            Preview
          </button>
          <button
            type="button"
            onClick={saveForm}
            className="flex items-center justify-center rounded-2xl bg-[#5B4DF5] py-3.5 text-xs font-bold text-white hover:bg-[#4F46E5] active:scale-95 transition shadow-sm"
          >
            Save form
          </button>
        </div>

        {/* Edit Field Modal */}
        {editingField && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
            onClick={() => setEditingField(null)}
          >
            <div
              className="w-full max-w-sm rounded-3xl border border-black/15 bg-background p-5 shadow-2xl dark:border-white/15 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-base font-black">Edit Form Field</h3>
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveFieldEdit} className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">
                    Field Title / Question
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Project scope"
                    className="mt-1 h-10 w-full rounded-xl border border-black/15 bg-muted/20 px-3 text-xs outline-none focus:border-black dark:border-white/15"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-muted-foreground uppercase">
                    Placeholder Hint
                  </label>
                  <input
                    type="text"
                    value={editPlaceholder}
                    onChange={(e) => setEditPlaceholder(e.target.value)}
                    placeholder="Placeholder shown to client..."
                    className="mt-1 h-10 w-full rounded-xl border border-black/15 bg-muted/20 px-3 text-xs outline-none focus:border-black dark:border-white/15"
                  />
                </div>

                {editingField.fieldType === "dropdown" && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-muted-foreground uppercase">
                      Dropdown Options
                    </label>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {editOptions.map((opt, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const updated = [...editOptions];
                              updated[i] = e.target.value;
                              setEditOptions(updated);
                            }}
                            className="h-8 flex-1 rounded-lg border border-black/15 bg-muted/20 px-2.5 text-xs outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setEditOptions(editOptions.filter((_, idx) => idx !== i))
                            }
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={newOptionText}
                        onChange={(e) => setNewOptionText(e.target.value)}
                        placeholder="Add new option..."
                        className="h-8 flex-1 rounded-lg border border-black/15 bg-muted/20 px-2.5 text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newOptionText.trim()) return;
                          setEditOptions([...editOptions, newOptionText.trim()]);
                          setNewOptionText("");
                        }}
                        className="rounded-lg bg-[#5B4DF5] px-2.5 py-1.5 text-xs font-bold text-white shadow-2xs"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setEditingField(null)}
                    className="flex-1 rounded-xl border border-black/15 py-2.5 text-xs font-bold hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-[#5B4DF5] py-2.5 text-xs font-bold text-white hover:bg-[#4F46E5] shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Client Booking Experience Preview (Page 8 style) */}
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-md rounded-3xl border border-black/15 bg-background p-6 shadow-2xl dark:border-white/15 space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Step 4 of 5
                  </span>
                  <h3 className="text-base font-black">Your details</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground">
                Arjun asks for these details to prepare for your call.
              </p>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {fields.map((f) => (
                  <div key={f.id} className="space-y-1">
                    <label className="text-xs font-semibold text-foreground">
                      {f.name} {f.required && <span className="text-rose-500">*</span>}
                    </label>
                    {f.fieldType === "longtext" ? (
                      <textarea
                        disabled
                        rows={2}
                        placeholder={f.placeholder || "Goals, pages, deadline"}
                        className="w-full rounded-2xl border border-black/15 bg-muted/20 p-3 text-xs"
                      />
                    ) : f.fieldType === "image" ? (
                      <div className="rounded-2xl border border-dashed border-black/20 p-4 text-center text-xs text-muted-foreground">
                        + Add reference images (Up to 3 images)
                      </div>
                    ) : f.fieldType === "dropdown" ? (
                      <select
                        disabled
                        className="h-11 w-full rounded-2xl border border-black/15 bg-muted/20 px-3.5 text-xs text-muted-foreground"
                      >
                        {f.options?.map((opt, i) => (
                          <option key={i}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        disabled
                        placeholder={f.placeholder || `Enter ${f.name.toLowerCase()}...`}
                        className="h-11 w-full rounded-2xl border border-black/15 bg-muted/20 px-3.5 text-xs"
                      />
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="w-full rounded-2xl bg-[#5B4DF5] py-3 text-xs font-bold text-white shadow-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
