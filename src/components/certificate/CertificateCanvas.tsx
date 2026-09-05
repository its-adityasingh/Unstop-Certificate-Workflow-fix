import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { TemplateArtwork, getTemplate } from "@/lib/certs/templates";
import { renderFieldText, renderTemplateString, type CertField, type CertLogo } from "@/lib/certs/types";
import { cn } from "@/lib/utils";

export interface CanvasSource {
  templateId: string | null;
  customImage: string | null;
  aspect: number;
  fields: CertField[];
  logos?: CertLogo[];
}

export function logoBoxStyle(logo: CertLogo, width: number, height: number) {
  return {
    position: "absolute" as const,
    left: logo.x * width,
    top: logo.y * height,
    width: logo.w * width,
    height: logo.h * height,
    transform: `rotate(${logo.rotation}deg)`,
    transformOrigin: "center center",
    opacity: logo.opacity,
  };
}

/**
 * Single source of truth for certificate rendering.
 * All geometry is normalized (0..1), so the editor, the preview and the
 * generated output are pixel-identical at any resolution.
 * Text never leaves its allocated box: it shrinks (and then wraps) to fit.
 */
export function fieldBoxStyle(field: CertField, width: number, height: number) {
  return {
    position: "absolute" as const,
    left: field.x * width,
    top: field.y * height,
    width: field.w * width,
    height: field.h * height,
    transform: `rotate(${field.rotation}deg)`,
    transformOrigin: "center center",
  };
}

export function fieldTextStyle(field: CertField, height: number, scale = 1) {
  return {
    fontFamily: `"${field.fontFamily}", sans-serif`,
    fontSize: field.fontSize * height * scale,
    fontWeight: field.fontWeight,
    fontStyle: field.italic ? ("italic" as const) : ("normal" as const),
    textDecoration: field.underline ? "underline" : "none",
    textTransform: field.uppercase ? ("uppercase" as const) : ("none" as const),
    textAlign: field.align,
    color: field.color,
    letterSpacing: `${field.letterSpacing}em`,
    lineHeight: field.lineHeight,
    opacity: field.opacity,
    width: "100%",
    whiteSpace: "pre-wrap" as const,
    overflowWrap: "anywhere" as const,
    wordBreak: "normal" as const,
  };
}

export function useMeasuredWidth<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const e = entries[0];
      if (e) setWidth(e.contentRect.width);
    });
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}

/**
 * Renders one field's text inside its fixed allocated box.
 * The box never changes size — only the font scale adapts, down to
 * `minFontScale` (default 35%), after which the text wraps inside the box.
 */
function FittedFieldText({
  field,
  text,
  boxWidth,
  boxHeight,
  canvasHeight,
}: {
  field: CertField;
  text: string;
  boxWidth: number;
  boxHeight: number;
  canvasHeight: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const autoFit = field.autoFit !== false;
  const minScale = field.minFontScale ?? 0.35;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !autoFit || boxWidth <= 0 || boxHeight <= 0) {
      setScale(1);
      return;
    }
    const base = field.fontSize * canvasHeight;
    if (base <= 0) return;

    const fits = (s: number) => {
      el.style.fontSize = `${base * s}px`;
      return el.scrollHeight <= boxHeight + 0.5 && el.scrollWidth <= boxWidth + 0.5;
    };

    const measure = () => {
      // never clip: if the configured minimum still overflows, keep shrinking
      const floor = fits(minScale) ? minScale : 0.05;
      let result = floor;
      if (fits(1)) {
        result = 1;
      } else {
        let lo = floor;
        let hi = 1;
        for (let i = 0; i < 16; i++) {
          const mid = (lo + hi) / 2;
          if (fits(mid)) lo = mid;
          else hi = mid;
        }
        result = lo;
      }
      el.style.fontSize = `${base * result}px`;
      setScale(result);
    };

    measure();
    let cancelled = false;
    // re-measure once webfonts finish loading (metrics change)
    void (document as Document & { fonts?: FontFaceSet }).fonts?.ready.then(() => {
      if (!cancelled && ref.current) measure();
    });
    return () => {
      cancelled = true;
    };
  }, [text, field.fontSize, field.fontFamily, field.fontWeight, field.letterSpacing, field.lineHeight, field.uppercase, field.italic, boxWidth, boxHeight, canvasHeight, autoFit, minScale]);


  const vAlign = field.vAlign ?? "middle";
  return (
    <div
      className="flex h-full w-full overflow-hidden"
      style={{
        alignItems: vAlign === "top" ? "flex-start" : vAlign === "bottom" ? "flex-end" : "center",
        justifyContent:
          field.align === "left" ? "flex-start" : field.align === "right" ? "flex-end" : "center",
      }}
    >
      <div ref={ref} style={fieldTextStyle(field, canvasHeight, scale)}>
        {text}
      </div>
    </div>
  );
}

interface Props {
  source: CanvasSource;
  data?: Record<string, string | boolean> | undefined;
  className?: string;
  /** overlay receives measured pixel size, for editor handles */
  overlay?: (size: { width: number; height: number }) => ReactNode;
  showPlaceholders?: boolean;
}

export function CertificateCanvas({ source, data, className, overlay, showPlaceholders }: Props) {
  const { ref, width } = useMeasuredWidth<HTMLDivElement>();
  const height = width / (source.aspect || 1.414);
  const template = getTemplate(source.templateId);

  return (
    <div
      ref={ref}
      className={cn("relative w-full overflow-hidden bg-white select-none", className)}
      style={{ aspectRatio: String(source.aspect || 1.414) }}
    >
      {source.customImage ? (
        <img
          src={source.customImage}
          alt="Certificate design"
          className="absolute inset-0 h-full w-full object-fill"
          draggable={false}
        />
      ) : template ? (
        <TemplateArtwork template={template} />
      ) : (
        <div className="absolute inset-0 grid-paper bg-muted" />
      )}

      {width > 0 &&
        (source.logos ?? []).map((logo) => (
          <div key={logo.id} style={logoBoxStyle(logo, width, height)}>
            <img
              src={logo.src}
              alt={logo.name || "Organization logo"}
              draggable={false}
              className="h-full w-full"
              style={{ objectFit: logo.fit === "fill" ? "fill" : logo.fit }}
            />
          </div>
        ))}

      {width > 0 &&
        source.fields.map((field) => {
          const text = data
            ? renderTemplateString(field.content, data)
            : showPlaceholders
              ? field.content
              : renderFieldText(field);
          return (
            <div key={field.id} style={fieldBoxStyle(field, width, height)}>
              <FittedFieldText
                field={field}
                text={text}
                boxWidth={field.w * width}
                boxHeight={field.h * height}
                canvasHeight={height}
              />
            </div>
          );
        })}

      {width > 0 && overlay?.({ width, height })}
    </div>
  );
}
