import { claimDailyReward } from "../services/economy.service";

export async function handleClaimCommand(discordId: string) {
  const result = await claimDailyReward(discordId);

  if (!result.success) {
    if (result.alreadyClaimed) {
      return {
        type: 4,
        data: {
          embeds: [
            {
              title: "⏳ Daily Reward Already Claimed",
              color: 0xf1c40f,
              description: `You can claim again in:\n\n**${result.remainingCooldown}**`,
            },
          ],
        },
      };
    }

    return {
      type: 4,
      data: {
        content: "❌ Failed to claim daily reward. Please try again later.",
      },
    };
  }

  const user = result.user!;
  return {
    type: 4,
    data: {
      embeds: [
        {
          title: "🎁 Daily Reward Claimed!",
          color: 0x2ecc71,
          description: "💰 **+1,000 Money**\n🎟️ **+5 Limit**\n\n**Your Balance:**\n💰 Money: **" +
            user.money.toLocaleString("en-US") +
            "**\n🎟️ Limit: **" +
            user.limitCount.toLocaleString("en-US") +
            "**\n\n*Come back tomorrow for another reward.*",
        },
      ],
    },
  };
}
