export function handleHelpCommand() {
  return {
    type: 4, // InteractionResponseType.ChannelMessageWithSource
    data: {
      embeds: [
        {
          title: "🤖 CuanHD Help",
          color: 0x5865f2,
          description: "Private AI Image Upscaling & Economy Bot",
          fields: [
            {
              name: "🎁 `/claim`",
              value: "Get your daily reward (+1,000 Money & +5 Limit).\nCooldown: 24 hours.",
              inline: false,
            },
            {
              name: "💰 `/balance`",
              value: "Check your current Money, Limit, and daily claim availability.",
              inline: false,
            },
            {
              name: "🖼️ `/hd [image]`",
              value: "Upscale an image (2× scale).\nCost: 100 Money + 1 Limit.\nCooldown: 15 seconds.",
              inline: false,
            },
            {
              name: "ℹ️ `/help`",
              value: "Show this help menu.",
              inline: false,
            },
          ],
          footer: {
            text: "CuanHD v1.0.0 (MVP)",
          },
        },
      ],
    },
  };
}
