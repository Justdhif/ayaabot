import { DISCORD_CONFIG } from "../config/constants";

interface AssignRoleResult {
  success: boolean;
  roleId: string;
  roleName: string;
  error?: string;
}

/**
 * Assigns a role to a guild member in Discord via Discord REST API.
 * This operation is idempotent in Discord (assigning an already assigned role returns 204).
 */
export async function assignGuildRole(
  guildId: string,
  userId: string,
  roleId: string = DISCORD_CONFIG.STREAK_3D_ROLE_ID,
  roleName: string = DISCORD_CONFIG.STREAK_3D_ROLE_NAME
): Promise<AssignRoleResult> {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    console.warn("[DiscordRoleService] DISCORD_TOKEN is not configured.");
    return { success: false, roleId, roleName, error: "DISCORD_TOKEN is not configured" };
  }

  const targetGuildId = guildId || process.env.DISCORD_GUILD_ID || DISCORD_CONFIG.DEFAULT_GUILD_ID;
  if (!targetGuildId) {
    console.warn("[DiscordRoleService] Guild ID is missing.");
    return { success: false, roleId, roleName, error: "Guild ID is missing" };
  }

  const endpoint = `https://discord.com/api/v10/guilds/${targetGuildId}/members/${userId}/roles/${roleId}`;

  try {
    const res = await fetch(endpoint, {
      method: "PUT",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
        "X-Audit-Log-Reason": `Daily claim streak reward: @${roleName}`,
      },
    });

    if (res.status === 204) {
      console.log(`[DiscordRoleService] Successfully assigned role ${roleName} (${roleId}) to user ${userId}`);
      return { success: true, roleId, roleName };
    }

    const errorBody = await res.text().catch(() => "");
    console.error(`[DiscordRoleService] Failed to assign role ${roleId} to user ${userId}. Status: ${res.status}. Body: ${errorBody}`);

    if (res.status === 403) {
      return {
        success: false,
        roleId,
        roleName,
        error: "Bot tidak memiliki izin MANAGE_ROLES atau posisi role bot berada di bawah role target.",
      };
    }

    return {
      success: false,
      roleId,
      roleName,
      error: `Discord API returned status ${res.status}`,
    };
  } catch (err: any) {
    console.error("[DiscordRoleService] Network/Unknown error when assigning role:", err);
    return {
      success: false,
      roleId,
      roleName,
      error: err?.message || "Unknown error",
    };
  }
}
