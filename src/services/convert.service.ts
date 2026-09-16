import sharp from "sharp";
import { CONVERT_FORMATS, ConvertFormatKey } from "../config/constants";

export interface ConvertInput {
  imageBuffer: Buffer;
  targetFormat: ConvertFormatKey | string;
  quality?: number;
}

export interface ConvertOutput {
  success: boolean;
  outputBuffer?: Buffer;
  targetFormat: string;
  contentType: string;
  extension: string;
  originalSizeBytes: number;
  outputSizeBytes: number;
  savedPercent: number;
  processingTimeMs: number;
  error?: string;
}

export async function convertImage(input: ConvertInput): Promise<ConvertOutput> {
  const startTime = Date.now();
  const rawFormat = (input.targetFormat || "webp").toLowerCase();
  const targetFormat =
    rawFormat === "jpeg" || rawFormat === "jpg"
      ? CONVERT_FORMATS.JPG
      : rawFormat === "png"
      ? CONVERT_FORMATS.PNG
      : CONVERT_FORMATS.WEBP;

  const quality = Math.min(Math.max(input.quality || 85, 10), 100);
  const originalSizeBytes = input.imageBuffer.length;

  try {
    let pipeline = sharp(input.imageBuffer);
    let contentType = "image/webp";
    let extension = "webp";

    switch (targetFormat) {
      case CONVERT_FORMATS.PNG:
        contentType = "image/png";
        extension = "png";
        pipeline = pipeline.png({
          compressionLevel: 8,
          adaptiveFiltering: true,
        });
        break;

      case CONVERT_FORMATS.JPG:
        contentType = "image/jpeg";
        extension = "jpg";
        pipeline = pipeline.jpeg({
          quality,
          mozjpeg: true,
        });
        break;

      case CONVERT_FORMATS.WEBP:
      default:
        contentType = "image/webp";
        extension = "webp";
        pipeline = pipeline.webp({
          quality,
          effort: 4,
        });
        break;
    }

    const outputBuffer = await pipeline.toBuffer();
    const outputSizeBytes = outputBuffer.length;
    const diff = originalSizeBytes - outputSizeBytes;
    const savedPercent = Math.round((diff / originalSizeBytes) * 100);

    return {
      success: true,
      outputBuffer,
      targetFormat,
      contentType,
      extension,
      originalSizeBytes,
      outputSizeBytes,
      savedPercent,
      processingTimeMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      success: false,
      targetFormat,
      contentType: "image/png",
      extension: "png",
      originalSizeBytes,
      outputSizeBytes: 0,
      savedPercent: 0,
      processingTimeMs: Date.now() - startTime,
      error: err.message || "Failed to convert image.",
    };
  }
}
