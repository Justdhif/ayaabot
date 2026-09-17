import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { User } from "@/db/schema";
import { BOT_THEME, ECONOMY } from "@/config/constants";
import { handleCompressCommand } from "@/commands/compress";
import { refundUserBalance } from "@/services/economy.service";
import { buildCompressPanel } from "@/components/panels";
import { patchDiscordOriginalMessage } from "../client";

export async function handleCompressButtons(
  interaction: any,
  user: User,
  action: string,
  customId: string
): Promise<NextResponse | null> {
  if (action === "cp_sw") {
    const [, mode, format] = customId.split(":");
    const imageUrl =
      interaction.message?.embeds?.[0]?.image?.url ||
      interaction.message?.attachments?.[0]?.url ||
      "";

    const panel = buildCompressPanel(user, imageUrl, mode, format);
    return NextResponse.json({ type: 7, data: panel });
  }

  if (action === "cp_run") {
    const [, mode, format] = customId.split(":");
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
            id: "cp_img",
            filename: "photo.png",
            url: imageUrl,
            size: 0,
          };
          const cpResult = await handleCompressCommand(user, attachment, {
            mode,
            format: format as any,
          });
          const delivered = await patchDiscordOriginalMessage(
            applicationId,
            interactionToken,
            cpResult
          );

          if (!delivered && cpResult.fileAttachment) {
            await refundUserBalance(
              user.id,
              ECONOMY.COMPRESS_COST_MONEY,
              0,
              "Discord gagal mengirim file Compress"
            );
          }
        } catch (err) {
          console.error("Background Compress button execution error:", err);
        }
      })()
    );

    return NextResponse.json({
      type: 7,
      data: {
        embeds: [
          {
            title: "⏳ Sedang Mengompresi & Mengoptimalkan Gambar... 🗜️",
            color: BOT_THEME.COLOR_SKY,
            description: `Ayaa sedang mengecilkan ukuran gambarmu dengan mode **${mode}** (${format.toUpperCase()})~ ✨\nTunggu sebentar yaa manis! 💕`,
            image: { url: imageUrl },
          },
        ],
        components: [],
      },
    });
  }

  return null;
}
