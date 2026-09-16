import sharp from "sharp";
import { IMAGE_CONFIG } from "../config/constants";

export interface UpscaleInput {
  imageBuffer: Buffer;
  originalWidth: number;
  originalHeight: number;
  scale?: number;
}

export interface UpscaleOutput {
  success: boolean;
  outputBuffer?: Buffer;
  outputWidth?: number;
  outputHeight?: number;
  scale: number;
  processingTimeMs: number;
  error?: string;
}

export async function upscaleImage(input: UpscaleInput): Promise<UpscaleOutput> {
  const startTime = Date.now();
  const scale = input.scale || IMAGE_CONFIG.DEFAULT_SCALE;
  const targetWidth = Math.round(input.originalWidth * scale);
  const targetHeight = Math.round(input.originalHeight * scale);

  const apiUrl = process.env.UPSCALER_API_URL;
  const apiKey = process.env.UPSCALER_API_KEY;

  // 1. If external API is configured, use it
  if (apiUrl && apiKey) {
    try {
      // Send as multipart form or base64 depending on API contract
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(input.imageBuffer)]);
      formData.append("image", blob, "image.png");
      formData.append("scale", scale.toString());

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        return {
          success: false,
          scale,
          processingTimeMs: Date.now() - startTime,
          error: `External upscaler error: ${res.status} ${errorText}`,
        };
      }

      const resBuffer = Buffer.from(await res.arrayBuffer());
      const metadata = await sharp(resBuffer).metadata();

      return {
        success: true,
        outputBuffer: resBuffer,
        outputWidth: metadata.width || targetWidth,
        outputHeight: metadata.height || targetHeight,
        scale,
        processingTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        scale,
        processingTimeMs: Date.now() - startTime,
        error: err.message || "Failed to call external upscaler API.",
      };
    }
  }

  // 2. Built-in Sharp high-quality 2x upscaler (Lanczos3 resampler)
  try {
    const outputBuffer = await sharp(input.imageBuffer)
      .resize({
        width: targetWidth,
        height: targetHeight,
        kernel: sharp.kernel.lanczos3,
      })
      .png({ quality: 100 })
      .toBuffer();

    return {
      success: true,
      outputBuffer,
      outputWidth: targetWidth,
      outputHeight: targetHeight,
      scale,
      processingTimeMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      success: false,
      scale,
      processingTimeMs: Date.now() - startTime,
      error: err.message || "Sharp upscaling failed.",
    };
  }
}
