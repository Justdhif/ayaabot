import { db } from "../db";
import { usageLogs, User } from "../db/schema";
import { ECONOMY, BOT_THEME, CONVERT_FORMATS } from "../config/constants";
import { validateAndExtractImage } from "../services/image.service";
import { convertImage } from "../services/convert.service";
import { deductForConvert } from "../services/economy.service";
import { AttachmentOption } from "./hd";

export interface ConvertExecutionResult {
  responsePayload: any;
  fileAttachment?: {
    buffer: Buffer;
    filename: string;
    contentType: string;
  };
}

export async function handleConvertCommand(
  user: User,
  attachment?: AttachmentOption,
  options?: { format?: string; quality?: number }
): Promise<ConvertExecutionResult> {
  const targetFormat = options?.format || CONVERT_FORMATS.WEBP;
  const quality = options?.quality || 85;
  const costMoney = ECONOMY.CONVERT_COST_MONEY;

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
                `Untuk mengubah format / kompres gambar butuh **${costMoney} Money**, tapi saldo kamu saat ini baru **${user.money.toLocaleString("id-ID")}**.\n\n` +
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
              description: "Jangan lupa lampirkan foto yang mau kamu konversi di kolom `image` yaa~ 🎀",
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
                "**Format yang didukung:** PNG, JPG, JPEG, WEBP (Maksimal 10 MB) 🧸",
            },
          ],
        },
      },
    };
  }

  // 4. Convert Image Processing
  const convertResult = await convertImage({
    imageBuffer: validation.buffer,
    targetFormat,
    quality,
  });

  if (!convertResult.success || !convertResult.outputBuffer) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "😿 Ups, Gagal Mengonversi Gambar",
              color: BOT_THEME.COLOR_ROSE,
              description:
                "Maaf yaa manis, gambarmu gagal dikonversi tadi. Tapi tenang aja, **saldo kamu tetap aman dan tidak terpotong** kok! Silakan coba lagi yaa~ 💕",
            },
          ],
        },
      },
    };
  }

  // 5. Deduct Convert Cost
  const deductResult = await deductForConvert(user.id, convertResult.targetFormat);
  if (!deductResult.success || !deductResult.user) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "😿 Terjadi Kesalahan Transaksi",
              color: BOT_THEME.COLOR_ROSE,
              description: "Gagal memproses biaya konversi. Coba lagi yaa manis~ 🥺",
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
    outputWidth: validation.width,
    outputHeight: validation.height,
    scale: 1,
    status: "SUCCESS",
    processingTimeMs: convertResult.processingTimeMs,
  });

  const baseName = (attachment.filename || "image.png").replace(/\.[^/.]+$/, "");
  const outputFilename = `ayaabot_${baseName}.${convertResult.extension}`;

  const originalKb = (convertResult.originalSizeBytes / 1024).toFixed(1);
  const outputKb = (convertResult.outputSizeBytes / 1024).toFixed(1);
  const sizeDiffText =
    convertResult.savedPercent > 0
      ? `📉 Lebih hemat **${convertResult.savedPercent}%** (${originalKb} KB ➔ **${outputKb} KB**)`
      : `📦 Ukuran: **${outputKb} KB**`;

  return {
    responsePayload: {
      type: 4,
      data: {
        embeds: [
          {
            title: `🔄 Konversi ke ${convertResult.targetFormat.toUpperCase()} Berhasil!~ 🌸`,
            color: BOT_THEME.COLOR_PINK,
            description:
              `Selesai! Gambarmu udah berhasil diubah ke format **${convertResult.targetFormat.toUpperCase()}** dengan kualitas **${quality}%**! 💖\n\n` +
              `📁 **Format Baru:** \`${convertResult.extension.toUpperCase()}\`\n` +
              `📐 **Dimensi:** \`${validation.width} × ${validation.height} px\`\n` +
              `${sizeDiffText}\n` +
              `⚡ **Waktu Proses:** \`${(convertResult.processingTimeMs / 1000).toFixed(2)} detik\`\n\n` +
              "**Sisa Saldo Kamu:**\n" +
              `💰 Uang Jajan: **${updatedUser.money.toLocaleString("id-ID")} Money** (-${costMoney})\n` +
              `🎟️ Tiket Limit: **${updatedUser.limitCount.toLocaleString("id-ID")} Tiket** (Gratis/Tidak terpotong)`,
            image: {
              url: `attachment://${outputFilename}`,
            },
            footer: {
              text: "Ayaa Bot 🌸 • Format Converter & Image Compressor",
            },
          },
        ],
      },
    },
    fileAttachment: {
      buffer: convertResult.outputBuffer,
      filename: outputFilename,
      contentType: convertResult.contentType,
    },
  };
}
