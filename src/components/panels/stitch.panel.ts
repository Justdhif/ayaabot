import { BOT_THEME, ECONOMY, STITCH_LAYOUTS, STITCH_BORDERS } from "@/config/constants";
import { User } from "@/db/schema";
import { ActionRowComponent } from "./types";

export function buildStitchPanel(
  user: User,
  imageUrls: string[],
  layout: string = STITCH_LAYOUTS.HORIZONTAL,
  border: string = STITCH_BORDERS.NONE
) {
  const costMoney = ECONOMY.STITCH_COST_MONEY;

  const layoutNames: Record<string, string> = {
    [STITCH_LAYOUTS.HORIZONTAL]: "↔️ Berdampingan (Horizontal / Before vs After)",
    [STITCH_LAYOUTS.VERTICAL]: "↕️ Atas-Bawah (Vertikal)",
    [STITCH_LAYOUTS.GRID]: "🔲 Grid 2×2 (Kolase Kotak)",
  };

  const borderNames: Record<string, string> = {
    [STITCH_BORDERS.NONE]: "Tanpa Garis Pembatas (0px)",
    [STITCH_BORDERS.WHITE]: "Garis Putih Bersih (Clean 12px)",
    [STITCH_BORDERS.PINK]: "Garis Pink Pastel Manis 🌸",
  };

  const embed = {
    title: "🎨 Image Merger & Collage Studio — Panel Pengaturan 🎀",
    color: BOT_THEME.COLOR_PURPLE,
    description:
      `Halo **${user.username || "Manis"}**! Satukan **${imageUrls.length} gambar** menjadi satu karya utuh:\n\n` +
      `📐 **Pilihan Layout:** **${layoutNames[layout] || layout}**\n` +
      `🖼️ **Garis Pembatas:** **${borderNames[border] || border}**\n` +
      `💰 **Biaya:** **${costMoney} Money**\n` +
      `👛 **Saldo Kamu:** ${user.money.toLocaleString("id-ID")} 💰\n\n` +
      `*Gunakan tombol di bawah untuk memilih susunan layout, lalu klik **Gabungkan Sekarang**!*`,
    image: {
      url: imageUrls[0],
    },
    fields: [
      {
        name: "🖼️ Sumber Gambar",
        value: imageUrls.map((u, i) => `[Foto ${i + 1}](${u})`).join(" • "),
      },
    ],
    footer: {
      text: `Ayaa Bot 🌸 • Stitch Merger | Images: ${imageUrls.length} | Layout: ${layout} | Border: ${border}`,
    },
  };

  const components: ActionRowComponent[] = [
    // Row 1: Layout choices
    {
      type: 1,
      components: [
        {
          type: 2,
          style: layout === STITCH_LAYOUTS.HORIZONTAL ? 1 : 2,
          label: "↔️ Berdampingan",
          custom_id: `st_layout:${STITCH_LAYOUTS.HORIZONTAL}:${border}`,
        },
        {
          type: 2,
          style: layout === STITCH_LAYOUTS.VERTICAL ? 1 : 2,
          label: "↕️ Atas-Bawah",
          custom_id: `st_layout:${STITCH_LAYOUTS.VERTICAL}:${border}`,
        },
        {
          type: 2,
          style: layout === STITCH_LAYOUTS.GRID ? 1 : 2,
          label: "🔲 Grid 2×2",
          custom_id: `st_layout:${STITCH_LAYOUTS.GRID}:${border}`,
        },
      ],
    },
    // Row 2: Border choices
    {
      type: 1,
      components: [
        {
          type: 2,
          style: border === STITCH_BORDERS.NONE ? 1 : 2,
          label: "Tanpa Garis",
          custom_id: `st_border:${layout}:${STITCH_BORDERS.NONE}`,
        },
        {
          type: 2,
          style: border === STITCH_BORDERS.WHITE ? 1 : 2,
          label: "Garis Putih",
          custom_id: `st_border:${layout}:${STITCH_BORDERS.WHITE}`,
        },
        {
          type: 2,
          style: border === STITCH_BORDERS.PINK ? 1 : 2,
          label: "Garis Pink 🌸",
          custom_id: `st_border:${layout}:${STITCH_BORDERS.PINK}`,
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
          label: `✨ Gabungkan Sekarang (${costMoney} 💰) ✨`,
          custom_id: `st_run:${layout}:${border}`,
        },
      ],
    },
  ];

  return { embeds: [embed], components };
}
