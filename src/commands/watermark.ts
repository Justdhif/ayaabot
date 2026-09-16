import { db } from "../db";
import { usageLogs, User } from "../db/schema";
import { ECONOMY, BOT_THEME, WATERMARK_POSITIONS, WATERMARK_OPACITY } from "../config/constants";
import { validateAndExtractImage } from "../services/image.service";
import { applyWatermark } from "../services/watermark.service";
import { deductForWatermark } from "../services/economy.service";
import { AttachmentOption } from "./hd";

export interface WatermarkExecutionResult {
  responsePayload: any;
  fileAttachment?: {
    buffer: Buffer;
    filename: string;
    contentType: string;
  };
}

export async function handleWatermarkCommand(
  user: User,
  attachment?: AttachmentOption,
  options?: { text?: string; position?: string; opacity?: string }
): Promise<WatermarkExecutionResult> {
  const costMoney = ECONOMY.WATERMARK_COST_MONEY;
  const wmText = options?.text?.trim() || `@${user.username || "Ayaa Bot"}`;
  const position = options?.position || WATERMARK_POSITIONS.BOTTOM_RIGHT;
  const opacity = options?.opacity || WATERMARK_OPACITY.NORMAL;

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
                `Untuk menempelkan watermark butuh **${costMoney} Money**, tapi saldo kamu saat ini baru **${user.money.toLocaleString("id-ID")}**.\n\n` +
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
              description:
                "Jangan lupa lampirkan foto yang mau kamu beri watermark di kolom `image` atau reply pesan foto di chat yaa~ 🎀",
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

  // 4. Apply Watermark Processing
  const wmResult = await applyWatermark({
    imageBuffer: validation.buffer,
    text: wmText,
    position,
    opacity,
  });

  if (!wmResult.success || !wmResult.outputBuffer) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "😿 Ups, Gagal Menempelkan Watermark",
              color: BOT_THEME.COLOR_ROSE,
              description:
                "Maaf yaa manis, watermark gagal diterapkan tadi. Tapi tenang aja, **saldo kamu tetap aman dan tidak terpotong** kok! Silakan coba lagi yaa~ 💕",
            },
          ],
        },
      },
    };
  }

  // 5. Deduct Watermark Cost (25 Money)
  const deductResult = await deductForWatermark(user.id);
  if (!deductResult.success || !deductResult.user) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "😿 Terjadi Kesalahan Transaksi",
              color: BOT_THEME.COLOR_ROSE,
              description: "Gagal memproses biaya watermark. Coba lagi yaa manis~ 🥺",
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
    processingTimeMs: wmResult.processingTimeMs,
  });

  const baseName = (attachment.filename || "image.png").replace(/\.[^/.]+$/, "");
  const outputFilename = `ayaabot_wm_${baseName}.png`;

  const posLabel =
    position === WATERMARK_POSITIONS.BOTTOM_RIGHT
      ? "Kanan Bawah"
      : position === WATERMARK_POSITIONS.BOTTOM_LEFT
      ? "Kiri Bawah"
      : position === WATERMARK_POSITIONS.CENTER
      ? "Tengah"
      : "Kanan Atas";

  return {
    responsePayload: {
      type: 4,
      data: {
        embeds: [
          {
            title: "🎨 Watermark Berhasil Ditempelkan!~ 🌸",
            color: BOT_THEME.COLOR_PINK,
            description:
              `Yeay! Fotomu sekarang udah aman terlindungi hak cipta dengan tanda tangan manis! 💖\n\n` +
              `✍️ **Teks Watermark:** \`"${wmText}"\`\n` +
              `📍 **Posisi:** \`${posLabel}\`\n` +
              `📐 **Resolusi:** \`${validation.width} × ${validation.height} px\`\n` +
              `⚡ **Waktu Proses:** \`${(wmResult.processingTimeMs / 1000).toFixed(2)} detik\`\n\n` +
              "**Sisa Saldo Kamu:**\n" +
              `💰 Uang Jajan: **${updatedUser.money.toLocaleString("id-ID")} Money** (-${costMoney})\n` +
              `🎟️ Tiket Limit: **${updatedUser.limitCount.toLocaleString("id-ID")} Tiket** (Gratis/Tidak terpotong)`,
            image: {
              url: `attachment://${outputFilename}`,
            },
            footer: {
              text: "Ayaa Bot 🌸 • Copyright & Watermark Protector",
            },
          },
        ],
      },
    },
    fileAttachment: {
      buffer: wmResult.outputBuffer,
      filename: outputFilename,
      contentType: "image/png",
    },
  };
}
