import { db } from "../db";
import { usageLogs, User } from "../db/schema";
import { ECONOMY, BOT_THEME, FILTER_PRESETS } from "../config/constants";
import { validateAndExtractImage } from "../services/image.service";
import { applyImageFilter, PRESET_METADATA } from "../services/filter.service";
import { deductForFilter } from "../services/economy.service";
import { AttachmentOption } from "./hd";

export interface FilterExecutionResult {
  responsePayload: any;
  fileAttachment?: {
    buffer: Buffer;
    filename: string;
    contentType: string;
  };
}

export async function handleFilterCommand(
  user: User,
  attachment?: AttachmentOption,
  presetChoice?: string
): Promise<FilterExecutionResult> {
  const presetKey =
    presetChoice && presetChoice in PRESET_METADATA
      ? presetChoice
      : FILTER_PRESETS.PINK_GLOW;

  const costMoney = ECONOMY.FILTER_COST_MONEY;

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
                `Untuk memakai preset filter butuh **${costMoney} Money**, tapi saldo kamu saat ini baru **${user.money.toLocaleString("id-ID")}**.\n\n` +
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
              description: "Jangan lupa lampirkan foto yang mau kamu beri filter di kolom `image` yaa~ 🎀",
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

  // 4. Apply Filter Processing
  const filterResult = await applyImageFilter({
    imageBuffer: validation.buffer,
    preset: presetKey,
  });

  if (!filterResult.success || !filterResult.outputBuffer) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "😿 Ups, Gagal Menerapkan Filter",
              color: BOT_THEME.COLOR_ROSE,
              description:
                "Maaf yaa manis, filter gagal diterapkan tadi. Tapi tenang aja, **saldo kamu tetap aman dan tidak terpotong** kok! Silakan coba lagi yaa~ 💕",
            },
          ],
        },
      },
    };
  }

  // 5. Deduct Filter Cost
  const deductResult = await deductForFilter(user.id, filterResult.presetName);
  if (!deductResult.success || !deductResult.user) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "😿 Terjadi Kesalahan Transaksi",
              color: BOT_THEME.COLOR_ROSE,
              description: "Gagal memproses biaya filter. Coba lagi yaa manis~ 🥺",
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
    processingTimeMs: filterResult.processingTimeMs,
  });

  const outputFilename = `ayaabot_filter_${filterResult.presetName}_${attachment.filename || "filtered.png"}`;

  return {
    responsePayload: {
      type: 4,
      data: {
        embeds: [
          {
            title: `✨ Filter ${filterResult.presetEmoji} ${filterResult.presetTitle} Berhasil!~ 🌸`,
            color: BOT_THEME.COLOR_PINK,
            description:
              `Tadaa! Fotonya udah Ayaa kasih sentuhan **${filterResult.presetTitle}** biar makin aesthetic dan gemas! 💖\n\n` +
              `🎨 **Preset:** \`${filterResult.presetTitle}\`\n` +
              `📐 **Resolusi:** \`${validation.width} × ${validation.height} px\`\n` +
              `⚡ **Waktu Proses:** \`${(filterResult.processingTimeMs / 1000).toFixed(2)} detik\`\n\n` +
              "**Sisa Saldo Kamu:**\n" +
              `💰 Uang Jajan: **${updatedUser.money.toLocaleString("id-ID")} Money** (-${costMoney})\n` +
              `🎟️ Tiket Limit: **${updatedUser.limitCount.toLocaleString("id-ID")} Tiket** (Gratis/Tidak terpotong)`,
            image: {
              url: `attachment://${outputFilename}`,
            },
            footer: {
              text: "Ayaa Bot 🌸 • Aesthetic Filter & Image Enhancer",
            },
          },
        ],
      },
    },
    fileAttachment: {
      buffer: filterResult.outputBuffer,
      filename: outputFilename,
      contentType: "image/png",
    },
  };
}
