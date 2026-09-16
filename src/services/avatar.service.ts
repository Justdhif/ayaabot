/**
 * Constructs high-resolution CDN URLs for Discord User Avatars and Guild Icons.
 */
export function getDiscordAvatarUrl(
  userId: string,
  avatarHash?: string | null,
  size: number = 4096
): string {
  if (avatarHash) {
    const isAnimated = avatarHash.startsWith("a_");
    const ext = isAnimated ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=${size}`;
  }

  // Default Discord avatar fallback based on user ID
  try {
    const defaultIndex = (BigInt(userId) >> 22n) % 6n;
    return `https://cdn.discordapp.com/embed/avatars/${defaultIndex}.png?size=${size}`;
  } catch {
    return `https://cdn.discordapp.com/embed/avatars/0.png?size=${size}`;
  }
}

export function getDiscordGuildIconUrl(
  guildId: string,
  iconHash?: string | null,
  size: number = 4096
): string | null {
  if (!iconHash) return null;
  const isAnimated = iconHash.startsWith("a_");
  const ext = isAnimated ? "gif" : "png";
  return `https://cdn.discordapp.com/icons/${guildId}/${iconHash}.${ext}?size=${size}`;
}
