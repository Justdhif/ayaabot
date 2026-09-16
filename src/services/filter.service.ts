import sharp from "sharp";
import { FILTER_PRESETS, FilterPresetKey } from "../config/constants";

export interface FilterInput {
  imageBuffer: Buffer;
  preset: FilterPresetKey | string;
}

export interface FilterOutput {
  success: boolean;
  outputBuffer?: Buffer;
  presetName: string;
  presetTitle: string;
  presetEmoji: string;
  processingTimeMs: number;
  error?: string;
}

export const PRESET_METADATA: Record<
  string,
  { title: string; emoji: string; description: string }
> = {
  [FILTER_PRESETS.PINK_GLOW]: {
    title: "Soft Pink Glow",
    emoji: "🌸",
    description: "Aura pink lembut & dreamy khas Ayaa Bot",
  },
  [FILTER_PRESETS.VINTAGE_WARM]: {
    title: "Vintage Warm",
    emoji: "☕",
    description: "Nuansa klasik, hangat & nostalgic",
  },
  [FILTER_PRESETS.BW_DREAMY]: {
    title: "B&W Dreamy",
    emoji: "🖤",
    description: "Hitam putih kontras elegan & sinematik",
  },
  [FILTER_PRESETS.ANIME_POP]: {
    title: "Anime Pop",
    emoji: "🎨",
    description: "Warna cerah, vibrant & saturasi tajam",
  },
};

export async function applyImageFilter(input: FilterInput): Promise<FilterOutput> {
  const startTime = Date.now();
  const presetKey = input.preset in PRESET_METADATA ? input.preset : FILTER_PRESETS.PINK_GLOW;
  const meta = PRESET_METADATA[presetKey];

  try {
    let pipeline = sharp(input.imageBuffer);

    switch (presetKey) {
      case FILTER_PRESETS.PINK_GLOW:
        // Soft pink tint with gentle contrast and glow
        pipeline = pipeline
          .modulate({
            brightness: 1.04,
            saturation: 1.12,
          })
          .tint({ r: 255, g: 218, b: 232 });
        break;

      case FILTER_PRESETS.VINTAGE_WARM:
        // Warm nostalgic golden tone
        pipeline = pipeline
          .modulate({
            brightness: 0.98,
            saturation: 0.92,
          })
          .tint({ r: 245, g: 220, b: 190 });
        break;

      case FILTER_PRESETS.BW_DREAMY:
        // High-contrast cinematic black and white
        pipeline = pipeline
          .grayscale()
          .linear(1.15, -10);
        break;

      case FILTER_PRESETS.ANIME_POP:
        // Vivid pop colors + crisp unsharp mask
        pipeline = pipeline
          .modulate({
            brightness: 1.03,
            saturation: 1.35,
          })
          .sharpen({
            sigma: 1.0,
            m1: 1.0,
            m2: 2.0,
          });
        break;

      default:
        pipeline = pipeline.modulate({ saturation: 1.1 });
        break;
    }

    const outputBuffer = await pipeline.png({ quality: 100 }).toBuffer();

    return {
      success: true,
      outputBuffer,
      presetName: presetKey,
      presetTitle: meta.title,
      presetEmoji: meta.emoji,
      processingTimeMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      success: false,
      presetName: presetKey,
      presetTitle: meta?.title || presetKey,
      presetEmoji: meta?.emoji || "✨",
      processingTimeMs: Date.now() - startTime,
      error: err.message || "Failed to apply filter.",
    };
  }
}
