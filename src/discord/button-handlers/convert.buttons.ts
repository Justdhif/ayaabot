import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { User } from "@/db/schema";
import { BOT_THEME, ECONOMY } from "@/config/constants";
import { handleConvertCommand } from "@/commands/convert";
import { refundUserBalance } from "@/services/economy.service";
import { buildConvertPanel } from "@/components/panels";
import { patchDiscordOriginalMessage } from "../client";

export async function handleConvertButtons(
  interaction: any,
  user: User,
  action: string,
  customId: string
): Promise<NextResponse | null> {
  if (action === "cv_sw" || action === "cv_fmt" || action === "cv_q") {
    const [, format, qualityStr] = customId.split(":");
    const quality = Number(qualityStr) || 80;
    const imageUrl =
      interaction.message?.embeds?.[0]?.image?.url ||
      interaction.message?.attachments?.[0]?.url ||
      "";
    const panel = buildConvertPanel(user, imageUrl, format, quality);
    return NextResponse.json({ type: 7, data: panel });
  }

  if (action === "cv_run") {
    const [, format, qualityStr] = customId.split(":");
    const quality = Number(qualityStr) || 80;
    const imageUrl =
      interaction.message?.embeds?.[0]?.image?.url ||
      interaction.message?.attachments?.[0]?.url ||
      "";

    if (!imageUrl) {
      return NextResponse.json({
        type: 4,
        data: { content: "❌ URL gambar tidak ditemukan.", flags: 64 },
      });
    }

    const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
    const interactionToken = interaction.token;

    waitUntil(
      (async () => {
        try {
          const attachment = {
            id: "cv_img",
            filename: "photo.png",
            url: imageUrl,
            size: 0,
          };
          const cvResult = await handleConvertCommand(user, attachment, {
            format,
            quality,
          });
          const delivered = await patchDiscordOriginalMessage(
            applicationId,
            interactionToken,
            cvResult
          );

          if (!delivered && cvResult.fileAttachment) {
            await refundUserBalance(
              user.id,
              ECONOMY.CONVERT_COST_MONEY,
              0,
              "Discord gagal mengirim file Convert"
            );
          }
        } catch (err) {
          console.error("Background Convert button execution error:", err);
        }
      })()
    );

    return NextResponse.json({
      type: 7,
      data: {
        embeds: [
          {
            title: "⏳ Sedang Mengonversi & Mengompres Gambar... 📦",
            color: BOT_THEME.COLOR_SKY,
            description: `Ayaa sedang mengubah format fotomu ke **${format.toUpperCase()}** (${quality}%)~ ✨\nTunggu sebentar yaa manis! 💕`,
            image: { url: imageUrl },
          },
        ],
        components: [],
      },
    });
  }

  return null;
}
