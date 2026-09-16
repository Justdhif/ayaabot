import sharp from "sharp";
import { IMAGE_CONFIG } from "../config/constants";

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  width?: number;
  height?: number;
  format?: string;
  buffer?: Buffer;
}

export async function validateAndExtractImage(
  url: string,
  contentType?: string,
  size?: number
): Promise<ImageValidationResult> {
  // 1. Validate declared file size if provided
  if (size && size > IMAGE_CONFIG.MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Image is too large. Maximum file size is ${IMAGE_CONFIG.MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`,
    };
  }

  // 2. Fetch image data
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { valid: false, error: "Failed to download image from Discord." };
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate downloaded byte length
    if (buffer.length > IMAGE_CONFIG.MAX_FILE_SIZE_BYTES) {
      return {
        valid: false,
        error: `Image is too large. Maximum file size is ${IMAGE_CONFIG.MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB.`,
      };
    }

    // 3. Inspect using Sharp
    const metadata = await sharp(buffer).metadata();

    if (!metadata.format || !metadata.width || !metadata.height) {
      return { valid: false, error: "Invalid or unsupported image file." };
    }

    const formatMime = `image/${metadata.format === "jpeg" ? "jpeg" : metadata.format}`;
    const isAllowedMime =
      IMAGE_CONFIG.ALLOWED_MIME_TYPES.includes(formatMime as any) ||
      (metadata.format === "jpg" || metadata.format === "jpeg" || metadata.format === "png" || metadata.format === "webp");

    if (!isAllowedMime) {
      return {
        valid: false,
        error: "Unsupported format. Supported formats: PNG, JPG, JPEG, WEBP.",
      };
    }

    return {
      valid: true,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      buffer,
    };
  } catch (err: any) {
    return { valid: false, error: err.message || "Failed to process image." };
  }
}
