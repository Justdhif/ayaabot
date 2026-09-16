import { NextRequest, NextResponse } from "next/server";
import { getUsersReadyForClaim } from "@/services/economy.service";
import { BOT_THEME, ECONOMY } from "@/config/constants";

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

    // 4. Send to Discord Webhook if configured
    const webhookUrl =
      process.env.DISCORD_REMINDER_WEBHOOK_URL || process.env.DISCORD_WEBHOOK_URL;
    if (webhookUrl) {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reminderPayload),
      });
      sent = res.ok;
    } else if (process.env.DISCORD_CHANNEL_ID && process.env.DISCORD_TOKEN) {
      // 5. Alternatively send to Channel ID via Discord Bot Token
      const res = await fetch(
        `https://discord.com/api/v10/channels/${process.env.DISCORD_CHANNEL_ID}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reminderPayload),
        }
      );
      sent = res.ok;
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      readyUserCount: readyCount,
      notificationSent: sent,
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
