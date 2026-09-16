import { User } from "../db/schema";
import { checkClaimCooldown } from "../services/ratelimit.service";

export function handleBalanceCommand(user: User) {
  const cooldown = checkClaimCooldown(user.lastClaimAt);
  const claimStatus = cooldown.canExecute
    ? "Available"
    : `In ${cooldown.formattedRemaining}`;

  const moneyFormatted = user.money.toLocaleString("en-US");
  const limitFormatted = user.limitCount.toLocaleString("en-US");

  return {
    type: 4, // InteractionResponseType.ChannelMessageWithSource
    data: {
      embeds: [
        {
          title: "💎 CuanHD Balance",
          color: 0x00d26a,
          fields: [
            {
              name: "💰 Money",
              value: `**${moneyFormatted}**`,
              inline: true,
            },
            {
              name: "🎟️ Limit",
              value: `**${limitFormatted}**`,
              inline: true,
            },
            {
              name: "🎁 Daily Claim",
              value: `**${claimStatus}**`,
              inline: true,
            },
          ],
          footer: {
            text: `User ID: ${user.discordId}`,
          },
        },
      ],
    },
  };
}
