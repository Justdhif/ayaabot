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
  return {
    type: 4,
    data: {
      embeds: [
        {
          title: "🎀 Yeay! Hadiah Harian Berhasil Diambil! 🌸",
          color: BOT_THEME.COLOR_PINK,
          description:
            "Asiiik, uang jajan harian kamu udah masuk ke dompet nih~ ✨\n\n" +
            "💰 **+1,000 Money**\n" +
            "🎟️ **+5 Limit HD**\n\n" +
            "**Isi Dompet Kamu Sekarang:**\n" +
            `💰 Saldo Money: **${user.money.toLocaleString("id-ID")}**\n` +
            `🎟️ Tiket Limit: **${user.limitCount.toLocaleString("id-ID")}**\n\n` +
            "*Jangan lupa kembali lagi besok yaa buat ambil jatah berikutnya~ 🧸💕*",
          image: {
            url: BOT_THEME.BANNER_URL,
          },
          footer: {
            text: "Ayaa Bot 🌸 • Selamat berkreasi!",
          },
        },
      ],
    },
  };
}
