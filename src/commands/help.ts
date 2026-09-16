import { BOT_THEME } from "../config/constants";

export function handleHelpCommand() {
  return {
    type: 4, // ChannelMessageWithSource
    data: {
      embeds: [
        {
          title: "🌸 Halo! Aku Ayaa Bot~ 🎀",
          color: BOT_THEME.COLOR_PINK,
          description:
            "✨ *Bikin fotomu makin jernih, tajam & gemas setiap hari!* ✨\n\n" +
            "Yuk intip perintah-perintah yang bisa kamu gunakan di bawah ini yaa: 💕\n",
          fields: [
            {
              name: "🖼️ `/hd [image] (scale) (mode)`",
              value:
                "Sulap foto jadi 2× atau 4× lebih jernih & tajam! ✨\n" +
                "• Pilihan Skala: `2x` (100 💰 + 1 🎟️) atau `4x` (200 💰 + 2 🎟️)\n" +
                "• Pilihan Mode: `Sharp` (Detail tajam) atau `Soft` (Halus mulus)\n" +
                "*Cooldown 15 detik per user*",
              inline: false,
            },
            {
              name: "🎨 `/filter [image] [preset]`",
              value:
                "Beri filter warna manis & aesthetic pada foto kamu! 🌸\n" +
                "• Preset: `Soft Pink Glow 🌸`, `Vintage Warm ☕`, `B&W Dreamy 🖤`, `Anime Pop 🎨`\n" +
                "• Biaya hemat: **50 Money** (0 Tiket Limit)",
              inline: false,
            },
            {
              name: "🔄 `/convert [image] [format] (quality)`",
              value:
                "Ubah format foto & kompres ukuran file agar ringan dibagikan! 📦\n" +
                "• Format: `PNG`, `JPG`, atau `WebP` (Kualitas: 100%, 80%, atau 60%)\n" +
                "• Biaya: **25 Money** (0 Tiket Limit)",
              inline: false,
            },
            {
              name: "🎁 `/gift [user] [amount] (resource) (message)`",
              value:
                "Kirim kado manis koin atau tiket limit ke temanmu! 💕\n" +
                "• Contoh: `/gift user:@Ayaa amount:500 message:Buat jajan boba 🧋`",
              inline: false,
            },
            {
              name: "🌟 `/claim` (Daily Streak Multiplier)",
              value:
                "Ambil hadiah harianmu! Dapatkan bonus multiplier beruntun:\n" +
                "• Hari 1: `+1.000 💰 + 5 🎟️` ➔ Hari 7+: `+3.000 💰 + 8 🎟️` 👑\n" +
                "*Klaim setiap 24-48 jam untuk menjaga streak kamu tetap aktif!*",
              inline: false,
            },
            {
              name: "👛 `/balance`",
              value: "Cek isi dompet, sisa tiket limit & streak harianmu 🎀\n*Dilengkapi tombol interaktif langsung!*",
              inline: false,
            },
            {
              name: "📖 `/help`",
              value: "Tampilkan kembali menu panduan imut ini~ 🐾",
              inline: false,
            },
          ],
          image: {
            url: BOT_THEME.BANNER_URL,
          },
          footer: {
            text: "Ayaa Bot 🌸 • v1.2.0 • Made with lots of love 💕",
          },
        },
      ],
    },
  };
}
