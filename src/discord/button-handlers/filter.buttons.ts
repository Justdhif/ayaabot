import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { User } from "@/db/schema";
import { BOT_THEME, ECONOMY } from "@/config/constants";
import { handleFilterCommand } from "@/commands/filter";
import { refundUserBalance } from "@/services/economy.service";
import { buildFilterPanel } from "@/components/panels";
import { patchDiscordOriginalMessage } from "../client";

export async function handleFilterButtons(
  interaction: any,
  user: User,
  action: string,
  customId: string
): Promise<NextResponse | null> {
  if (action === "fl_sw") {
    const [, preset] = customId.split(":");
    const imageUrl =
      interaction.message?.embeds?.[0]?.image?.url ||
      interaction.message?.attachments?.[0]?.url ||
      "";
    const panel = buildFilterPanel(user, imageUrl, preset);
    return NextResponse.json({ type: 7, data: panel });
  }

  if (action === "fl_run") {
    const [, preset] = customId.split(":");
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
            id: "fl_img",
            filename: "photo.png",
            url: imageUrl,
            size: 0,
          };
          const flResult = await handleFilterCommand(user, attachment, preset);
          const delivered = await patchDiscordOriginalMessage(
            applicationId,
            interactionToken,
            flResult
          );

          if (!delivered && flResult.fileAttachment) {
            await refundUserBalance(
              user.id,
              ECONOMY.FILTER_COST_MONEY,
              0,
              "Discord gagal mengirim file Filter"
            );
          }
        } catch (err) {
          console.error("Background Filter button execution error:", err);
        }
      })()
    );

    return NextResponse.json({
      type: 7,
      data: {
        embeds: [
          {
            title: "⏳ Sedang Menerapkan Aesthetic Filter... 🎨",
            color: BOT_THEME.COLOR_PURPLE,
            description: `Ayaa sedang mewarnai fotomu dengan preset **${preset}**~ ✨\nTunggu sebentar yaa manis! 💕`,
            image: { url: imageUrl },
          },
        ],
        components: [],
      },
    });
  }

  return null;
}
