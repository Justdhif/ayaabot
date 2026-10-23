import { BOT_THEME } from "@/config/constants";
import { User } from "@/db/schema";
import { ActionRowComponent, ButtonComponent } from "./types";
import { BypassResult } from "@/services/bypass.service";

/**
 * Panel awal panduan fitur bypass link
 */
export function buildBypassInitialPanel(user?: User) {
  const embed = {
    title: "⚡ Link Bypasser & Direct Downloader 📦🌸",
    color: BOT_THEME.COLOR_PINK,
    description:
      `Halo **${user?.username || "Teman Manis"}**! Mau download script skin ML, config, mod game, atau file lainnya tapi terjebak link penuh iklan & rintangan? 🥺\n\n` +
      `Gunakan fitur ini untuk **melewati shortlink rumit secara otomatis** dan langsung mengambil tautan unduh bersih (direct download link)! ✨\n\n` +
      `📌 **Cara Menggunakan:**\n` +
      `1️⃣ Salin tautan iklan/shortlink yang ingin kamu bypass.\n` +
      `2️⃣ Gunakan perintah **/bypass url:\`<link_kamu>\`**\n` +
      `   *Atau klik tombol **🔓 Masukkan Link Iklan** di bawah untuk membuka form input!*\n\n` +
      `🌐 **Layanan yang Didukung:**\n` +
      `• **Mediafire:** Langsung diekstrak ke link direct CDN \`download*.mediafire.com\` tanpa buka web!\n` +
      `• **Sfile.mobi / Sfile.co:** Melewati halaman tunggu & mengambil file APK/ZIP asli.\n` +
      `• **Google Drive:** Mengubah tautan preview menjadi link unduhan langsung.\n` +
      `• **Sub2Unlock & Sub4Unlock:** Melewati syarat subscribe/follow sosial media secara instan.\n` +
      `• **Pixeldrain, Krakenfiles, TinyURL, Bitly, Cuttly, dll.**`,
    footer: {
      text: "Ayaa Bot 🌸 • Fast & Clean Bypasser Engine",
    },
  };

  const components: ActionRowComponent[] = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 1, // Primary
          label: "🔓 Masukkan Link Iklan",
          custom_id: "bp_btn_open_modal",
          emoji: { name: "⚡" },
        },
      ],
    },
  ];

  return { embeds: [embed], components };
}

/**
 * Panel hasil ketika link berhasil di-bypass
 */
export function buildBypassSuccessPanel(result: BypassResult) {
  // Susun visualisasi rantai bypass (hops)
  const chainDisplay = result.chain
    .map((hop, idx) => {
      let shortUrl = hop.url;
      try {
        const u = new URL(hop.url);
        shortUrl = `${u.hostname}${u.pathname.length > 25 ? u.pathname.slice(0, 25) + "..." : u.pathname}`;
      } catch (_) {
        shortUrl = hop.url.slice(0, 35) + "...";
      }
      return `${idx + 1}️⃣ **${hop.label}:** \`${shortUrl}\``;
    })
    .join("\n");

  const embed = {
    title: "🎉 Link Berhasil Di-Bypass! 📦✨",
    url: result.directDownloadUrl,
    color: BOT_THEME.COLOR_PINK,
    description:
      `Tautan unduhan bersih berhasil diekstrak tanpa harus melewati iklan/rintangan! 💕\n\n` +
      `📦 **Nama File:** **\`${result.filename}\`**\n` +
      (result.filesize ? `📊 **Ukuran File:** \`${result.filesize}\`\n` : "") +
      `📁 **Tipe File:** ${result.filetype || "File Unduhan"}\n` +
      `⏱️ **Waktu Proses:** \`${result.executionTimeMs} ms\`\n\n` +
      `🔗 **Rantai Bypass (${result.chain.length} Tahap):**\n` +
      `${chainDisplay}\n\n` +
      `*Klik tombol hijau di bawah untuk mengunduh file langsung ke HP/PC kamu:* 👇`,
    footer: {
      text: "Ayaa Bot 🌸 • Direct Download Link Ready",
    },
  };

  const components: ActionRowComponent[] = [];
  const actionButtons: ButtonComponent[] = [];

  // Tombol 1: Unduh Langsung
  if (result.directDownloadUrl && (result.directDownloadUrl.startsWith("http://") || result.directDownloadUrl.startsWith("https://"))) {
    actionButtons.push({
      type: 2,
      style: 5, // Link
      label: "📥 Download File Langsung",
      url: result.directDownloadUrl,
      emoji: { name: "🚀" },
    });
  }

  // Tombol 2: Buka Halaman File Asli (jika berbeda dari CDN langsung)
  if (
    result.destinationUrl &&
    result.destinationUrl !== result.directDownloadUrl &&
    (result.destinationUrl.startsWith("http://") || result.destinationUrl.startsWith("https://"))
  ) {
    actionButtons.push({
      type: 2,
      style: 5, // Link
      label: "🌐 Buka Halaman Asli",
      url: result.destinationUrl,
      emoji: { name: "🔗" },
    });
  }

  if (actionButtons.length > 0) {
    components.push({
      type: 1,
      components: actionButtons,
    });
  }

  // Row 2: Tombol Bypass Lagi
  components.push({
    type: 1,
    components: [
      {
        type: 2,
        style: 1, // Primary
        label: "🔓 Bypass Link Lain",
        custom_id: "bp_btn_open_modal",
        emoji: { name: "✨" },
      },
    ],
  });

  return { embeds: [embed], components };
}

/**
 * Panel jika bypass mengalami kendala
 */
export function buildBypassErrorPanel(errorMessage: string, inputUrl?: string) {
  const embed = {
    title: "❌ Gagal Melewati Link 🥺",
    color: BOT_THEME.COLOR_ROSE,
    description:
      `Maaf yaa manis, bot tidak dapat menemukan link unduhan langsung dari tautan ini:\n\n` +
      `⚠️ **Penyebab:**\n` +
      `> *${errorMessage}*\n\n` +
      (inputUrl ? `🔗 **Link Input:** \`${inputUrl.slice(0, 80)}\`\n\n` : "") +
      `💡 **Tips Solusi:**\n` +
      `• Pastikan link diawali dengan \`https://\` atau \`http://\` secara lengkap.\n` +
      `• Pastikan link masih aktif / file belum dihapus oleh pemiliknya.\n` +
      `• Jika link dilindungi captcha Cloudflare yang sangat ketat, coba salin link tujuan setelah melewati captcha pertama.`,
    footer: {
      text: "Ayaa Bot 🌸 • Link Bypasser Support",
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
          custom_id: "bp_btn_open_modal",
          emoji: { name: "⚡" },
        },
      ],
    },
  ];

  return { embeds: [embed], components };
}
