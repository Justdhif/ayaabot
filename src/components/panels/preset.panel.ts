import { BOT_THEME } from "@/config/constants";
import { User } from "@/db/schema";
import { ActionRowComponent, ButtonComponent } from "./types";
import { FindPresetResult } from "@/services/alight-motion.service";

/**
 * Panel awal panduan pencarian preset
 */
export function buildPresetInitialPanel(user?: User) {
  const embed = {
    title: "🔍 Cari Preset Alight Motion dari TikTok 🎬🌸",
    color: BOT_THEME.COLOR_PINK,
    description:
      `Halo **${user?.username || "Teman Manis"}**! Kamu bisa mencari dan mengekstrak tautan **Preset Alight Motion** secara otomatis langsung dari video TikTok! ✨\n\n` +
      `📌 **Cara Menggunakan:**\n` +
      `1️⃣ Salin tautan (link) video TikTok yang membagikan preset AM.\n` +
      `2️⃣ Gunakan perintah **/ampreset url:\`<link_tiktok>\`**\n` +
      `   *Atau klik tombol **🔍 Masukkan Link TikTok** di bawah ini untuk membuka formulir input!*\n\n` +
      `✨ Bot akan memindai **deskripsi/caption** dan **seluruh komentar** (termasuk komentar disematkan & komentar kreator) untuk menemukan link \`alight.link\`, \`alightcreative.com\`, Google Drive, Mediafire, dan lainnya! 💕`,
    footer: {
      text: "Ayaa Bot 🌸 • Powered by Justdhif API",
    },
  };

  const components: ActionRowComponent[] = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 1, // Primary
          label: "🔍 Masukkan Link TikTok",
          custom_id: "am_btn_find_preset_modal",
          emoji: { name: "📱" },
        },
      ],
    },
  ];

  return { embeds: [embed], components };
}

function getPresetTypeBadge(type: string): string {
  switch (type) {
    case "alight_link":
    case "alight_creative":
      return "⚡ Alight Motion";
    case "google_drive":
      return "📁 Google Drive";
    case "mediafire":
      return "📦 Mediafire";
    case "sfile":
      return "📄 Sfile";
    default:
      return "🔗 Link";
  }
}

/**
 * Panel hasil ketika preset berhasil ditemukan
 */
export function buildPresetResultPanel(data: FindPresetResult, originalUrl: string) {
  const authorName = data.video.author.nickname
    ? `${data.video.author.nickname} (@${data.video.author.username})`
    : `@${data.video.author.username}`;

  const likes = data.video.stats?.likes?.toLocaleString("id-ID") || "0";
  const comments = data.video.stats?.comments?.toLocaleString("id-ID") || "0";
  const views = data.video.stats?.views?.toLocaleString("id-ID") || "0";

  const truncatedTitle = data.video.title
    ? data.video.title.length > 150
      ? `${data.video.title.slice(0, 150)}...`
      : data.video.title
    : "Tanpa deskripsi";

  // Batasi maksimal 10 preset di fields embed
  const displayPresets = data.presets.slice(0, 10);

  const fields = displayPresets.map((preset, idx) => {
    const typeBadge = getPresetTypeBadge(preset.type);
    const sourceBadge = preset.isCreator
      ? "👑 [Kreator]"
      : preset.source === "caption"
      ? "📝 [Deskripsi]"
      : `💬 [@${preset.author || "User"}]`;

    const contextSnippet = preset.context
      ? `\n> *"${preset.context.slice(0, 120)}"*`
      : "";

    return {
      name: `${typeBadge} Preset #${idx + 1} ${sourceBadge}`,
      value: `[👉 **Buka / Import Preset**](${preset.url})\n\`${preset.url}\`${contextSnippet}`,
      inline: false,
    };
  });

  const embed = {
    title: `🎬 Ditemukan ${data.totalPresetsFound} Preset Alight Motion! ✨`,
    url: data.video.url || originalUrl,
    color: BOT_THEME.COLOR_PINK,
    author: {
      name: authorName,
      icon_url: data.video.author.avatar,
      url: `https://www.tiktok.com/@${data.video.author.username}`,
    },
    thumbnail: data.video.cover ? { url: data.video.cover } : undefined,
    description:
      `📌 **Video:** ${truncatedTitle}\n` +
      `📊 **Statistik:** ❤️ \`${likes}\` • 💬 \`${comments}\` • 👁️ \`${views}\`\n` +
      `🔍 **Pemindaian:** Memeriksa **${data.totalCommentsScanned} komentar** video\n\n` +
      `*Silakan klik tombol link di bawah untuk mengimpor preset langsung ke Alight Motion:* 💕`,
    fields,
    footer: {
      text: "Ayaa Bot 🌸 • Preset Finder via Justdhif API",
    },
  };

  const components: ActionRowComponent[] = [];

  // Row 1: Direct Link Buttons (Maks 4 preset teratas + tombol tonton video TikTok)
  const linkButtons: ButtonComponent[] = [];

  for (let i = 0; i < Math.min(3, data.presets.length); i++) {
    const p = data.presets[i];
    // Pastikan URL valid
    if (p.url && (p.url.startsWith("http://") || p.url.startsWith("https://"))) {
      linkButtons.push({
        type: 2,
        style: 5, // Link button
        label: `Import Preset #${i + 1}`,
        url: p.url,
        emoji: { name: "⚡" },
      });
    }
  }

  const tiktokWatchUrl = data.video.url || originalUrl;
  if (tiktokWatchUrl && (tiktokWatchUrl.startsWith("http://") || tiktokWatchUrl.startsWith("https://"))) {
    linkButtons.push({
      type: 2,
      style: 5, // Link button
      label: "Tonton TikTok",
      url: tiktokWatchUrl,
      emoji: { name: "📱" },
    });
  }

  if (linkButtons.length > 0) {
    components.push({
      type: 1,
      components: linkButtons,
    });
  }

  // Row 2: Tombol Cari Lagi
  components.push({
    type: 1,
    components: [
      {
        type: 2,
        style: 1, // Primary
        label: "🔍 Cari Preset Lain",
        custom_id: "am_btn_find_preset_modal",
        emoji: { name: "✨" },
      },
    ],
  });

  return { embeds: [embed], components };
}

/**
 * Panel jika video berhasil dipindai tapi tidak ada link preset
 */
export function buildPresetNotFoundPanel(data: FindPresetResult, originalUrl: string) {
  const authorName = data.video.author.nickname
    ? `${data.video.author.nickname} (@${data.video.author.username})`
    : `@${data.video.author.username}`;

  const embed = {
    title: "⚠️ Tidak Ditemukan Preset Alight Motion 🥺",
    url: data.video.url || originalUrl,
    color: BOT_THEME.COLOR_ROSE,
    author: {
      name: authorName,
      icon_url: data.video.author.avatar,
      url: `https://www.tiktok.com/@${data.video.author.username}`,
    },
    thumbnail: data.video.cover ? { url: data.video.cover } : undefined,
    description:
      `Video milik **${authorName}** berhasil dipindai dan bot telah memeriksa **${data.totalCommentsScanned} komentar**.\n\n` +
      `❌ **Hasil:** Tidak ditemukan tautan preset Alight Motion (\`alight.link\`, Google Drive, Mediafire, dll) di caption maupun komentar video ini.\n\n` +
      `💡 **Tips:**\n` +
      `• Pastikan kreator video memang menyertakan link preset di kolom komentar atau deskripsi.\n` +
      `• Jika preset berada di bio/linktree kreator, silakan buka profil TikTok kreator secara langsung.`,
    footer: {
      text: "Ayaa Bot 🌸 • Preset Finder via Justdhif API",
    },
  };

  const components: ActionRowComponent[] = [];
  const buttons: ButtonComponent[] = [];

  const tiktokWatchUrl = data.video.url || originalUrl;
  if (tiktokWatchUrl && (tiktokWatchUrl.startsWith("http://") || tiktokWatchUrl.startsWith("https://"))) {
    buttons.push({
      type: 2,
      style: 5,
      label: "Buka Video TikTok",
      url: tiktokWatchUrl,
      emoji: { name: "📱" },
    });
  }

  buttons.push({
    type: 2,
    style: 1,
    label: "🔍 Coba Link Lain",
    custom_id: "am_btn_find_preset_modal",
    emoji: { name: "✨" },
  });

  components.push({
    type: 1,
    components: buttons,
  });

  return { embeds: [embed], components };
}

/**
 * Panel jika terjadi error saat memanggil API
 */
export function buildPresetErrorPanel(errorMessage: string) {
  const embed = {
    title: "❌ Gagal Mencari Preset TikTok 🥺",
    color: BOT_THEME.COLOR_ROSE,
    description:
      `Terjadi kendala saat memproses video TikTok:\n\n` +
      `⚠️ **Penyebab:**\n` +
      `> *${errorMessage}*\n\n` +
      `💡 **Tips Solusi:**\n` +
      `• Pastikan URL TikTok valid dan dapat dibuka.\n` +
      `• Contoh URL yang didukung:\n` +
      `  - \`https://vt.tiktok.com/xxxx/\`\n` +
      `  - \`https://www.tiktok.com/@username/video/xxxx\`\n` +
      `• Pastikan video tersebut tidak bersifat private atau sudah dihapus.`,
    footer: {
      text: "Ayaa Bot 🌸 • Preset Finder via Justdhif API",
    },
  };

  const components: ActionRowComponent[] = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 1, // Primary
          label: "🔄 Coba Lagi",
          custom_id: "am_btn_find_preset_modal",
          emoji: { name: "🔍" },
        },
      ],
    },
  ];

  return { embeds: [embed], components };
}
