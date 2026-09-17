import { BOT_THEME, ECONOMY, CONVERT_FORMATS } from "@/config/constants";
import { User } from "@/db/schema";
import { ActionRowComponent } from "./types";

export function buildConvertPanel(
  user: User,
  imageUrl: string,
  format: string = CONVERT_FORMATS.WEBP,
  quality: number = 80
) {
  const costMoney = ECONOMY.CONVERT_COST_MONEY;

  const embed = {
    title: "📦 Konversi & Kompresi Foto — Panel Pengaturan 🖼️",
    color: BOT_THEME.COLOR_SKY,
    description:
      `Halo **${user.username || "Manis"}**! Mau ubah format atau kompres foto? Atur opsi di bawah yaa:\n\n` +
      `📁 **Target Format:** **${format.toUpperCase()}**\n` +
      `📊 **Kualitas Kompresi:** **${quality}%**\n` +
      `💰 **Biaya:** **${costMoney} Money**\n` +
      `👛 **Saldo Kamu:** ${user.money.toLocaleString("id-ID")} 💰\n\n` +
      `*Switch format dan kualitas dengan tombol di bawah, lalu klik **Mulai Konversi**!*`,
    image: {
      url: imageUrl,
    },
    footer: {
      text: `Ayaa Bot 🌸 • Convert: ${format} @ ${quality}%`,
    },
  };

  const components: ActionRowComponent[] = [
    // Row 1: Format choices
    {
      type: 1,
      components: [
        {
          type: 2,
          style: format === "webp" ? 1 : 2,
          label: "WebP (Modern & Ringan)",
          custom_id: `cv_sw:webp:${quality}`,
          emoji: { name: "📦" },
        },
        {
          type: 2,
          style: format === "png" ? 1 : 2,
          label: "PNG (Lossless & Jernih)",
          custom_id: `cv_sw:png:${quality}`,
          emoji: { name: "🖼️" },
        },
        {
          type: 2,
          style: format === "jpg" ? 1 : 2,
          label: "JPG (Standar Universal)",
          custom_id: `cv_sw:jpg:${quality}`,
          emoji: { name: "📷" },
        },
      ],
    },
    // Row 2: Quality choices
    {
      type: 1,
      components: [
        {
          type: 2,
          style: quality === 100 ? 1 : 2,
          label: "Maksimal (100%)",
          custom_id: `cv_sw:${format}:100`,
        },
        {
          type: 2,
          style: quality === 80 ? 1 : 2,
          label: "Standar (80%)",
          custom_id: `cv_sw:${format}:80`,
        },
        {
          type: 2,
          style: quality === 60 ? 1 : 2,
          label: "Hemat (60%)",
          custom_id: `cv_sw:${format}:60`,
        },
      ],
    },
    // Row 3: Action Run
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 3, // Success Green
          label: `✨ Mulai Konversi (${costMoney} 💰) ✨`,
          custom_id: `cv_run:${format}:${quality}`,
        },
      ],
    },
  ];

  return { embeds: [embed], components };
}
