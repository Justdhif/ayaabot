import { db } from "../db";
import { usageLogs, User } from "../db/schema";
import { ECONOMY, BOT_THEME, STITCH_LAYOUTS, STITCH_BORDERS } from "../config/constants";
import { validateAndExtractImage } from "../services/image.service";
import { stitchImages } from "../services/stitch.service";
import { deductForStitch } from "../services/economy.service";
import { AttachmentOption } from "./hd";

export interface StitchExecutionResult {
  responsePayload: any;
  fileAttachment?: {
    buffer: Buffer;
    filename: string;
    contentType: string;
  };
}

export async function handleStitchCommand(
  user: User,
  attachments: AttachmentOption[],
  options?: { layout?: string; border?: string }
): Promise<StitchExecutionResult> {
  const layout = options?.layout || STITCH_LAYOUTS.HORIZONTAL;
  const border = options?.border || STITCH_BORDERS.NONE;
  const costMoney = ECONOMY.STITCH_COST_MONEY;

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
                `Untuk menggabungkan gambar butuh **${costMoney} Money**, tapi saldo kamu saat ini baru **${user.money.toLocaleString("id-ID")}**.\n\n` +
                "Yuk ambil uang jajan dulu pakai perintah **`/claim`** yaa! 🎀💕",
            },
          ],
        },
      },
    };
  }

  // 2. Validate Attachments count
  const validAttachments = (attachments || []).filter((a) => a && a.url);
  if (validAttachments.length < 2) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "🌸 Butuh Minimal 2 Gambar Manis! 📷",
              color: BOT_THEME.COLOR_ROSE,
              description:
                "Untuk menggabungkan foto (stitch/kolase), kamu perlu melampirkan minimal **2 gambar** yaa (`image1` dan `image2`)~ 🎀\n\n" +
                "Bisa sampai 4 gambar sekaligus lho! Cocok banget buat perbandingan *Before vs After* 💕",
            },
          ],
        },
      },
    };
  }

  // 3. Download & Validate All Images
  const validatedBuffers: Buffer[] = [];
  let totalOrigWidth = 0;
  let totalOrigHeight = 0;

  for (let i = 0; i < validAttachments.length; i++) {
    const att = validAttachments[i];
    const validation = await validateAndExtractImage(att.url, att.content_type, att.size);
    if (!validation.valid || !validation.buffer) {
      return {
        responsePayload: {
          type: 4,
          data: {
            embeds: [
              {
                title: "🌸 Salah Satu Gambar Bermasalah Nih~ 🥺",
                color: BOT_THEME.COLOR_ROSE,
                description:
                  `Gambar ke-${i + 1} (${att.filename || "image"}) tidak valid: ${validation.error || "Format tidak didukung"}.\n\n` +
                  "Pastikan semua gambar berformat PNG, JPG, atau WebP yaa~ 🧸",
              },
            ],
          },
        },
      };
    }
    validatedBuffers.push(validation.buffer);
    totalOrigWidth += validation.width || 800;
    totalOrigHeight += validation.height || 600;
  }

  // 4. Stitch Image Processing
  const stitchResult = await stitchImages({
    imageBuffers: validatedBuffers,
    layout,
    border,
  });

  if (!stitchResult.success || !stitchResult.outputBuffer) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "😿 Ups, Gagal Menggabungkan Gambar",
              color: BOT_THEME.COLOR_ROSE,
              description:
                `Maaf yaa manis, gambar gagal digabungkan: ${stitchResult.error || "Kesalahan proses"}.\n` +
                "Tapi tenang aja, **saldo kamu tetap aman dan tidak terpotong** kok! Silakan coba lagi yaa~ 💕",
            },
          ],
        },
      },
    };
  }

  // 5. Deduct Stitch Cost
  const deductResult = await deductForStitch(user.id, stitchResult.imageCount);
  if (!deductResult.success || !deductResult.user) {
    return {
      responsePayload: {
        type: 4,
        data: {
          embeds: [
            {
              title: "😿 Terjadi Kesalahan Transaksi",
              color: BOT_THEME.COLOR_ROSE,
              description: "Gagal memproses biaya penggabungan gambar. Coba lagi yaa manis~ 🥺",
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
    originalFilename: `stitch_${stitchResult.imageCount}_images`,
    originalWidth: Math.round(totalOrigWidth / stitchResult.imageCount),
    originalHeight: Math.round(totalOrigHeight / stitchResult.imageCount),
    outputWidth: stitchResult.width,
    outputHeight: stitchResult.height,
    scale: 1,
    status: "SUCCESS",
    processingTimeMs: stitchResult.processingTimeMs,
  });

  const outputFilename = `ayaabot_stitched_${Date.now()}.${stitchResult.extension}`;

  const layoutLabel =
    layout === STITCH_LAYOUTS.VERTICAL
      ? "Vertikal (Atas-Bawah) ↕️"
      : layout === STITCH_LAYOUTS.GRID
      ? "Grid 2×2 (Kolase) 🔲"
      : "Horizontal (Berdampingan / Before-After) ↔️";

  return {
    responsePayload: {
      type: 4,
      data: {
        embeds: [
          {
            title: "🎨 Gambar Berhasil Digabungkan!~ 🌸",
            color: BOT_THEME.COLOR_PURPLE,
            description:
              `Selesai! Sebanyak **${stitchResult.imageCount} gambar** berhasil disatukan dengan cantik! 💖\n\n` +
              `📐 **Susunan Layout:** \`${layoutLabel}\`\n` +
              `🖼️ **Dimensi Kanvas:** \`${stitchResult.width} × ${stitchResult.height} px\`\n` +
              `⚡ **Waktu Proses:** \`${(stitchResult.processingTimeMs / 1000).toFixed(2)} detik\`\n\n` +
              "**Sisa Saldo Kamu:**\n" +
              `💰 Uang Jajan: **${updatedUser.money.toLocaleString("id-ID")} Money** (-${costMoney})\n` +
              `🎟️ Tiket Limit: **${updatedUser.limitCount.toLocaleString("id-ID")} Tiket** (Gratis/Tidak terpotong)`,
            image: {
              url: `attachment://${outputFilename}`,
            },
            footer: {
              text: "Ayaa Bot 🌸 • Image Merger & Stitch Studio",
            },
          },
        ],
      },
    },
    fileAttachment: {
      buffer: stitchResult.outputBuffer,
      filename: outputFilename,
      contentType: stitchResult.contentType,
    },
  };
}
