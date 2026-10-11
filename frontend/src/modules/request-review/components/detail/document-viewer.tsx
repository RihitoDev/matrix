"use client";

import { useState } from "react";
import { Download, FileText, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import type { DocumentViewerProps } from "../../types/document-viewer-props.types";

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SCALE_STEP = 0.25;
// Oculta la barra y el panel del visor integrado del navegador
const PDF_VIEWER_FRAGMENT = "#toolbar=0&navpanes=0&view=FitH";
const TOOL_CLASS = "bg-surface/10 text-surface hover:bg-surface/20 hover:text-surface";

export function DocumentViewer({ url, mimeType, fileName, caption }: DocumentViewerProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const isPdf = mimeType === "application/pdf";

  return (
    <div className="flex flex-col overflow-hidden rounded-[10px] bg-ink">
      <div className="flex items-center gap-2 border-b border-surface/10 px-4 py-3" role="toolbar" aria-label="Herramientas del documento">
        <FileText className="size-4 shrink-0 text-surface" strokeWidth={1.75} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-surface">{fileName}</span>
        {!isPdf && (
          <>
            <span className="text-xs text-surface/70" aria-live="polite">
              {Math.round(scale * 100)} %
            </span>
            <Button variant="ghost" size="icon-sm" className={TOOL_CLASS} aria-label="Acercar" onClick={() => setScale((s) => Math.min(MAX_SCALE, s + SCALE_STEP))} disabled={scale >= MAX_SCALE}>
              <ZoomIn strokeWidth={1.75} aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon-sm" className={TOOL_CLASS} aria-label="Alejar" onClick={() => setScale((s) => Math.max(MIN_SCALE, s - SCALE_STEP))} disabled={scale <= MIN_SCALE}>
              <ZoomOut strokeWidth={1.75} aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon-sm" className={TOOL_CLASS} aria-label="Rotar" onClick={() => setRotation((r) => (r + 90) % 360)}>
              <RotateCw strokeWidth={1.75} aria-hidden="true" />
            </Button>
          </>
        )}
        {/* Button con render={<a />} no es un botón nativo; por eso se usa <a> con las clases de buttonVariants */}
        <a
          href={url}
          download={fileName}
          rel="noopener noreferrer"
          aria-label="Descargar"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), TOOL_CLASS)}
        >
          <Download strokeWidth={1.75} aria-hidden="true" />
        </a>
      </div>
      <div className={isPdf ? "flex h-[36rem] items-center justify-center p-4" : "flex items-center justify-center overflow-auto p-6"}>
        {isPdf ? (
          <iframe src={`${url}${PDF_VIEWER_FRAGMENT}`} title="Documento de respaldo" className="h-full w-full bg-surface" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Documento de respaldo"
            className="max-h-[32rem] max-w-full origin-center bg-surface shadow-lg transition-transform"
            style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
          />
        )}
      </div>
      {caption ? (
        <p className="border-t border-surface/10 px-4 py-3 text-xs text-surface/70">{caption}</p>
      ) : null}
    </div>
  );
}
