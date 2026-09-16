import { claimDailyReward } from "../services/economy.service";
import { BOT_THEME } from "../config/constants";

export async function handleClaimCommand(discordId: string) {
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
  const streakMultiplierText =
    streakCount >= 7
      ? "👑 **STREAK MASTER (7+ HARI)** — Maksimal Bonus! 🎉"
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
            `🔥 Daily Streak: **${streakCount} Hari Berturut-turut**\n\n` +
            "*Kembali lagi besok dalam 24 jam untuk melipatgandakan streak & bonusmu yaa manis~ 🧸💕*",
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
