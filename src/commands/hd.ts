import { db } from "../db";
import { usageLogs, User } from "../db/schema";
import { ECONOMY, BOT_THEME } from "../config/constants";
import { checkHdCooldown } from "../services/ratelimit.service";
import { validateAndExtractImage } from "../services/image.service";
import { upscaleImage } from "../services/upscaler.service";
import { deductForHd } from "../services/economy.service";

export interface AttachmentOption {
  id: string;
  filename: string;
  url: string;
  size: number;
  content_type?: string;
  width?: number;
  height?: number;
}

export interface HdExecutionResult {
  isDeferred?: boolean;
  responsePayload: any;
  fileAttachment?: {
    buffer: Buffer;
    filename: string;
    contentType: string;
  };
}

export async function handleHdCommand(
  user: User,
  attachment?: AttachmentOption
): Promise<HdExecutionResult> {
  // 1. Check Rate Limit (15 seconds per user)
  const cooldown = checkHdCooldown(user.lastHdAt);
  if (!cooldown.canExecute) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "⏳ Jangan Buru-buru Yaa Manis~ 🌸",
              color: BOT_THEME.COLOR_ROSE,
              description: `Tunggu **${cooldown.formattedRemaining}** lagi yaa sebelum menyulap foto berikutnya~ 🎀✨`,
            },
          ],
        },
      },
    };
  }

  // 2. Check Resources (Money & Limit)
  if (user.money < ECONOMY.HD_COST_MONEY) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "👛 Uang Jajan Kamu Belum Cukup Nih~ 🥺",
              color: BOT_THEME.COLOR_ROSE,
              description:
                `Untuk menyulap foto jadi HD butuh **${ECONOMY.HD_COST_MONEY} Money**, tapi saldo kamu saat ini baru **${user.money.toLocaleString("id-ID")}**.\n\n` +
                "Yuk ambil uang jajan dulu pakai perintah **`/claim`** yaa! 🎀💕",
            },
          ],
        },
      },
    };
  }

  if (user.limitCount < ECONOMY.HD_COST_LIMIT) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "🎟️ Tiket Limit Kamu Sudah Habis~ 🥺",
              color: BOT_THEME.COLOR_ROSE,
              description:
                `Untuk proses HD butuh **${ECONOMY.HD_COST_LIMIT} Limit**, tapi sisa tiket kamu sekarang **0**.\n\n` +
                "Yuk ambil jatah tiket harian pakai perintah **`/claim`** yaa manis~ 💕",
            },
          ],
        },
      },
    };
  }

  // 3. Validate Attachment presence
  if (!attachment || !attachment.url) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "🌸 Mana Fotonya Manis? 📷",
              color: BOT_THEME.COLOR_ROSE,
              description: "Jangan lupa lampirkan foto yang mau kamu sulap di kolom `image` yaa~ 🎀",
            },
          ],
        },
      },
    };
  }

  // 4. Validate Image Format and File Size
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

  // 5. Upscale Processing
  const upscaleResult = await upscaleImage({
    imageBuffer: validation.buffer,
    originalWidth: validation.width,
    originalHeight: validation.height,
  });

  // 6. Handle Upscale Failure (No resources deducted)
  if (!upscaleResult.success || !upscaleResult.outputBuffer) {
    // Record FAILED usage log
    await db.insert(usageLogs).values({
      userId: user.id,
      originalFilename: attachment.filename || "image.png",
      originalWidth: validation.width,
      originalHeight: validation.height,
      outputWidth: null,
      outputHeight: null,
      scale: upscaleResult.scale,
      status: "FAILED",
      processingTimeMs: upscaleResult.processingTimeMs,
    });

    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "😿 Ups, Gagal Memproses Gambar",
              color: BOT_THEME.COLOR_ROSE,
              description:
                "Maaf yaa manis, gambarmu gagal di-upscale tadi. Tapi tenang aja, **saldo & tiket kamu tetap utuh dan aman** kok! Silakan coba lagi yaa~ 💕",
            },
          ],
        },
      },
    };
  }

  // 7. Upscale Success -> Deduct Money & Limit atomically
  const deductResult = await deductForHd(user.id);
  if (!deductResult.success || !deductResult.user) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "😿 Terjadi Kesalahan Transaksi",
              color: BOT_THEME.COLOR_ROSE,
              description: "Gagal memotong saldo. Saldo kamu tidak berkurang, coba lagi yaa manis~ 🥺",
            },
          ],
        },
      },
    };
  }

  const updatedUser = deductResult.user;

  // 8. Record SUCCESS usage log
  await db.insert(usageLogs).values({
    userId: user.id,
    originalFilename: attachment.filename || "image.png",
    originalWidth: validation.width,
    originalHeight: validation.height,
    outputWidth: upscaleResult.outputWidth,
    outputHeight: upscaleResult.outputHeight,
    scale: upscaleResult.scale,
    status: "SUCCESS",
    processingTimeMs: upscaleResult.processingTimeMs,
  });

  const outputFilename = `ayaabot_2x_${attachment.filename || "upscaled.png"}`;

  return {
    responsePayload: {
      type: 4,
      data: {
        embeds: [
          {
            title: "✨ Tadaa! Fotonya Udah Disulap Jadi Makin HD~ 🌸",
            color: BOT_THEME.COLOR_PINK,
            description:
              "Yeay! Gambarmu udah Ayaa bikin jadi **2× lebih jernih dan tajam** lhoo! Gemas banget kan hasilnya~ 💖\n\n" +
              `📐 **Resolusi Awal:** \`${validation.width} × ${validation.height} px\`\n` +
              `✨ **Resolusi HD (2×):** \`${upscaleResult.outputWidth} × ${upscaleResult.outputHeight} px\`\n` +
              `⚡ **Waktu Sulap:** \`${(upscaleResult.processingTimeMs / 1000).toFixed(2)} detik\`\n\n` +
              "**Sisa Saldo Kamu:**\n" +
              `💰 Uang Jajan: **${updatedUser.money.toLocaleString("id-ID")} Money** (-100)\n` +
              `🎟️ Tiket Limit: **${updatedUser.limitCount.toLocaleString("id-ID")} Tiket** (-1)`,
            image: {
              url: `attachment://${outputFilename}`,
            },
            footer: {
              text: "Ayaa Bot 🌸 • AI Image Upscaler Gemas",
            },
          },
        ],
      },
    },
    fileAttachment: {
      buffer: upscaleResult.outputBuffer,
      filename: outputFilename,
      contentType: "image/png",
    },
  };
}
