import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { User } from "@/db/schema";
import { BOT_THEME, ECONOMY } from "@/config/constants";
import { handleStitchCommand } from "@/commands/stitch";
import { refundUserBalance } from "@/services/economy.service";
import { buildStitchPanel } from "@/components/panels";
import { patchDiscordOriginalMessage } from "../client";

export async function handleStitchButtons(
  interaction: any,
  user: User,
  action: string,
  customId: string
): Promise<NextResponse | null> {
  if (action === "st_sw" || action === "st_layout" || action === "st_border") {
    const [, layout, border] = customId.split(":");
    const fields = interaction.message?.embeds?.[0]?.fields || [];
    const sourcesField = fields.find((f: any) => f.name?.includes("Sumber Gambar"));
    const imageUrls = (sourcesField?.value || "").match(/https?:\/\/[^\s\)]+/g) || [];

    if (imageUrls.length === 0) {
      const fallbackUrl =
        interaction.message?.embeds?.[0]?.image?.url ||
        interaction.message?.attachments?.[0]?.url ||
        "";
      if (fallbackUrl) imageUrls.push(fallbackUrl);
    }

    const panel = buildStitchPanel(user, imageUrls, layout, border);
    return NextResponse.json({ type: 7, data: panel });
  }

  if (action === "st_run") {
    const [, layout, border] = customId.split(":");
    const fields = interaction.message?.embeds?.[0]?.fields || [];
    const sourcesField = fields.find((f: any) => f.name?.includes("Sumber Gambar"));
    const imageUrls = (sourcesField?.value || "").match(/https?:\/\/[^\s\)]+/g) || [];

    if (imageUrls.length < 2) {
      return NextResponse.json({
        type: 4,
        data: { content: "❌ Butuh minimal 2 URL gambar untuk digabungkan.", flags: 64 },
      });
    }

    const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
    const interactionToken = interaction.token;

    waitUntil(
      (async () => {
        try {
          const attachments = imageUrls.map((url: string, i: number) => ({
            id: `stitch_img_${i}`,
            filename: `photo_${i + 1}.png`,
            url,
            size: 0,
          }));

          const stitchResult = await handleStitchCommand(user, attachments, {
            layout,
            border,
          });

          const delivered = await patchDiscordOriginalMessage(
            applicationId,
            interactionToken,
            stitchResult
          );

          if (!delivered && stitchResult.fileAttachment) {
            await refundUserBalance(
              user.id,
              ECONOMY.STITCH_COST_MONEY,
              0,
              "Discord gagal mengirim file Stitch"
            );
          }
        } catch (err) {
          console.error("Background Stitch button execution error:", err);
        }
      })()
    );

    return NextResponse.json({
      type: 7,
      data: {
        embeds: [
          {
            title: "⏳ Sedang Menggabungkan Gambar... 🎨",
            color: BOT_THEME.COLOR_PURPLE,
            description: `Ayaa sedang menyatukan **${imageUrls.length} gambar** dengan layout **${layout}**~ ✨\nTunggu sebentar yaa manis! 💕`,
            image: { url: imageUrls[0] },
          },
        ],
        components: [],
      },
    });
  }

  return null;
}
