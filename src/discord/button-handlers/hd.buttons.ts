import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { User } from "@/db/schema";
import { BOT_THEME, ECONOMY } from "@/config/constants";
import { handleHdCommand } from "@/commands/hd";
import { refundUserBalance } from "@/services/economy.service";
import { buildHdPanel } from "@/components/panels";
import { patchDiscordOriginalMessage } from "../client";

export async function handleHdButtons(
  interaction: any,
  user: User,
  action: string,
  customId: string
): Promise<NextResponse | null> {
  if (action === "hd_sw" || action === "hd_scale" || action === "hd_mode") {
    const [, scaleStr, mode] = customId.split(":");
    const scale = Number(scaleStr) || 2;
    const imageUrl =
      interaction.message?.embeds?.[0]?.image?.url ||
      interaction.message?.attachments?.[0]?.url ||
      "";
    const panel = buildHdPanel(user, imageUrl, scale, mode as "sharp" | "soft");
    return NextResponse.json({ type: 7, data: panel });
  }

  if (action === "hd_run") {
    const [, scaleStr, mode] = customId.split(":");
    const scale = Number(scaleStr) || 2;
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
            id: "hd_img",
            filename: "photo.png",
            url: imageUrl,
            size: 0,
          };
          const hdResult = await handleHdCommand(user, attachment, {
            scale,
            mode: mode as "sharp" | "soft",
          });
          const delivered = await patchDiscordOriginalMessage(
            applicationId,
            interactionToken,
            hdResult
          );

          if (!delivered && hdResult.fileAttachment) {
            const costMoney =
              scale === 4 ? ECONOMY.HD_COST_MONEY_4X : ECONOMY.HD_COST_MONEY_2X;
            const costLimit =
              scale === 4 ? ECONOMY.HD_COST_LIMIT_4X : ECONOMY.HD_COST_LIMIT_2X;
            await refundUserBalance(
              user.id,
              costMoney,
              costLimit,
              "Discord gagal mengirim file HD"
            );
          }
        } catch (err) {
          console.error("Background HD button execution error:", err);
        }
      })()
    );

    return NextResponse.json({
      type: 7,
      data: {
        embeds: [
          {
            title: "⏳ Sedang Menyulap Gambar ke HD... ✨",
            color: BOT_THEME.COLOR_PINK,
            description: `Ayaa sedang memproses fotomu ke resolusi **${scale}× HD (${mode})**~ 🎀\nTunggu sebentar yaa manis! 💕`,
            image: { url: imageUrl },
          },
        ],
        components: [],
      },
    });
  }

  return null;
}
