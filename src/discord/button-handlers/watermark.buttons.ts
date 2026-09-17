import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { User } from "@/db/schema";
import { BOT_THEME, ECONOMY } from "@/config/constants";
import { handleWatermarkCommand } from "@/commands/watermark";
import { refundUserBalance } from "@/services/economy.service";
import { buildWatermarkPanel } from "@/components/panels";
import { patchDiscordOriginalMessage } from "../client";

export async function handleWatermarkButtons(
  interaction: any,
  user: User,
  action: string,
  customId: string
): Promise<NextResponse | null> {
  if (action === "wm_sw" || action === "wm_pos" || action === "wm_op") {
    const [, opacity, position] = customId.split(":");
    const imageUrl =
      interaction.message?.embeds?.[0]?.image?.url ||
      interaction.message?.attachments?.[0]?.url ||
      "";
    const footerText = interaction.message?.embeds?.[0]?.footer?.text || "";
    const textMatch = footerText.match(/text=(.+)$/);
    const activeText = textMatch ? textMatch[1] : `@${user.username || "Ayaa Bot"}`;

    const panel = buildWatermarkPanel(user, imageUrl, opacity, position, activeText);
    return NextResponse.json({ type: 7, data: panel });
  }

  if (action === "wm_run") {
    const [, opacity, position] = customId.split(":");
    const imageUrl =
      interaction.message?.embeds?.[0]?.image?.url ||
      interaction.message?.attachments?.[0]?.url ||
      "";
    const footerText = interaction.message?.embeds?.[0]?.footer?.text || "";
    const textMatch = footerText.match(/text=(.+)$/);
    const activeText = textMatch ? textMatch[1] : `@${user.username || "Ayaa Bot"}`;

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
            id: "wm_img",
            filename: "photo.png",
            url: imageUrl,
            size: 0,
          };
          const wmResult = await handleWatermarkCommand(user, attachment, {
            text: activeText,
            position,
            opacity,
          });
          const delivered = await patchDiscordOriginalMessage(
            applicationId,
            interactionToken,
            wmResult
          );

          if (!delivered && wmResult.fileAttachment) {
            await refundUserBalance(
              user.id,
              ECONOMY.WATERMARK_COST_MONEY,
              0,
              "Discord gagal mengirim file Watermark"
            );
          }
        } catch (err) {
          console.error("Background Watermark button execution error:", err);
        }
      })()
    );

    return NextResponse.json({
      type: 7,
      data: {
        embeds: [
          {
            title: "⏳ Sedang Menempelkan Watermark... 🎨",
            color: BOT_THEME.COLOR_ROSE,
            description: `Ayaa sedang menempelkan watermark \`${activeText}\` pada fotomu~ ✨\nTunggu sebentar yaa manis! 💕`,
            image: { url: imageUrl },
          },
        ],
        components: [],
      },
    });
  }

  return null;
}
