import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { CheckCircle2, Download, Copy, Check } from "lucide-react";
import { Shell, TopBar, IosShareIcon } from "@/components/app-ui";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/provider/qr")({
  head: () => ({
    meta: [
      { title: "Your QR Code | Expertene" },
      {
        name: "description",
        content: "Download and share your unique Expertene QR code with central brand badge.",
      },
      { property: "og:title", content: "Your QR Code | Expertene" },
      { property: "og:description", content: "Scan to visit verified professional portfolio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QRPage,
});

function QRPage() {
  const business = useStore((s) => s.business);
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUrl(`${window.location.origin}/trader/james-wilson`);
  }, []);

  const download = () => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;

    // Composite high-res canvas with centered Zifily logo
    const exportCanvas = document.createElement("canvas");
    const size = 600;
    exportCanvas.width = size;
    exportCanvas.height = size;
    const ctx = exportCanvas.getContext("2d");
    if (!ctx) return;

    const triggerDownload = () => {
      const a = document.createElement("a");
      a.href = exportCanvas.toDataURL("image/png");
      a.download = "zifily-provider-qr.png";
      a.click();
      toast.success("QR Code downloaded with central Zifily logo");
    };

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Draw QR canvas scaled
    const margin = 40;
    ctx.drawImage(canvas, margin, margin, size - margin * 2, size - margin * 2);

    // Load Zifily logo for center of canvas
    const logoImg = new Image();
    logoImg.crossOrigin = "anonymous";
    logoImg.src = "/assets/zifily-light.png";

    const drawCenter = () => {
      const logoSize = 100;
      const logoX = (size - logoSize) / 2;
      const logoY = (size - logoSize) / 2;

      ctx.save();
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      ctx.restore();
      triggerDownload();
    };

    logoImg.onload = drawCenter;
    logoImg.onerror = () => {
      triggerDownload();
    };
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `${business.name} • Zifily`, url });
      } catch (err) {
        console.warn("Share cancelled or failed", err);
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Shell>
      <div className="mx-auto max-w-md pb-12">
        <TopBar title="Zifily QR Code" />
        <div className="px-6 text-center">
          {/* Centered QR code container */}
          <div
            ref={qrRef}
            className="relative mx-auto mt-4 w-fit rounded-3xl border border-black/10 bg-white p-6 shadow-md dark:border-white/10"
          >
            {url && (
              <QRCodeCanvas
                id="qr"
                value={url}
                size={230}
                level="H"
                marginSize={1}
                bgColor="#ffffff"
                fgColor="#000000"
                imageSettings={{
                  src: "/assets/zifily-light.png",
                  height: 48,
                  width: 48,
                  excavate: true,
                }}
              />
            )}
            {/* Overlay Bigger Zifily Logo without awkward BG in exact center */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <img
                src="/assets/zifily-light.png"
                alt="Zifily"
                className="h-12 w-12 object-contain"
              />
            </div>
          </div>

          <h2 className="mt-4 text-lg font-bold tracking-tight">{business.name}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Verified Zifily Professional Link</p>

          {/* Copyable link */}
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-black/15 bg-muted/40 p-1.5 dark:border-white/15">
            <span className="flex-1 truncate px-2 font-mono text-[11px] text-foreground text-left">
              {url}
            </span>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1 rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-black"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>

          {/* Buttons: Download & Redesigned iOS Share Button */}
          <button
            onClick={download}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3.5 font-semibold text-xs text-white transition hover:bg-black/90 active:scale-[0.99] dark:bg-white dark:text-black dark:hover:bg-white/90"
          >
            <Download className="h-4 w-4" />
            Download QR Code (PNG)
          </button>

          <button
            onClick={share}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-black/15 py-3.5 font-semibold text-xs hover:border-black active:scale-[0.99] dark:border-white/15 dark:hover:border-white"
          >
            <IosShareIcon className="h-4 w-4" />
            Share Profile
          </button>

          <div className="mt-8 text-left border-t border-black/10 pt-5 dark:border-white/10">
            <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
              Ways to deploy your Zifily QR:
            </p>
            <ul className="mt-3 space-y-2 text-xs">
              {[
                "Digital business cards and email signatures",
                "Portfolio headers and LinkedIn profiles",
                "Client invoices and proposal documents",
                "Service vehicles, storefronts, and pop-up banners",
                "Flyers, print cards, and client leave-behinds",
              ].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 fill-black text-white dark:fill-white dark:text-black" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Shell>
  );
}
