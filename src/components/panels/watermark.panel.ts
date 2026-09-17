import {
  BOT_THEME,
  ECONOMY,
  WATERMARK_POSITIONS,
  WATERMARK_OPACITY,
} from "@/config/constants";
import { User } from "@/db/schema";
import { ActionRowComponent } from "./types";

export function buildWatermarkPanel(
  user: User,
  imageUrl: string,
  opacity: string = WATERMARK_OPACITY.NORMAL,
  position: string = WATERMARK_POSITIONS.BOTTOM_RIGHT,
  customText: string = `@${user.username || "Ayaa Bot"}`
) {
  const costMoney = ECONOMY.WATERMARK_COST_MONEY;

  const posLabels: Record<string, string> = {
    [WATERMARK_POSITIONS.BOTTOM_RIGHT]: "Pojok Kanan Bawah ↘️",
    [WATERMARK_POSITIONS.BOTTOM_LEFT]: "Pojok Kiri Bawah ↙️",
    [WATERMARK_POSITIONS.CENTER]: "Tengah Gambar 🎯",
    [WATERMARK_POSITIONS.TOP_RIGHT]: "Pojok Kanan Atas ↗️",
  };

  const opLabels: Record<string, string> = {
    [WATERMARK_OPACITY.SUBTLE]: "Tipis Lembut (40%) 🌫️",
    [WATERMARK_OPACITY.NORMAL]: "Standar Manis (70%) 🌸",
    [WATERMARK_OPACITY.SOLID]: "Jelas Tegas (100%) 💎",
  };

  const embed = {
    title: "🎨 Watermark Studio — Panel Pengaturan 🌸",
    color: BOT_THEME.COLOR_ROSE,
    description:
      `Halo **${user.username || "Manis"}**! Atur posisi & kepekatan watermark fotomu:\n\n` +
      `✍️ **Teks Watermark:** \`${customText}\`\n` +
      `📍 **Posisi:** **${posLabels[position] || position}**\n` +
      `✨ **Kepekatan:** **${opLabels[opacity] || opacity}**\n` +
      `💰 **Biaya:** **${costMoney} Money**\n` +
      `👛 **Saldo Kamu:** ${user.money.toLocaleString("id-ID")} 💰\n\n` +
      `*Gunakan tombol di bawah untuk switch posisi & kepekatan, lalu klik **Terapkan Watermark**!*`,
    image: {
      url: imageUrl,
    },
    footer: {
      text: `Ayaa Bot 🌸 • Pos: ${position} | Opacity: ${opacity} | text=${customText}`,
    },
  };

  const components: ActionRowComponent[] = [
    // Row 1: Position Choices
    {
      type: 1,
      components: [
        {
          type: 2,
          style: position === WATERMARK_POSITIONS.BOTTOM_RIGHT ? 1 : 2,
          label: "Kanan Bawah ↘️",
          custom_id: `wm_pos:${opacity}:${WATERMARK_POSITIONS.BOTTOM_RIGHT}`,
        },
        {
          type: 2,
          style: position === WATERMARK_POSITIONS.BOTTOM_LEFT ? 1 : 2,
          label: "Kiri Bawah ↙️",
          custom_id: `wm_pos:${opacity}:${WATERMARK_POSITIONS.BOTTOM_LEFT}`,
        },
        {
          type: 2,
          style: position === WATERMARK_POSITIONS.CENTER ? 1 : 2,
          label: "Tengah 🎯",
          custom_id: `wm_pos:${opacity}:${WATERMARK_POSITIONS.CENTER}`,
        },
        {
          type: 2,
          style: position === WATERMARK_POSITIONS.TOP_RIGHT ? 1 : 2,
          label: "Kanan Atas ↗️",
          custom_id: `wm_pos:${opacity}:${WATERMARK_POSITIONS.TOP_RIGHT}`,
        },
      ],
    },
    // Row 2: Opacity Choices
    {
      type: 1,
      components: [
        {
          type: 2,
          style: opacity === WATERMARK_OPACITY.SUBTLE ? 1 : 2,
          label: "Tipis (40%) 🌫️",
          custom_id: `wm_op:${WATERMARK_OPACITY.SUBTLE}:${position}`,
        },
        {
          type: 2,
          style: opacity === WATERMARK_OPACITY.NORMAL ? 1 : 2,
          label: "Normal (70%) 🌸",
          custom_id: `wm_op:${WATERMARK_OPACITY.NORMAL}:${position}`,
        },
        {
          type: 2,
          style: opacity === WATERMARK_OPACITY.SOLID ? 1 : 2,
          label: "Tegas (100%) 💎",
          custom_id: `wm_op:${WATERMARK_OPACITY.SOLID}:${position}`,
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
          label: `✨ Terapkan Watermark (${costMoney} 💰) ✨`,
          custom_id: `wm_run:${opacity}:${position}`,
        },
      ],
    },
  ];

  return { embeds: [embed], components };
}
