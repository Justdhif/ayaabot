import { BOT_THEME, ECONOMY } from "@/config/constants";
import { User } from "@/db/schema";
import { ActionRowComponent } from "./types";

export function buildHdPanel(
  user: User,
  imageUrl: string,
  scale: number = 2,
  mode: "sharp" | "soft" = "sharp"
) {
  const costMoney = scale === 4 ? ECONOMY.HD_COST_MONEY_4X : ECONOMY.HD_COST_MONEY_2X;
  const costLimit = scale === 4 ? ECONOMY.HD_COST_LIMIT_4X : ECONOMY.HD_COST_LIMIT_2X;

  const embed = {
    title: "✨ Sulap Foto Menjadi HD — Panel Kontrol 🌸",
    color: BOT_THEME.COLOR_PINK,
    description:
      `Halo **${user.username || "Manis"}**! Atur opsi sulap fotomu lewat tombol interaktif di bawah yaa~ 💕\n\n` +
      `🔍 **Pilihan Skala:** **${scale}×** (${scale === 4 ? "Ultra HD 4K" : "Standar 2K"})\n` +
      `🎨 **Karakter Mode:** **${mode === "sharp" ? "Sharp (Detail & Tajam)" : "Soft (Halus & Lembut)"}**\n` +
      `💰 **Biaya:** **${costMoney.toLocaleString("id-ID")} Money** + **${costLimit} Tiket Limit**\n` +
      `👛 **Isi Dompet Kamu:** ${user.money.toLocaleString("id-ID")} 💰 • ${user.limitCount} 🎟️\n\n` +
      `*Klik tombol opsi untuk switch setting, lalu klik **✨ Sulap Sekarang ✨**!*`,
    image: {
      url: imageUrl,
    },
    footer: {
      text: `Ayaa Bot 🌸 • HD Upscaler Panel | Scale: ${scale}x | Mode: ${mode}`,
    },
  };

  const components: ActionRowComponent[] = [
    // Row 1: Scale selection
    {
      type: 1,
      components: [
        {
          type: 2,
          style: scale === 2 ? 1 : 2,
          label: "2× Standar (100 💰 + 1 🎟️)",
          custom_id: `hd_scale:2:${mode}`,
          emoji: { name: "🔍" },
        },
        {
          type: 2,
          style: scale === 4 ? 1 : 2,
          label: "4× Ultra HD (200 💰 + 2 🎟️)",
          custom_id: `hd_scale:4:${mode}`,
          emoji: { name: "💎" },
        },
      ],
    },
    // Row 2: Mode selection
    {
      type: 1,
      components: [
        {
          type: 2,
          style: mode === "sharp" ? 1 : 2,
          label: "Sharp (Detail & Tajam)",
          custom_id: `hd_mode:${scale}:sharp`,
          emoji: { name: "🗡️" },
        },
        {
          type: 2,
          style: mode === "soft" ? 1 : 2,
          label: "Soft (Halus & Lembut)",
          custom_id: `hd_mode:${scale}:soft`,
          emoji: { name: "🌸" },
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
          label: `✨ Sulap Sekarang (${costMoney} 💰 + ${costLimit} 🎟️) ✨`,
          custom_id: `hd_run:${scale}:${mode}`,
        },
      ],
    },
  ];

  return { embeds: [embed], components };
}
