import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { User } from "@/db/schema";
import { BOT_THEME, ECONOMY } from "@/config/constants";
import { handleClaimCommand } from "@/commands/claim";
import { handleHdCommand } from "@/commands/hd";
import { getUserRecentTransactions, refundUserBalance } from "@/services/economy.service";
import { getDiscordAvatarUrl } from "@/services/avatar.service";
import { patchDiscordOriginalMessage } from "../client";

export async function handleCommonButtons(
  interaction: any,
  user: User,
  action: string,
  customId: string,
  discordUserId: string
): Promise<NextResponse | null> {
  const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
  const interactionToken = interaction.token;

  // 1. Button Claim Daily Reward
  if (action === "btn_claim") {
    waitUntil(
      (async () => {
        try {
          const claimResult = await handleClaimCommand(discordUserId, interaction.guild_id);
          await patchDiscordOriginalMessage(applicationId, interactionToken, {
            responsePayload: claimResult,
          });
        } catch (claimErr) {
          console.error("Background button claim error:", claimErr);
        }
      })()
    );

    return NextResponse.json({ type: 6 });
  }

  // 2. Button View Recent Transactions
  if (action === "btn_history") {
    const txs = await getUserRecentTransactions(user.id, 5);

    const historyText =
      txs.length > 0
        ? txs
            .map((t) => {
              const moneyStr = t.moneyChange > 0 ? `+${t.moneyChange}` : `${t.moneyChange}`;
              const limitStr =
                t.limitChange !== 0
                  ? ` (${t.limitChange > 0 ? `+${t.limitChange}` : t.limitChange} 🎟️)`
                  : "";
              const dateStr = new Date(t.createdAt).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });
              return `• **[${t.type}]** \`${moneyStr} 💰${limitStr}\` — *${t.description || "-"}* (\`${dateStr}\`)`;
            })
            .join("\n")
        : "Belum ada riwayat transaksi yang tercatat.";

    return NextResponse.json({
      type: 4,
      data: {
        flags: 64, // Ephemeral
        embeds: [
          {
            title: "📜 Riwayat Transaksi Terakhir Kamu — Ayaa Bot 🌸",
            color: BOT_THEME.COLOR_PINK,
            description:
              `Halo **${user.username || "Manis"}**! Ini dia 5 transaksi terakhir kamu:\n\n` +
              historyText,
            footer: {
              text: `Ayaa Bot 🌸 • Saldo saat ini: ${user.money.toLocaleString("id-ID")} Money • ${user.limitCount} Limit`,
            },
          },
        ],
      },
    });
  }

  // 3. Button Upscale Avatar to 2x HD
  if (action === "btn_hd_avatar") {
    const targetUserId = customId.split(":")[1] || discordUserId;
    const avatarUrl = getDiscordAvatarUrl(targetUserId, null, 2048);

    const avatarAttachment = {
      id: "avatar",
      filename: `${targetUserId}_avatar.png`,
      url: avatarUrl,
      size: 0,
    };

    waitUntil(
      (async () => {
        try {
          const hdResult = await handleHdCommand(user, avatarAttachment, { scale: 2, mode: "sharp" });
          const delivered = await patchDiscordOriginalMessage(applicationId, interactionToken, hdResult);

          if (!delivered && hdResult.fileAttachment) {
            await refundUserBalance(
              user.id,
              ECONOMY.HD_COST_MONEY_2X,
              ECONOMY.HD_COST_LIMIT_2X,
              "Discord gagal mengirim HD Avatar"
            );
          }
        } catch (err) {
          console.error("Avatar HD upscale error:", err);
        }
      })()
    );

    return NextResponse.json({ type: 5 });
  }

  return null;
}
