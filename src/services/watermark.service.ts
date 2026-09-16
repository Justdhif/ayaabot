import sharp from "sharp";
import { WATERMARK_POSITIONS, WATERMARK_OPACITY } from "../config/constants";

export interface WatermarkOptions {
  imageBuffer: Buffer;
  text: string;
  position?: string;
  opacity?: string;
}

export interface WatermarkResult {
  success: boolean;
  outputBuffer?: Buffer;
  originalWidth: number;
  originalHeight: number;
  processingTimeMs: number;
  error?: string;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

export async function applyWatermark(options: WatermarkOptions): Promise<WatermarkResult> {
  const startTime = Date.now();

  try {
    const image = sharp(options.imageBuffer);
    const metadata = await image.metadata();

    const width = metadata.width || 800;
    const height = metadata.height || 600;

    // Responsive font size & padding relative to image width
    const fontSize = Math.max(16, Math.min(72, Math.round(width * 0.038)));
    const padding = Math.max(16, Math.round(width * 0.03));

    // Opacity ratio
    let alpha = 0.7;
    if (options.opacity === WATERMARK_OPACITY.SUBTLE) {
      alpha = 0.38;
    } else if (options.opacity === WATERMARK_OPACITY.SOLID) {
      alpha = 0.98;
    }

    // Coordinates and text anchor based on position
    const pos = options.position || WATERMARK_POSITIONS.BOTTOM_RIGHT;
    let anchor = "end";
    let x = width - padding;
    let y = height - padding;

    if (pos === WATERMARK_POSITIONS.BOTTOM_LEFT) {
      anchor = "start";
      x = padding;
      y = height - padding;
    } else if (pos === WATERMARK_POSITIONS.CENTER) {
      anchor = "middle";
      x = Math.round(width / 2);
      y = Math.round(height / 2);
    } else if (pos === WATERMARK_POSITIONS.TOP_RIGHT) {
      anchor = "end";
      x = width - padding;
      y = padding + fontSize;
    }

    const safeText = escapeXml(options.text.trim() || "Ayaa Bot 🌸");

    // SVG Overlay with drop shadow for clarity on both dark and bright backgrounds
    const svgOverlay = Buffer.from(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <style>
          .wm-shadow {
            font-family: Arial, Helvetica, sans-serif;
            font-size: ${fontSize}px;
            font-weight: 800;
            fill: rgba(0, 0, 0, ${alpha * 0.75});
            text-anchor: ${anchor};
          }
          .wm-main {
            font-family: Arial, Helvetica, sans-serif;
            font-size: ${fontSize}px;
            font-weight: 800;
            fill: rgba(255, 255, 255, ${alpha});
            text-anchor: ${anchor};
          }
        </style>
        <!-- Drop Shadow -->
        <text x="${x + 2}" y="${y + 2}" class="wm-shadow">${safeText}</text>
        <!-- Main Text -->
        <text x="${x}" y="${y}" class="wm-main">${safeText}</text>
      </svg>
    `);

    const outputBuffer = await image
      .composite([{ input: svgOverlay, top: 0, left: 0 }])
      .png({ quality: 90 })
      .toBuffer();

    return {
      success: true,
      outputBuffer,
      originalWidth: width,
      originalHeight: height,
      processingTimeMs: Date.now() - startTime,
    };
  } catch (err: any) {
    console.error("[WatermarkService] Error applying watermark:", err);
    return {
      success: false,
      originalWidth: 0,
      originalHeight: 0,
      processingTimeMs: Date.now() - startTime,
      error: err?.message || "Gagal menerapkan watermark pada foto.",
    };
  }
}
