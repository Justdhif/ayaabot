import { BOT_THEME, ECONOMY, FILTER_PRESETS, CONVERT_FORMATS, WATERMARK_POSITIONS, WATERMARK_OPACITY } from "../config/constants";
import { User } from "../db/schema";

export interface ButtonComponent {
  type: 2;
  style: 1 | 2 | 3 | 4 | 5; // 1: Primary, 2: Secondary, 3: Success, 4: Danger, 5: Link
  label: string;
  custom_id?: string;
  url?: string;
  disabled?: boolean;
  emoji?: { name: string; id?: string };
}

export interface ActionRowComponent {
  type: 1;
  components: ButtonComponent[];
}

// -------------------------------------------------------------
// 1. HD Interactive Panel
// -------------------------------------------------------------
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
          custom_id: `hd_sw:2:${mode}`,
          emoji: { name: "🔍" },
        },
        {
          type: 2,
          style: scale === 4 ? 1 : 2,
          label: "4× Ultra HD (200 💰 + 2 🎟️)",
          custom_id: `hd_sw:4:${mode}`,
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
          custom_id: `hd_sw:${scale}:sharp`,
          emoji: { name: "🗡️" },
        },
        {
          type: 2,
          style: mode === "soft" ? 1 : 2,
          label: "Soft (Halus & Lembut)",
          custom_id: `hd_sw:${scale}:soft`,
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

// -------------------------------------------------------------
// 2. Filter Interactive Panel
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// 3. Convert Interactive Panel
// -------------------------------------------------------------
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
          label: "100% (Maksimal)",
          custom_id: `cv_sw:${format}:100`,
        },
        {
          type: 2,
          style: quality === 80 ? 1 : 2,
          label: "80% (Seimbang)",
          custom_id: `cv_sw:${format}:80`,
        },
        {
          type: 2,
          style: quality === 60 ? 1 : 2,
          label: "60% (Kompres Hemat)",
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
          style: 3,
          label: `🚀 Mulai Konversi (${costMoney} 💰) 🚀`,
          custom_id: `cv_run:${format}:${quality}`,
        },
      ],
    },
  ];

  return { embeds: [embed], components };
}

// -------------------------------------------------------------
// 4. Watermark Interactive Panel
// -------------------------------------------------------------
export function buildWatermarkPanel(
  user: User,
  imageUrl: string,
  opacity: string = WATERMARK_OPACITY.NORMAL,
  position: string = WATERMARK_POSITIONS.BOTTOM_RIGHT,
  customText?: string
) {
  const costMoney = ECONOMY.WATERMARK_COST_MONEY;
  const activeText = customText || `@${user.username || "Ayaa Bot"}`;

  const posLabels: Record<string, string> = {
    [WATERMARK_POSITIONS.BOTTOM_RIGHT]: "Kanan Bawah ↘️",
    [WATERMARK_POSITIONS.BOTTOM_LEFT]: "Kiri Bawah ↙️",
    [WATERMARK_POSITIONS.CENTER]: "Tengah 🎯",
    [WATERMARK_POSITIONS.TOP_RIGHT]: "Kanan Atas ↗️",
  };

  const opLabels: Record<string, string> = {
    [WATERMARK_OPACITY.SUBTLE]: "Halus Transparan (38%) 👻",
    [WATERMARK_OPACITY.NORMAL]: "Standar (70%) 💧",
    [WATERMARK_OPACITY.SOLID]: "Tegas (100%) 💎",
  };

  const embed = {
    title: "🎨 Tempel Watermark — Panel Pengaturan 🖋️",
    color: BOT_THEME.COLOR_ROSE,
    description:
      `Halo **${user.username || "Manis"}**! Pasang tanda kepemilikan/hak cipta pada karyamu:\n\n` +
      `✍️ **Teks Watermark:** \`${activeText}\`\n` +
      `📍 **Posisi:** **${posLabels[position] || position}**\n` +
      `👁️ **Kepekatan:** **${opLabels[opacity] || opacity}**\n` +
      `💰 **Biaya:** **${costMoney} Money**\n` +
      `👛 **Saldo Kamu:** ${user.money.toLocaleString("id-ID")} 💰\n\n` +
      `*Pilih posisi & kepekatan lewat tombol interaktif di bawah:*`,
    image: {
      url: imageUrl,
    },
    footer: {
      text: `Ayaa Bot 🌸 • Watermark: pos=${position}, op=${opacity} | text=${activeText}`,
    },
  };

  const components: ActionRowComponent[] = [
    // Row 1: Position
    {
      type: 1,
      components: [
        {
          type: 2,
          style: position === WATERMARK_POSITIONS.BOTTOM_RIGHT ? 1 : 2,
          label: "↘️ Kanan Bawah",
          custom_id: `wm_sw:${opacity}:${WATERMARK_POSITIONS.BOTTOM_RIGHT}`,
        },
        {
          type: 2,
          style: position === WATERMARK_POSITIONS.BOTTOM_LEFT ? 1 : 2,
          label: "↙️ Kiri Bawah",
          custom_id: `wm_sw:${opacity}:${WATERMARK_POSITIONS.BOTTOM_LEFT}`,
        },
        {
          type: 2,
          style: position === WATERMARK_POSITIONS.CENTER ? 1 : 2,
          label: "🎯 Tengah",
          custom_id: `wm_sw:${opacity}:${WATERMARK_POSITIONS.CENTER}`,
        },
        {
          type: 2,
          style: position === WATERMARK_POSITIONS.TOP_RIGHT ? 1 : 2,
          label: "↗️ Kanan Atas",
          custom_id: `wm_sw:${opacity}:${WATERMARK_POSITIONS.TOP_RIGHT}`,
        },
      ],
    },
    // Row 2: Opacity
    {
      type: 1,
      components: [
        {
          type: 2,
          style: opacity === WATERMARK_OPACITY.SUBTLE ? 1 : 2,
          label: "👻 Halus (38%)",
          custom_id: `wm_sw:${WATERMARK_OPACITY.SUBTLE}:${position}`,
        },
        {
          type: 2,
          style: opacity === WATERMARK_OPACITY.NORMAL ? 1 : 2,
          label: "💧 Standar (70%)",
          custom_id: `wm_sw:${WATERMARK_OPACITY.NORMAL}:${position}`,
        },
        {
          type: 2,
          style: opacity === WATERMARK_OPACITY.SOLID ? 1 : 2,
          label: "💎 Tegas (100%)",
          custom_id: `wm_sw:${WATERMARK_OPACITY.SOLID}:${position}`,
        },
      ],
    },
    // Row 3: Action Run
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 3,
          label: `🎨 Tempel Watermark Sekarang (${costMoney} 💰) 🎨`,
          custom_id: `wm_run:${opacity}:${position}`,
        },
      ],
    },
  ];

  return { embeds: [embed], components };
}

// -------------------------------------------------------------
// 5. Gift Interactive Panel
// -------------------------------------------------------------
export function buildGiftPanel(
  sender: User,
  targetDiscordId: string,
  targetUsername: string,
  resource: "money" | "limit" = "money",
  amount: number = 100
) {
  const resourceLabel = resource === "limit" ? "Tiket Limit 🎟️" : "Money 💰";
  const userBalance = resource === "limit" ? sender.limitCount : sender.money;
  const isAffordable = userBalance >= amount && amount > 0;

  const embed = {
    title: "🎁 Kirim Kado Spesial — Panel Kontrol 🎀",
    color: BOT_THEME.COLOR_PINK,
    description:
      `Halo **${sender.username || "Manis"}**! Kamu akan mengirim kado untuk <@${targetDiscordId}> (**${targetUsername}**):\n\n` +
      `📦 **Jenis Kado:** **${resource === "limit" ? "🎟️ Tiket Limit HD" : "💰 Uang Money"}**\n` +
      `💎 **Nominal Kado:** **${amount.toLocaleString("id-ID")} ${resourceLabel}**\n` +
      `👛 **Saldo Kamu Saat Ini:** ${sender.money.toLocaleString("id-ID")} 💰 • ${sender.limitCount} 🎟️\n` +
      `${!isAffordable ? "\n⚠️ *Saldo kamu tidak cukup untuk nominal kado ini!*" : ""}\n\n` +
      `*Pilih jenis saldo dan tambah nominal dengan tombol di bawah, lalu klik **🎁 Kirim Kado Sekarang**!*`,
    footer: {
      text: `Ayaa Bot 🌸 • Gift to: ${targetUsername} (${targetDiscordId})`,
    },
  };

  const components: ActionRowComponent[] = [
    // Row 1: Resource Type
    {
      type: 1,
      components: [
        {
          type: 2,
          style: resource === "money" ? 1 : 2,
          label: "💰 Uang Money",
          custom_id: `gf_sw:money:${amount}:${targetDiscordId}`,
        },
        {
          type: 2,
          style: resource === "limit" ? 1 : 2,
          label: "🎟️ Tiket Limit",
          custom_id: `gf_sw:limit:${amount}:${targetDiscordId}`,
        },
      ],
    },
    // Row 2: Quick Amount Adders
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 2,
          label: "+100",
          custom_id: `gf_add:100:${resource}:${amount}:${targetDiscordId}`,
        },
        {
          type: 2,
          style: 2,
          label: "+500",
          custom_id: `gf_add:500:${resource}:${amount}:${targetDiscordId}`,
        },
        {
          type: 2,
          style: 2,
          label: "+1.000",
          custom_id: `gf_add:1000:${resource}:${amount}:${targetDiscordId}`,
        },
        {
          type: 2,
          style: 2,
          label: "+5.000",
          custom_id: `gf_add:5000:${resource}:${amount}:${targetDiscordId}`,
        },
        {
          type: 2,
          style: 4, // Danger Red (Reset)
          label: "🔄 Reset",
          custom_id: `gf_rst:${resource}:${targetDiscordId}`,
        },
      ],
    },
    // Row 3: Action Run
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 3,
          label: `🎁 Kirim ${amount.toLocaleString("id-ID")} ${resourceLabel} 🎁`,
          custom_id: `gf_run:${resource}:${amount}:${targetDiscordId}`,
          disabled: !isAffordable,
        },
      ],
    },
  ];

  return { embeds: [embed], components };
}
