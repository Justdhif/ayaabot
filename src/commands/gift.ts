import { BOT_THEME } from "../config/constants";
import { transferGift } from "../services/economy.service";

export async function handleGiftCommand(
  senderDiscordId: string,
  targetDiscordId: string,
  amount: number,
  resource: "money" | "limit" = "money",
  message?: string
) {
  const result = await transferGift(
    senderDiscordId,
    targetDiscordId,
    amount,
    resource,
    message
  );

  if (!result.success || !result.sender || !result.receiver) {
    return {
      type: 4,
      data: {
        embeds: [
          {
            title: "😿 Gagal Mengirim Kado",
            color: BOT_THEME.COLOR_ROSE,
            description: result.error || "Terjadi kesalahan saat memproses transfer kado.",
          },
        ],
        flags: 64, // Ephemeral
      },
    };
  }

  const resourceLabel =
    result.resource === "limit"
      ? `${result.amount?.toLocaleString("id-ID")} Tiket Limit 🎟️`
      : `${result.amount?.toLocaleString("id-ID")} Money 💰`;

  return {
    type: 4, // ChannelMessageWithSource
    data: {
      content: `<@${targetDiscordId}> Psst! Ada kado manis buat kamu lhoo~ 🌸✨`,
      embeds: [
        {
          title: "🎁 Ada Kiriman Kado Spesial Nih!~ 🎀",
          color: BOT_THEME.COLOR_PINK,
          description:
            `Yaaay! <@${senderDiscordId}> baru saja mengirimkan kado manis untuk <@${targetDiscordId}>! 💕\n\n` +
            `📦 **Isi Kado:** **${resourceLabel}**\n` +
            `💌 **Pesan Manis:**\n> *"${result.message}"*\n\n` +
            `*Kado sudah langsung masuk secara aman ke dompet penerima lhoo! Yuk cek pakai \`/balance\`~* ✨`,
          footer: {
            text: "Ayaa Bot 🌸 • Spread love, care & happiness 💕",
          },
        },
      ],
    },
  };
}
