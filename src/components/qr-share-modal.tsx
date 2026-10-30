import { useState, useRef } from "react";
import { Check, Copy, Download, Share2, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";

interface QrShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  url: string;
}

export function QrShareModal({ isOpen, onClose, title, subtitle, url }: QrShareModalProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: subtitle || `Book ${title} on Zifily`,
          url,
        });
      } catch (err) {
        console.warn("Share was closed or cancelled", err);
      }
    } else {
      handleCopy();
    }
  };

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    // Create export canvas with the centered Zifily logo directly embedded without background
    const size = 600;
    exportCanvas.width = size;
    exportCanvas.height = size;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    const triggerDownload = () => {
      const link = document.createElement("a");
      link.href = exportCanvas.toDataURL("image/png");
      link.download = `${title.toLowerCase().replace(/\s+/g, "-")}-zifily-qr.png`;
      link.click();
      toast.success("QR code downloaded");
    };

    // White background for QR code
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Draw QR canvas scaled up
    const margin = 40;
    ctx.drawImage(canvas, margin, margin, size - margin * 2, size - margin * 2);

    // Load Zifily logo
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.src = "/assets/zifily-dark.png";

    const drawCenterBadge = () => {
      const logoSize = 84;
      const logoX = (size - logoSize) / 2;
      const logoY = (size - logoSize) / 2;

      ctx.save();
      // Draw properly sized logo directly without background box
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      ctx.restore();
      triggerDownload();
    };

    logoImg.onload = drawCenterBadge;
    logoImg.onerror = () => {
      triggerDownload();
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm rounded-3xl border border-black/10 bg-background p-6 shadow-2xl dark:border-white/10 dark:bg-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-black/10 hover:bg-muted dark:border-white/10"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="text-center pt-1">
          <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>

        {/* QR Code Container with Centered Properly Small Zifily Logo without BG */}
        <div
          ref={qrRef}
          className="relative mx-auto mt-5 w-fit rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10"
        >
          <QRCodeCanvas
            value={url}
            size={200}
            level="H"
            marginSize={1}
            imageSettings={{
              src: "/assets/zifily-dark.png",
              height: 34,
              width: 34,
              excavate: true,
            }}
          />
          {/* Centered Zifily Logo without background container */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <img src="/assets/zifily-dark.png" alt="Zifily" className="h-9 w-9 object-contain" />
          </div>
        </div>

        {/* Copy Link Input */}
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-black/15 bg-muted/40 p-1.5 dark:border-white/15">
          <input
            type="text"
            readOnly
            value={url}
            className="flex-1 truncate bg-transparent px-2 font-mono text-[11px] text-foreground outline-none"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-black/90 active:scale-95 dark:bg-white dark:text-black"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-black py-2.5 text-xs font-semibold text-white transition hover:bg-black/90 active:scale-95 dark:bg-white dark:text-black"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share Link
          </button>
          <button
            onClick={handleDownload}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-black/15 py-2.5 text-xs font-semibold hover:border-black active:scale-95 dark:border-white/15 dark:hover:border-white"
          >
            <Download className="h-3.5 w-3.5" />
            Download QR
          </button>
        </div>
      </div>
    </div>
  );
}
