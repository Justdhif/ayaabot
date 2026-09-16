import sharp from "sharp";
import { IMAGE_CONFIG } from "../config/constants";

export interface UpscaleInput {
  imageBuffer: Buffer;
  originalWidth: number;
  originalHeight: number;
  scale?: number;
  mode?: "sharp" | "soft";
}

export interface UpscaleOutput {
  success: boolean;
  outputBuffer?: Buffer;
  outputWidth?: number;
  outputHeight?: number;
  scale: number;
  mode: "sharp" | "soft";
  processingTimeMs: number;
  error?: string;
}

export async function upscaleImage(input: UpscaleInput): Promise<UpscaleOutput> {
  const startTime = Date.now();
  const scale = input.scale === 4 ? 4 : 2;
  const mode = input.mode === "soft" ? "soft" : "sharp";

  let targetWidth = Math.round(input.originalWidth * scale);
  let targetHeight = Math.round(input.originalHeight * scale);

  // Safety clamp to prevent OOM in serverless environment
  const maxDim = IMAGE_CONFIG.MAX_OUTPUT_DIMENSION;
  if (targetWidth > maxDim || targetHeight > maxDim) {
    const ratio = Math.min(maxDim / targetWidth, maxDim / targetHeight);
    targetWidth = Math.round(targetWidth * ratio);
    targetHeight = Math.round(targetHeight * ratio);
  }

  const apiUrl = process.env.UPSCALER_API_URL;
  const apiKey = process.env.UPSCALER_API_KEY;

  // 1. If external API is configured, use it
  if (apiUrl && apiKey) {
    try {
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
          mode,
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
        mode,
        processingTimeMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        scale,
        mode,
        processingTimeMs: Date.now() - startTime,
        error: err.message || "Failed to call external upscaler API.",
      };
    }
  }

  // 2. Built-in Sharp high-quality upscaler (Lanczos3 resampler + adaptive mode)
  try {
    let pipeline = sharp(input.imageBuffer).resize({
      width: targetWidth,
      height: targetHeight,
      kernel: sharp.kernel.lanczos3,
    });

    if (mode === "sharp") {
      // Gentle unsharp mask for enhanced clarity without noise
      pipeline = pipeline.sharpen({
        sigma: 0.8,
        m1: 0.8,
        m2: 1.5,
      });
    }

    const outputBuffer = await pipeline.png({ quality: 100 }).toBuffer();

    return {
      success: true,
      outputBuffer,
      outputWidth: targetWidth,
      outputHeight: targetHeight,
      scale,
      mode,
      processingTimeMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      success: false,
      scale,
      mode,
      processingTimeMs: Date.now() - startTime,
      error: err.message || "Sharp upscaling failed.",
    };
  }
}
