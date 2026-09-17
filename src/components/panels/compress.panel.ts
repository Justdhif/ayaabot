import { BOT_THEME, ECONOMY, COMPRESS_MODES } from "@/config/constants";
import { User } from "@/db/schema";
import { ActionRowComponent } from "./types";

export function buildCompressPanel(
  user: User,
  imageUrl: string,
  mode: string = COMPRESS_MODES.AUTO_8MB,
  format: string = "webp"
) {
  const costMoney = ECONOMY.COMPRESS_COST_MONEY;

  const modeDescriptions: Record<string, string> = {
    [COMPRESS_MODES.AUTO_8MB]: "⚡ **Auto Fit Discord Non-Nitro** (< 8 MB, aman dikirim di Discord)",
    [COMPRESS_MODES.LIGHT]: "📦 **Ringan** (80% Quality, sedikit kompresi, visual tajam)",
    [COMPRESS_MODES.BALANCED]: "💨 **Sedang** (65% Quality, ukuran ramping & seimbang)",
    [COMPRESS_MODES.EXTREME]: "🗜️ **Ekstrem** (45% Quality, ukuran file sekecil mungkin)",
  };

  const currentDesc = modeDescriptions[mode] || mode;

  const embed = {
    title: "🗜️ Image Optimizer & Web Compression — Panel Pengaturan 🌸",
    color: BOT_THEME.COLOR_SKY,
    description:
      `Halo **${user.username || "Manis"}**! Mau kecilkan ukuran gambar agar muat dikirim di Discord non-Nitro? Atur opsinya di bawah yaa:\n\n` +
      `🎯 **Mode Kompresi:** ${currentDesc}\n` +
      `📁 **Target Format:** **${format.toUpperCase()}**\n` +
      `💰 **Biaya:** **${costMoney} Money**\n` +
      `👛 **Saldo Kamu:** ${user.money.toLocaleString("id-ID")} 💰\n\n` +
      `*Gunakan tombol di bawah untuk switch mode & format, lalu klik **Kompres Sekarang**!*`,
    image: {
      url: imageUrl,
    },
    footer: {
      text: `Ayaa Bot 🌸 • Mode: ${mode} | Format: ${format}`,
    },
  };

  const components: ActionRowComponent[] = [
    // Row 1: Compression Modes
    {
      type: 1,
      components: [
        {
          type: 2,
          style: mode === COMPRESS_MODES.AUTO_8MB ? 1 : 2,
          label: "⚡ Fit < 8MB (Non-Nitro)",
          custom_id: `cp_mode:${COMPRESS_MODES.AUTO_8MB}:${format}`,
        },
        {
          type: 2,
          style: mode === COMPRESS_MODES.LIGHT ? 1 : 2,
          label: "📦 Ringan (80%)",
          custom_id: `cp_mode:${COMPRESS_MODES.LIGHT}:${format}`,
        },
        {
          type: 2,
          style: mode === COMPRESS_MODES.BALANCED ? 1 : 2,
          label: "💨 Sedang (65%)",
          custom_id: `cp_mode:${COMPRESS_MODES.BALANCED}:${format}`,
        },
        {
          type: 2,
          style: mode === COMPRESS_MODES.EXTREME ? 1 : 2,
          label: "🗜️ Ekstrem (45%)",
          custom_id: `cp_mode:${COMPRESS_MODES.EXTREME}:${format}`,
        },
      ],
    },
    // Row 2: Target Format
    {
      type: 1,
      components: [
        {
          type: 2,
          style: format === "webp" ? 1 : 2,
          label: "WebP (Paling Hemat)",
          custom_id: `cp_fmt:${mode}:webp`,
          emoji: { name: "📦" },
        },
        {
          type: 2,
          style: format === "jpg" ? 1 : 2,
          label: "JPG / MozJPEG",
          custom_id: `cp_fmt:${mode}:jpg`,
          emoji: { name: "📷" },
        },
        {
          type: 2,
          style: format === "png" ? 1 : 2,
          label: "PNG (Indexed Palette)",
          custom_id: `cp_fmt:${mode}:png`,
          emoji: { name: "🖼️" },
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
          label: `✨ Kompres Sekarang (${costMoney} 💰) ✨`,
          custom_id: `cp_run:${mode}:${format}`,
        },
      ],
    },
  ];

  return { embeds: [embed], components };
}
