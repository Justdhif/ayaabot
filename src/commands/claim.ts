import { claimDailyReward } from "../services/economy.service";
import { BOT_THEME, DISCORD_CONFIG } from "../config/constants";
import { assignGuildRole } from "../services/discord-role.service";

export async function handleClaimCommand(discordId: string, guildId?: string) {
  const result = await claimDailyReward(discordId);

  if (!result.success) {
    if (result.alreadyClaimed) {
      return {
        type: 4,
        data: {
          embeds: [
            {
              title: "⏳ Eits, Sabar Dulu Yaa Manis~ 🌸",
              color: BOT_THEME.COLOR_ROSE,
              description:
                "Kamu udah ambil jatah hadiah hari ini nih~ 🥺💕\n\n" +
                "Hadiah berikutnya bisa kamu claim lagi dalam:\n" +
                `⏰ **${result.remainingCooldown}**\n\n` +
                "*Tunggu cooldown selesai yaa, nanti Ayaa siapin hadiah baru buat kamu! 🎀*",
              image: {
                url: BOT_THEME.BANNER_URL,
              },
              footer: {
                text: "Ayaa Bot 🌸 • Daily Reward Cooldown",
              },
            },
          ],
        },
      };
    }

    return {
      type: 4,
      data: {
        embeds: [
          {
            title: "😿 Ups, Gagal Mengambil Hadiah",
            color: BOT_THEME.COLOR_ROSE,
            description: "Ayaa gagal memproses claim kamu nih, coba sebentar lagi yaa~ 🥺",
          },
        ],
      },
    };
  }

  const user = result.user!;
  const streakCount = result.streak || 1;

  // Streak Role Assignment (Streak >= 3)
  let roleStatusText = "";
  if (streakCount >= 3) {
    const roleRes = await assignGuildRole(
      guildId || DISCORD_CONFIG.DEFAULT_GUILD_ID,
      discordId,
      DISCORD_CONFIG.STREAK_3D_ROLE_ID,
      DISCORD_CONFIG.STREAK_3D_ROLE_NAME
    );

    if (roleRes.success) {
      roleStatusText = `\n\n👑 **SPECIAL ROLE REWARD DIAKTIFKAN!**\nSelamat! Kamu resmi mendapatkan role **@${DISCORD_CONFIG.STREAK_3D_ROLE_NAME}** di server! 🌸💕✨`;
    } else {
      roleStatusText = `\n\n👑 **SPECIAL ROLE REWARD:**\nKamu berhak atas role **@${DISCORD_CONFIG.STREAK_3D_ROLE_NAME}**! *(Catatan: Bot sedang menyinkronkan izin role di server)* 🌸`;
    }
  } else {
    const daysLeft = 3 - streakCount;
    roleStatusText = `\n\n💡 *Tips: Capai streak 3 hari untuk otomatis membuka role khusus **@${DISCORD_CONFIG.STREAK_3D_ROLE_NAME}** di server! (${daysLeft} hari lagi)* 🌸`;
  }

  const streakMultiplierText =
    streakCount >= 7
      ? "👑 **STREAK MASTER (7+ HARI)** — Maksimal Bonus! 🎉"
      : streakCount >= 3
      ? `🔥 **Streak Berjalan: Hari ke-${streakCount}** (Role Reward Unlocked! ✨)`
      : streakCount > 1
      ? `🔥 **Streak Berjalan: Hari ke-${streakCount}** (Bonus Makin Banyak!)`
      : "🌱 **Streak Baru: Hari ke-1**";

  return {
    type: 4,
    data: {
      embeds: [
        {
          title: "🎀 Yeay! Hadiah Harian Berhasil Diambil! 🌸",
          color: BOT_THEME.COLOR_PINK,
          description:
            `${streakMultiplierText}\n\n` +
            "Asiiik, uang jajan harian kamu udah masuk ke dompet nih~ ✨\n\n" +
            `💰 **+${(result.rewardMoney || 1000).toLocaleString("id-ID")} Money**\n` +
            `🎟️ **+${result.rewardLimit || 5} Limit HD**\n\n` +
            "**Isi Dompet Kamu Sekarang:**\n" +
            `💰 Saldo Money: **${user.money.toLocaleString("id-ID")}**\n` +
            `🎟️ Tiket Limit: **${user.limitCount.toLocaleString("id-ID")}**\n` +
            `🔥 Daily Streak: **${streakCount} Hari Berturut-turut**` +
            roleStatusText +
            "\n\n*Kembali lagi besok dalam 24 jam untuk melipatgandakan streak & bonusmu yaa manis~ 🧸💕*",
          image: {
            url: BOT_THEME.BANNER_URL,
          },
          footer: {
            text: `Ayaa Bot 🌸 • Daily Claim Streak #${streakCount}`,
          },
        },
      ],
    },
  };
}

