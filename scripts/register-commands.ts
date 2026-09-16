import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const commands = [
  {
    name: "claim",
    description: "Get your daily reward (+1,000 Money and +5 Limit)",
  },
  {
    name: "balance",
    description: "Check your current Money and Limit balance",
  },
  {
    name: "hd",
    description: "Upscale an image to 2x resolution (costs 100 Money + 1 Limit)",
    options: [
      {
        name: "image",
        description: "The image to upscale (PNG, JPG, JPEG, WEBP, max 10 MB)",
        type: 11, // ATTACHMENT type in Discord API
        required: true,
      },
    ],
  },
  {
    name: "help",
    description: "Show list of available commands and bot instructions",
  },
];

async function main() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token || !clientId) {
    console.error("❌ DISCORD_TOKEN and DISCORD_CLIENT_ID must be set in .env.local");
    process.exit(1);
  }

  // If GUILD_ID is provided, register for that specific guild (instant update).
  // Otherwise, register globally (takes up to an hour to propagate).
  const url = guildId
    ? `https://discord.com/api/v10/applications/${clientId}/guilds/${guildId}/commands`
    : `https://discord.com/api/v10/applications/${clientId}/commands`;

  console.log(`📡 Registering ${commands.length} slash commands to ${guildId ? `Guild (${guildId})` : "Global"}...`);

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Failed to register commands: ${response.status} ${errorText}`);
    process.exit(1);
  }

  const result = await response.json();
  console.log(`✅ Successfully registered ${result.length} commands:`);
  for (const cmd of result) {
    console.log(`   - /${cmd.name} (id: ${cmd.id})`);
  }
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
