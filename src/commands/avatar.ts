import { BOT_THEME } from "../config/constants";
import { getDiscordAvatarUrl, getDiscordGuildIconUrl } from "../services/avatar.service";

export interface AvatarCommandOptions {
  targetUser?: {
    id: string;
    username: string;
    global_name?: string | null;
    avatar?: string | null;
  };
  isServerIcon?: boolean;
  guildId?: string;
  guildIconHash?: string | null;
  guildName?: string;
}

export function handleAvatarCommand(options: AvatarCommandOptions) {
  if (options.isServerIcon && options.guildId) {
    const iconUrl = getDiscordGuildIconUrl(options.guildId, options.guildIconHash, 4096);

    if (!iconUrl) {
      return {
        type: 4,
        data: {
          embeds: [
            {
              title: "😿 Server Ini Belum Punya Ikon",
              color: BOT_THEME.COLOR_ROSE,
              description: `Server **${options.guildName || "ini"}** belum memasang foto ikon/logo server yaa manis~ 🥺`,
            },
          ],
          flags: 64,
        },
      };
    }

    return {
      type: 4,
      data: {
        embeds: [
          {
            title: `🏰 Ikon Server: ${options.guildName || "ayaa room"} 🌸`,
            color: BOT_THEME.COLOR_PINK,
            description:
              `Berikut adalah ikon server dalam kualitas maksimal hingga **4096px HD**! ✨\n\n` +
              `[🔗 Buka Gambar Asli (4096px)](${iconUrl})`,
            image: {
              url: iconUrl,
            },
            footer: {
              text: "Ayaa Bot 🌸 • HD Avatar & Server Icon Grabber",
            },
          },
        ],
        components: [
          {
            type: 1, // ACTION_ROW
            components: [
              {
                type: 2, // BUTTON
                style: 5, // LINK
                label: "Download Full HD (4096px)",
                url: iconUrl,
              },
            ],
          },
        ],
      },
    };
  }

  const user = options.targetUser;
  if (!user) {
    return {
      type: 4,
      data: {
        content: "❌ Data user tidak ditemukan.",
        flags: 64,
      },
    };
  }

  const avatarUrl = getDiscordAvatarUrl(user.id, user.avatar, 4096);
  const displayName = user.global_name || user.username;

  return {
    type: 4,
    data: {
      embeds: [
        {
          title: `🖼️ Foto Profil: ${displayName} 🌸`,
          color: BOT_THEME.COLOR_PINK,
          description:
            `Ini dia foto avatar milik <@${user.id}> dalam kualitas maksimal **4096px HD**! ✨\n\n` +
            `[🔗 Buka Avatar Asli (4096px)](${avatarUrl})`,
          image: {
            url: avatarUrl,
          },
          footer: {
            text: "Ayaa Bot 🌸 • HD Avatar Grabber",
          },
        },
      ],
      components: [
        {
          type: 1, // ACTION_ROW
          components: [
            {
              type: 2, // BUTTON
              style: 1, // PRIMARY
              custom_id: `btn_hd_avatar:${user.id}`,
              label: "✨ Sulap Jadi 2× HD",
            },
            {
              type: 2, // BUTTON
              style: 5, // LINK
              label: "Download Full HD (4096px)",
              url: avatarUrl,
            },
          ],
        },
      ],
    },
  };
}
