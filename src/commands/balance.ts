import { User } from "../db/schema";
import { checkClaimCooldown } from "../services/ratelimit.service";
import { BOT_THEME } from "../config/constants";

export function handleBalanceCommand(user: User) {
  const cooldown = checkClaimCooldown(user.lastClaimAt);
  const claimStatus = cooldown.canExecute
    ? "✨ Siap Diambil!"
    : `⏳ ${cooldown.formattedRemaining} lagi`;

  const moneyFormatted = user.money.toLocaleString("id-ID");
  const limitFormatted = user.limitCount.toLocaleString("id-ID");

  return {
    type: 4, // ChannelMessageWithSource
    data: {
      embeds: [
        {
          title: "👛 Dompet Cantik Kamu — Ayaa Bot 🌸",
          color: BOT_THEME.COLOR_PINK,
          description: "Ini dia status saldo dan tiket jatah upscaling kamu saat ini yaa~ 💕",
          fields: [
            {
              name: "💰 Uang Jajan",
              value: `**${moneyFormatted} Money**`,
              inline: true,
            },
            {
              name: "🎟️ Tiket Limit",
              value: `**${limitFormatted} Limit**`,
              inline: true,
            },
            {
              name: "🎁 Daily Claim",
              value: `**${claimStatus}**`,
              inline: true,
            },
          ],
          image: {
            url: BOT_THEME.BANNER_URL,
          },
          footer: {
            text: `Ayaa Bot 🌸 • User: ${user.username || user.discordId}`,
          },
        },
      ],
    },
  };
}
