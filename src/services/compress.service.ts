import sharp from "sharp";
import { COMPRESS_MODES, CompressModeKey } from "../config/constants";

export interface CompressInput {
  imageBuffer: Buffer;
  mode?: CompressModeKey | string;
  format?: "webp" | "jpg" | "png" | "original";
}

export interface CompressOutput {
  success: boolean;
  outputBuffer?: Buffer;
  originalSizeBytes: number;
  outputSizeBytes: number;
  savedPercent: number;
  format: string;
  contentType: string;
  extension: string;
  processingTimeMs: number;
  dimensions?: { width: number; height: number };
  error?: string;
}

const DISCORD_FREE_LIMIT_BYTES = 8 * 1024 * 1024; // 8 MB

export async function compressImage(input: CompressInput): Promise<CompressOutput> {
  const startTime = Date.now();
  const originalSizeBytes = input.imageBuffer.length;
  const mode = (input.mode || COMPRESS_MODES.AUTO_8MB) as CompressModeKey;
  const preferredFormat = (input.format || "webp").toLowerCase();

  try {
    const meta = await sharp(input.imageBuffer).metadata();
    const origWidth = meta.width || 1200;
    const origHeight = meta.height || 800;

    let targetFormat: "webp" | "jpg" | "png" = "webp";
    if (preferredFormat === "jpg" || preferredFormat === "jpeg") {
      targetFormat = "jpg";
    } else if (preferredFormat === "png") {
      targetFormat = "png";
    } else if (preferredFormat === "original") {
      if (meta.format === "png") targetFormat = "png";
      else if (meta.format === "jpeg" || meta.format === "jpg") targetFormat = "jpg";
      else targetFormat = "webp";
    } else {
      targetFormat = "webp";
    }

    let quality = 75;
    if (mode === COMPRESS_MODES.LIGHT) quality = 82;
    else if (mode === COMPRESS_MODES.BALANCED) quality = 68;
    else if (mode === COMPRESS_MODES.EXTREME) quality = 45;
    else if (mode === COMPRESS_MODES.AUTO_8MB) quality = 75;

    async function encode(q: number, maxWidth?: number): Promise<{ buffer: Buffer; w: number; h: number }> {
      let pipeline = sharp(input.imageBuffer);

      let curW = origWidth;
      let curH = origHeight;

      if (maxWidth && origWidth > maxWidth) {
        curW = maxWidth;
        curH = Math.round((origHeight / origWidth) * maxWidth);
        pipeline = pipeline.resize(curW, curH, { fit: "inside", withoutEnlargement: true });
      }

      if (targetFormat === "png") {
        pipeline = pipeline.png({ compressionLevel: 9, palette: true, quality: q });
      } else if (targetFormat === "jpg") {
        pipeline = pipeline.jpeg({ quality: q, mozjpeg: true });
      } else {
        pipeline = pipeline.webp({ quality: q, effort: 4 });
      }

      const buffer = await pipeline.toBuffer();
      return { buffer, w: curW, h: curH };
    }

    let result = await encode(quality);

    // If auto_8mb is requested and result still exceeds 8MB, iteratively optimize
    if (mode === COMPRESS_MODES.AUTO_8MB && result.buffer.length > DISCORD_FREE_LIMIT_BYTES) {
      const fallbackSteps = [
        { q: 65, maxWidth: 2560 },
        { q: 55, maxWidth: 2048 },
        { q: 45, maxWidth: 1920 },
      ];

      for (const step of fallbackSteps) {
        if (result.buffer.length <= DISCORD_FREE_LIMIT_BYTES) break;
        result = await encode(step.q, step.maxWidth);
      }
    }

    const outputSizeBytes = result.buffer.length;
    const diff = originalSizeBytes - outputSizeBytes;
    const savedPercent = Math.round((diff / originalSizeBytes) * 100);

    const contentType =
      targetFormat === "png"
        ? "image/png"
        : targetFormat === "jpg"
        ? "image/jpeg"
        : "image/webp";

    return {
      success: true,
      outputBuffer: result.buffer,
      originalSizeBytes,
      outputSizeBytes,
      savedPercent,
      format: targetFormat,
      contentType,
      extension: targetFormat === "jpg" ? "jpg" : targetFormat,
      dimensions: { width: result.w, height: result.h },
      processingTimeMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      success: false,
      originalSizeBytes,
      outputSizeBytes: 0,
      savedPercent: 0,
      format: "webp",
      contentType: "image/webp",
      extension: "webp",
      processingTimeMs: Date.now() - startTime,
      error: err.message || "Gagal mengompresi gambar.",
    };
  }
}
