import sharp from "sharp";
import { STITCH_LAYOUTS, STITCH_BORDERS, StitchLayoutKey, StitchBorderKey } from "../config/constants";

export interface StitchInput {
  imageBuffers: Buffer[];
  layout?: StitchLayoutKey | string;
  border?: StitchBorderKey | string;
}

export interface StitchOutput {
  success: boolean;
  outputBuffer?: Buffer;
  contentType: string;
  extension: string;
  imageCount: number;
  layout: string;
  border: string;
  width: number;
  height: number;
  processingTimeMs: number;
  error?: string;
}

export async function stitchImages(input: StitchInput): Promise<StitchOutput> {
  const startTime = Date.now();
  const buffers = input.imageBuffers.filter((b) => b && b.length > 0);

  if (buffers.length < 2) {
    return {
      success: false,
      contentType: "image/webp",
      extension: "webp",
      imageCount: buffers.length,
      layout: "horizontal",
      border: "none",
      width: 0,
      height: 0,
      processingTimeMs: Date.now() - startTime,
      error: "Diperlukan minimal 2 gambar untuk digabungkan.",
    };
  }

  // Max 4 images
  const targetBuffers = buffers.slice(0, 4);
  let layout = (input.layout || STITCH_LAYOUTS.HORIZONTAL) as StitchLayoutKey;
  const border = (input.border || STITCH_BORDERS.NONE) as StitchBorderKey;

  // If 3 or 4 images and layout is horizontal, grid is often better unless user explicitly chose horizontal
  if (targetBuffers.length >= 3 && !input.layout) {
    layout = STITCH_LAYOUTS.GRID;
  }

  const gap = border === STITCH_BORDERS.NONE ? 0 : 12;
  const bgColor =
    border === STITCH_BORDERS.PINK
      ? { r: 255, g: 229, b: 236, alpha: 1 } // Soft pastel pink
      : border === STITCH_BORDERS.WHITE
      ? { r: 255, g: 255, b: 255, alpha: 1 } // Pure clean white
      : { r: 255, g: 255, b: 255, alpha: 1 };

  try {
    // 1. Read metadata of all images
    const metas = await Promise.all(targetBuffers.map((b) => sharp(b).metadata()));

    const composites: sharp.OverlayOptions[] = [];
    let canvasWidth = 0;
    let canvasHeight = 0;

    if (layout === STITCH_LAYOUTS.VERTICAL) {
      // Normalize width across all images
      const baseWidth = Math.min(...metas.map((m) => m.width || 800), 1200);
      let currentTop = gap;

      const processed = await Promise.all(
        targetBuffers.map((b, i) => {
          const meta = metas[i];
          const h = Math.round(((meta.height || 600) / (meta.width || 800)) * baseWidth);
          return sharp(b)
            .resize(baseWidth, h, { fit: "cover" })
            .toBuffer()
            .then((buf) => ({ buf, w: baseWidth, h }));
        })
      );

      for (const item of processed) {
        composites.push({
          input: item.buf,
          left: gap,
          top: currentTop,
        });
        currentTop += item.h + gap;
      }

      canvasWidth = baseWidth + gap * 2;
      canvasHeight = currentTop;
    } else if (layout === STITCH_LAYOUTS.GRID && targetBuffers.length >= 3) {
      // 2x2 Grid Layout
      const tileWidth = 600;
      const tileHeight = 600;

      const processed = await Promise.all(
        targetBuffers.map((b) =>
          sharp(b)
            .resize(tileWidth, tileHeight, { fit: "cover", position: "center" })
            .toBuffer()
        )
      );

      // Tile positions: (0,0), (1,0), (0,1), (1,1)
      const positions = [
        { left: gap, top: gap },
        { left: gap * 2 + tileWidth, top: gap },
        { left: gap, top: gap * 2 + tileHeight },
        { left: gap * 2 + tileWidth, top: gap * 2 + tileHeight },
      ];

      for (let i = 0; i < processed.length; i++) {
        composites.push({
          input: processed[i],
          left: positions[i].left,
          top: positions[i].top,
        });
      }

      const cols = processed.length === 1 ? 1 : 2;
      const rows = processed.length <= 2 ? 1 : 2;
      canvasWidth = cols * tileWidth + (cols + 1) * gap;
      canvasHeight = rows * tileHeight + (rows + 1) * gap;
    } else {
      // Horizontal Layout (↔️ Side by side, perfect for Before vs After)
      const baseHeight = Math.min(...metas.map((m) => m.height || 800), 1000);
      let currentLeft = gap;

      const processed = await Promise.all(
        targetBuffers.map((b, i) => {
          const meta = metas[i];
          const w = Math.round(((meta.width || 800) / (meta.height || 600)) * baseHeight);
          return sharp(b)
            .resize(w, baseHeight, { fit: "cover" })
            .toBuffer()
            .then((buf) => ({ buf, w, h: baseHeight }));
        })
      );

      for (const item of processed) {
        composites.push({
          input: item.buf,
          left: currentLeft,
          top: gap,
        });
        currentLeft += item.w + gap;
      }

      canvasWidth = currentLeft;
      canvasHeight = baseHeight + gap * 2;
    }

    // 2. Create blank canvas with background color and composite images
    const outputBuffer = await sharp({
      create: {
        width: canvasWidth,
        height: canvasHeight,
        channels: 4,
        background: bgColor,
      },
    })
      .composite(composites)
      .webp({ quality: 85, effort: 4 })
      .toBuffer();

    return {
      success: true,
      outputBuffer,
      contentType: "image/webp",
      extension: "webp",
      imageCount: targetBuffers.length,
      layout,
      border,
      width: canvasWidth,
      height: canvasHeight,
      processingTimeMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      success: false,
      contentType: "image/webp",
      extension: "webp",
      imageCount: targetBuffers.length,
      layout,
      border,
      width: 0,
      height: 0,
      processingTimeMs: Date.now() - startTime,
      error: err.message || "Gagal menggabungkan gambar.",
    };
  }
}
