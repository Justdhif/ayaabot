import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { User } from "@/db/schema";
import { BOT_THEME } from "@/config/constants";
import { handleGiftCommand } from "@/commands/gift";
import { getUserByDiscordId, rollbackGift } from "@/services/economy.service";
import { buildGiftPanel } from "@/components/panels";
import { patchDiscordOriginalMessage } from "../client";

export async function handleGiftButtons(
  interaction: any,
  user: User,
  action: string,
  customId: string,
  discordUserId: string
): Promise<NextResponse | null> {
  const footerText = interaction.message?.embeds?.[0]?.footer?.text || "";
  const nameMatch = footerText.match(/Gift to: (.+) \(/);
  const targetUsername = nameMatch ? nameMatch[1] : "Teman Manis";

  if (action === "gf_sw") {
    const [, resource, amountStr, targetId] = customId.split(":");
    const amount = Number(amountStr) || 100;
    const panel = buildGiftPanel(
      user,
      targetId,
      targetUsername,
      resource as "money" | "limit",
      amount
    );
    return NextResponse.json({ type: 7, data: panel });
  }

  if (action === "gf_add") {
    const [, adderStr, resource, amountStr, targetId] = customId.split(":");
    const newAmount = (Number(amountStr) || 0) + (Number(adderStr) || 0);
    const panel = buildGiftPanel(
      user,
      targetId,
      targetUsername,
      resource as "money" | "limit",
      newAmount
    );
    return NextResponse.json({ type: 7, data: panel });
  }

  if (action === "gf_rst") {
    const [, resource, targetId] = customId.split(":");
    const panel = buildGiftPanel(
      user,
      targetId,
      targetUsername,
      resource as "money" | "limit",
      100
    );
    return NextResponse.json({ type: 7, data: panel });
  }

  if (action === "gf_run") {
    const [, resource, amountStr, targetId] = customId.split(":");
    const amount = Number(amountStr) || 100;

    const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
    const interactionToken = interaction.token;

    waitUntil(
      (async () => {
        try {
          const giftResult = await handleGiftCommand(
            discordUserId,
            targetId,
            amount,
            resource as "money" | "limit",
            undefined,
            targetUsername
          );

          const delivered = await patchDiscordOriginalMessage(
            applicationId,
            interactionToken,
            {
              responsePayload: giftResult,
            }
          );

          if (!delivered) {
            const targetUserObj = await getUserByDiscordId(targetId);
            if (targetUserObj) {
              await rollbackGift(
                user.id,
                targetUserObj.id,
                amount,
                resource as any,
                "Discord webhook gagal mengirim kado"
              );
            }
          }
        } catch (err) {
          console.error("Background Gift button error:", err);
        }
      })()
    );

    return NextResponse.json({
      type: 7,
      data: {
        embeds: [
          {
            title: "⏳ Sedang Mengirim Kado Manis... 🎁",
            color: BOT_THEME.COLOR_PINK,
            description: `Ayaa sedang memproses pengiriman **${amount.toLocaleString("id-ID")} ${resource === "limit" ? "Tiket Limit" : "Money"}** untuk <@${targetId}>~ ✨`,
          },
        ],
        components: [],
      },
    });
  }

  return null;
}
