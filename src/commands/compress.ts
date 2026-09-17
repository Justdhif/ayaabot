import { db } from "../db";
import { usageLogs, User } from "../db/schema";
import { ECONOMY, BOT_THEME, COMPRESS_MODES } from "../config/constants";
import { validateAndExtractImage } from "../services/image.service";
import { compressImage } from "../services/compress.service";
import { deductForCompress } from "../services/economy.service";
import { AttachmentOption } from "./hd";

export interface CompressExecutionResult {
  responsePayload: any;
  fileAttachment?: {
    buffer: Buffer;
    filename: string;
    contentType: string;
  };
}

export async function handleCompressCommand(
  user: User,
  attachment?: AttachmentOption,
  options?: { mode?: string; format?: "webp" | "jpg" | "png" | "original" }
): Promise<CompressExecutionResult> {
  const mode = options?.mode || COMPRESS_MODES.AUTO_8MB;
  const format = options?.format || "webp";
  const costMoney = ECONOMY.COMPRESS_COST_MONEY;

  // 1. Check Money Balance
  if (user.money < costMoney) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "👛 Uang Jajan Kamu Belum Cukup Nih~ 🥺",
              color: BOT_THEME.COLOR_ROSE,
              description:
                `Untuk mengompres gambar butuh **${costMoney} Money**, tapi saldo kamu saat ini baru **${user.money.toLocaleString("id-ID")}**.\n\n` +
                "Yuk ambil uang jajan dulu pakai perintah **`/claim`** yaa! 🎀💕",
            },
          ],
        },
      },
    };
  }

  // 2. Validate Attachment presence
  if (!attachment || !attachment.url) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "🌸 Mana Fotonya Manis? 📷",
              color: BOT_THEME.COLOR_ROSE,
              description: "Jangan lupa lampirkan foto yang mau kamu kompres di kolom `image` yaa~ 🎀",
            },
          ],
        },
      },
    };
  }

  // 3. Validate Image Format and File Size
  const validation = await validateAndExtractImage(
    attachment.url,
    attachment.content_type,
    attachment.size
  );

  if (!validation.valid || !validation.buffer || !validation.width || !validation.height) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "🌸 Format Fotonya Belum Pas Nih~ 🥺",
              color: BOT_THEME.COLOR_ROSE,
              description:
                `${validation.error || "Pastikan file yang kamu upload adalah gambar yang valid yaa."}\n\n` +
                "**Format yang didukung:** PNG, JPG, JPEG, WEBP (Maksimal 15 MB) 🧸",
            },
          ],
        },
      },
    };
  }

  // 4. Compress Image Processing
  const compressResult = await compressImage({
    imageBuffer: validation.buffer,
    mode,
    format,
  });

  if (!compressResult.success || !compressResult.outputBuffer) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "😿 Ups, Gagal Mengompres Gambar",
              color: BOT_THEME.COLOR_ROSE,
              description:
                "Maaf yaa manis, gambarmu gagal dikompres tadi. Tapi tenang aja, **saldo kamu tetap aman dan tidak terpotong** kok! Silakan coba lagi yaa~ 💕",
            },
          ],
        },
      },
    };
  }

  // 5. Deduct Compress Cost
  const deductResult = await deductForCompress(user.id, mode);
  if (!deductResult.success || !deductResult.user) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "😿 Terjadi Kesalahan Transaksi",
              color: BOT_THEME.COLOR_ROSE,
              description: "Gagal memproses biaya kompresi. Coba lagi yaa manis~ 🥺",
            },
          ],
        },
      },
    };
  }

  const updatedUser = deductResult.user;

  // 6. Record usage log
  await db.insert(usageLogs).values({
    userId: user.id,
    originalFilename: attachment.filename || "image.png",
    originalWidth: validation.width,
    originalHeight: validation.height,
    outputWidth: compressResult.dimensions?.width || validation.width,
    outputHeight: compressResult.dimensions?.height || validation.height,
    scale: 1,
    status: "SUCCESS",
    processingTimeMs: compressResult.processingTimeMs,
  });

  const baseName = (attachment.filename || "image.png").replace(/\.[^/.]+$/, "");
  const outputFilename = `ayaabot_compressed_${baseName}.${compressResult.extension}`;

  const originalMb = (compressResult.originalSizeBytes / (1024 * 1024)).toFixed(2);
  const outputMb = (compressResult.outputSizeBytes / (1024 * 1024)).toFixed(2);
  const originalKb = (compressResult.originalSizeBytes / 1024).toFixed(0);
  const outputKb = (compressResult.outputSizeBytes / 1024).toFixed(0);

  const sizeText =
    compressResult.savedPercent > 0
      ? `📉 Lebih hemat **${compressResult.savedPercent}%** (${compressResult.originalSizeBytes > 1024 * 1024 ? `${originalMb} MB` : `${originalKb} KB`} ➔ **${compressResult.outputSizeBytes > 1024 * 1024 ? `${outputMb} MB` : `${outputKb} KB`}**)`
      : `📦 Ukuran: **${outputKb} KB**`;

  const nitroFitBadge =
    compressResult.outputSizeBytes <= 8 * 1024 * 1024
      ? "✅ **Muat untuk Discord Free/Non-Nitro (< 8 MB)**"
      : "ℹ️ Ukuran file berhasil diperkecil";

  return {
    responsePayload: {
      type: 4,
      data: {
        embeds: [
          {
            title: "🗜️ Optimasi & Kompresi Gambar Berhasil!~ 🌸",
            color: BOT_THEME.COLOR_PINK,
            description:
              `Hore! Ukuran file gambarmu berhasil diperkecil dengan tetap menjaga kualitas visualnya! 💖\n\n` +
              `${nitroFitBadge}\n` +
              `📁 **Format:** \`${compressResult.format.toUpperCase()}\`\n` +
              `📐 **Dimensi:** \`${compressResult.dimensions?.width || validation.width} × ${compressResult.dimensions?.height || validation.height} px\`\n` +
              `${sizeText}\n` +
              `⚡ **Waktu Proses:** \`${(compressResult.processingTimeMs / 1000).toFixed(2)} detik\`\n\n` +
              "**Sisa Saldo Kamu:**\n" +
              `💰 Uang Jajan: **${updatedUser.money.toLocaleString("id-ID")} Money** (-${costMoney})\n` +
              `🎟️ Tiket Limit: **${updatedUser.limitCount.toLocaleString("id-ID")} Tiket** (Gratis/Tidak terpotong)`,
            image: {
              url: `attachment://${outputFilename}`,
            },
            footer: {
              text: "Ayaa Bot 🌸 • Image Optimizer & Web Compression",
            },
          },
        ],
      },
    },
    fileAttachment: {
      buffer: compressResult.outputBuffer,
      filename: outputFilename,
      contentType: compressResult.contentType,
    },
  };
}
