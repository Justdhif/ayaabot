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
              name: "🎁 `/claim`",
              value: "Ambil uang jajan harian kamu (**+1,000 Money** & **+5 Limit**) 🌸\n*Bisa di-claim setiap 24 jam sekali yaa~*",
              inline: false,
            },
            {
              name: "👛 `/balance`",
              value: "Cek isi dompet & sisa tiket limit kamu 🎀",
              inline: false,
            },
            {
              name: "🖼️ `/hd [image]`",
              value: "Kirim foto kamu dan aku sulap jadi 2× lebih jernih & HD! ✨\n*Biaya: 100 Money + 1 Limit (Cooldown 15 detik)*",
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
            text: "Ayaa Bot 🌸 • Made with lots of love 💕",
          },
        },
      ],
    },
  };
}
