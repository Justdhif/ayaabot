import { NextRequest, NextResponse } from "next/server";
import { getUsersReadyForClaim } from "@/services/economy.service";
import { BOT_THEME, ECONOMY, DISCORD_CONFIG } from "@/config/constants";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  // 1. Verify Vercel Cron Secret (if configured in environment)
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 2. Query users who are ready to claim
    const readyUsers = await getUsersReadyForClaim();
    const readyCount = readyUsers.length;

    // 3. Format user mentions if any users are ready
    const userMentions =
      readyUsers.length > 0
        ? readyUsers.map((u) => `<@${u.discordId}>`).join(" ")
        : (process.env.WHITELIST_DISCORD_IDS || "")
            .split(",")
            .filter(Boolean)
            .map((id) => `<@${id.trim()}>`)
            .join(" ");

    const reminderPayload = {
      content: userMentions
        ? `${userMentions} Pagi! Uang jajan harian kamu sudah siap diambil nih~ 🌸`
        : undefined,
      embeds: [
        {
          title: "🌸 Pagi Manis! Waktunya Ambil Uang Jajan Harian~ 🎀",
          color: BOT_THEME.COLOR_PINK,
          description:
            `Semangat pagi! Uang jajan harian kamu (**+${ECONOMY.CLAIM_MONEY.toLocaleString("id-ID")} Money** & **+${ECONOMY.CLAIM_LIMIT} Tiket Limit**) sudah siap diambil lhoo!\n\n` +
            "Yuk langsung ketik **`/claim`** atau tekan tombol di menu **`/balance`** yaa manis~ 💕",
          image: {
            url: BOT_THEME.BANNER_URL,
          },
          footer: {
            text: `Ayaa Bot 🌸 • Daily Sweet Reminder • ${readyCount} user siap claim`,
          },
        },
      ],
    };

    let sent = false;
    let deliveryMethod = "none";
    let targetDestination = "";
    let sendError: string | null = null;

    // 4. Send to Discord Webhook if configured
    const webhookUrl =
      process.env.DISCORD_REMINDER_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;

    if (webhookUrl) {
      deliveryMethod = "webhook";
      targetDestination = webhookUrl.substring(0, 35) + "...";
      try {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reminderPayload),
        });
        sent = res.ok;
        if (!res.ok) {
          sendError = `Webhook HTTP ${res.status}: ${await res.text().catch(() => "")}`;
          console.error("[Cron Reminder] Webhook error:", sendError);
        }
      } catch (err: any) {
        sendError = err.message;
        console.error("[Cron Reminder] Webhook network error:", err);
      }
    } else {
      // 5. Send to Discord Channel via Bot Token
      const botToken = process.env.DISCORD_TOKEN;
      let targetChannelId =
        process.env.DISCORD_CHANNEL_ID || DISCORD_CONFIG.DEFAULT_CHANNEL_ID;

      // If channel ID not explicitly set, auto-discover first text channel in guild
      if (!targetChannelId && botToken) {
        const guildId = process.env.DISCORD_GUILD_ID || DISCORD_CONFIG.DEFAULT_GUILD_ID;
        try {
          const channelsRes = await fetch(
            `https://discord.com/api/v10/guilds/${guildId}/channels`,
            { headers: { Authorization: `Bot ${botToken}` } }
          );
          if (channelsRes.ok) {
            const channels = await channelsRes.json();
            const textChannel =
              channels.find(
                (c: any) => c.type === 0 && (c.name === "general" || c.name.includes("chat"))
              ) || channels.find((c: any) => c.type === 0);
            if (textChannel) {
              targetChannelId = textChannel.id;
            }
          }
        } catch (discoverErr) {
          console.warn("[Cron Reminder] Failed to auto-discover channel:", discoverErr);
        }
      }

      if (targetChannelId && botToken) {
        deliveryMethod = "bot_channel";
        targetDestination = `channel:${targetChannelId}`;
        try {
          const res = await fetch(
            `https://discord.com/api/v10/channels/${targetChannelId}/messages`,
            {
              method: "POST",
              headers: {
                Authorization: `Bot ${botToken}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(reminderPayload),
            }
          );
          sent = res.ok;
          if (!res.ok) {
            const errBody = await res.text().catch(() => "");
            sendError = `Discord API HTTP ${res.status}: ${errBody}`;
            console.error(
              `[Cron Reminder] Failed to send message to channel ${targetChannelId}:`,
              res.status,
              errBody
            );
          }
        } catch (netErr: any) {
          sendError = netErr.message;
          console.error("[Cron Reminder] Network error sending reminder to channel:", netErr);
        }
      } else {
        sendError = "No webhook URL, channel ID, or bot token configured";
        console.warn("[Cron Reminder] Target destination not configured:", {
          targetChannelId,
          hasToken: !!botToken,
        });
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      readyUserCount: readyCount,
      notificationSent: sent,
      deliveryMethod,
      targetDestination,
      error: sendError,
      users: readyUsers.map((u) => ({ id: u.discordId, username: u.username })),
    });
  } catch (err: any) {
    console.error("Cron reminder error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Internal cron error",
      },
      { status: 500 }
    );
  }
}
