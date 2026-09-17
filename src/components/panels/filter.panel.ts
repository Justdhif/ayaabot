import { BOT_THEME, ECONOMY, FILTER_PRESETS } from "@/config/constants";
import { User } from "@/db/schema";
import { ActionRowComponent } from "./types";

export function buildFilterPanel(
  user: User,
  imageUrl: string,
  preset: string = FILTER_PRESETS.PINK_GLOW
) {
  const presetLabels: Record<string, string> = {
    [FILTER_PRESETS.PINK_GLOW]: "Soft Pink Glow 🌸 (Aura pink lembut & dreamy)",
    [FILTER_PRESETS.VINTAGE_WARM]: "Vintage Warm ☕ (Nuansa klasik hangat & nostalgic)",
    [FILTER_PRESETS.BW_DREAMY]: "B&W Dreamy 🖤 (Hitam putih kontras elegan)",
    [FILTER_PRESETS.ANIME_POP]: "Anime Pop 🎨 (Warna cerah, vibrant & tajam)",
  };

  const currentLabel = presetLabels[preset] || preset;
  const costMoney = ECONOMY.FILTER_COST_MONEY;

  const embed = {
    title: "🌸 Aesthetic Filter Studio — Panel Pilihan 🎨",
    color: BOT_THEME.COLOR_PURPLE,
    description:
      `Halo **${user.username || "Manis"}**! Pilih nuansa warna aesthetic untuk fotomu~ ✨\n\n` +
      `🎨 **Preset Aktif:** **${currentLabel}**\n` +
      `💰 **Biaya:** **${costMoney} Money**\n` +
      `👛 **Saldo Kamu:** ${user.money.toLocaleString("id-ID")} 💰\n\n` +
      `*Pilih salah satu preset di bawah untuk switch, lalu klik **Terapkan Filter**!*`,
    image: {
      url: imageUrl,
    },
    footer: {
      text: `Ayaa Bot 🌸 • Preset: ${preset}`,
    },
  };

  const components: ActionRowComponent[] = [
    // Row 1: Presets 1 & 2
    {
      type: 1,
      components: [
        {
          type: 2,
          style: preset === FILTER_PRESETS.PINK_GLOW ? 1 : 2,
          label: "🌸 Pink Glow",
          custom_id: `fl_sw:${FILTER_PRESETS.PINK_GLOW}`,
        },
        {
          type: 2,
          style: preset === FILTER_PRESETS.VINTAGE_WARM ? 1 : 2,
          label: "☕ Vintage Warm",
          custom_id: `fl_sw:${FILTER_PRESETS.VINTAGE_WARM}`,
        },
      ],
    },
    // Row 2: Presets 3 & 4
    {
      type: 1,
      components: [
        {
          type: 2,
          style: preset === FILTER_PRESETS.BW_DREAMY ? 1 : 2,
          label: "🖤 B&W Dreamy",
          custom_id: `fl_sw:${FILTER_PRESETS.BW_DREAMY}`,
        },
        {
          type: 2,
          style: preset === FILTER_PRESETS.ANIME_POP ? 1 : 2,
          label: "🎨 Anime Pop",
          custom_id: `fl_sw:${FILTER_PRESETS.ANIME_POP}`,
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
          label: `✨ Terapkan Filter (${costMoney} 💰) ✨`,
          custom_id: `fl_run:${preset}`,
        },
      ],
    },
  ];

  return { embeds: [embed], components };
}
