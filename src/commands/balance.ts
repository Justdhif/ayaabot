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
              name: "🔥 Daily Streak",
              value: `**${user.claimStreak || 0} Hari**`,
              inline: true,
            },
            {
              name: "🎁 Status Claim",
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
      components: [
        {
          type: 1, // Action Row
          components: [
            {
              type: 2, // Button
              style: cooldown.canExecute ? 3 : 2, // 3: Success (Green), 2: Secondary (Grey)
              label: cooldown.canExecute ? "Ambil Daily Claim" : "Claim Cooldown",
              emoji: { name: cooldown.canExecute ? "🎁" : "⏳" },
              custom_id: `btn_claim:${user.discordId}`,
              disabled: !cooldown.canExecute,
            },
            {
              type: 2, // Button
              style: 2, // Secondary (Grey)
              label: "Riwayat Transaksi",
              emoji: { name: "📜" },
              custom_id: `btn_history:${user.discordId}`,
            },
          ],
        },
      ],
    },
  };
}
