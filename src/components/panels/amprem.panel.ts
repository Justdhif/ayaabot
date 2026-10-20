import { BOT_THEME } from "@/config/constants";
import { User } from "@/db/schema";
import { ActionRowComponent } from "./types";
import { getAmStats } from "@/services/alight-motion.service";

export function buildAmPremInitialPanel(user?: User) {
  const stats = getAmStats();

  const embed = {
    title: "🎬 Aktivasi Alight Motion Pro VIP (1 Tahun) 🌸",
    color: BOT_THEME.COLOR_PINK,
    description:
      `Halo **${user?.username || "Teman Manis"}**! Dapatkan lisensi **Alight Motion Pro VIP 1 Tahun** gratis tanpa watermark & semua fitur/efek terbuka! ✨\n\n` +
      `📌 **Cara Aktivasi (Mudah & Cepat):**\n` +
      `1️⃣ Klik tombol **📧 1. Minta Link** di bawah, lalu masukkan email akun Alight Motion kamu.\n` +
      `2️⃣ Buka aplikasi **Gmail** (cek Inbox atau folder Spam) dari *Alight Motion*.\n` +
      `3️⃣ Tekan lama tombol **"Sign in to Alight Motion"**, lalu pilih **Salin tautan / copy link**.\n` +
      `4️⃣ Klik tombol **🔗 2. Verifikasi Lisensi** di bawah, lalu tempel link verifikasinya.\n\n` +
      `📊 **Statistik Server:**\n` +
      `• Total Lisensi Aktif: **${stats.total} Akun**\n` +
      `• Aktivasi Hari Ini: **${stats.today} Akun**\n` +
      `• Status Layanan: **Online 🟢**`,
    footer: {
      text: "Ayaa Bot 🌸 • Alight Motion Pro Integration",
    },
  };

  const components: ActionRowComponent[] = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 1, // Primary (Blurple)
          label: "📧 1. Minta Link",
          custom_id: "am_btn_request",
          emoji: { name: "✉️" },
        },
        {
          type: 2,
          style: 3, // Success (Green)
          label: "🔗 2. Verifikasi Lisensi",
          custom_id: "am_btn_verify",
          emoji: { name: "✨" },
        },
      ],
    },
  ];

  return { embeds: [embed], components };
}

export function buildAmPremLinkSentPanel(email: string) {
  const embed = {
    title: "✉️ Link Verifikasi Berhasil Dikirim! 🌸",
    color: BOT_THEME.COLOR_PINK,
    description:
      `Tautan magic link telah dikirimkan ke:\n` +
      `📧 **\`${email}\`**\n\n` +
      `📋 **Langkah Selanjutnya:**\n` +
      `1. Buka aplikasi **Gmail / Email** kamu.\n` +
      `2. Cari email masuk dari **Alight Motion** *(cek Inbox atau folder Spam)*.\n` +
      `3. **Tekan & tahan (long press)** pada tombol *"Sign in to Alight Motion"*, lalu pilih **Salin tautan / Copy link address**.\n` +
      `4. Klik tombol **🔗 Verifikasi Lisensi** di bawah ini dan tempel tautan yang sudah kamu salin! 💕\n\n` +
      `⚠️ *Tautan hanya berlaku 15 menit. Jangan klik link di browser HP kamu, cukup salin link-nya saja ya!*`,
    footer: {
      text: `Ayaa Bot 🌸 • Menunggu verifikasi untuk ${email}`,
    },
  };

  const components: ActionRowComponent[] = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 3, // Success (Green)
          label: "🔗 Verifikasi Lisensi Sekarang",
          custom_id: `am_btn_verify:${email}`,
          emoji: { name: "🚀" },
        },
        {
          type: 2,
          style: 2, // Secondary (Gray)
          label: "📧 Kirim Ulang Link",
          custom_id: "am_btn_request",
          emoji: { name: "🔄" },
        },
      ],
    },
  ];

  return { embeds: [embed], components };
}

export function buildAmPremSuccessPanel(userData: any) {
  const embed = {
    title: "🎉 ALIGHT MOTION PRO VIP BERHASIL DIAKTIFKAN! 🎉",
    color: BOT_THEME.COLOR_PINK,
    description:
      `Selamat! Akun Alight Motion kamu sekarang sudah resmi menjadi **Pro VIP**! 🎬✨\n\n` +
      `• **Email Terdaftar:** \`${userData.email}\`\n` +
      `• **Tier:** **${userData.tier}** ⭐\n` +
      `• **Status:** \`${userData.status}\` 🟢\n` +
      `• **Tipe Lisensi:** ${userData.subscription}\n` +
      `• **Masa Aktif:** s/d **${userData.validUntil}** 📅\n` +
      `• **Order ID:** \`${userData.orderId || "AM-VIP-" + Date.now()}\`\n\n` +
      `📱 **Cara Menikmati di HP:**\n` +
      `1. Buka aplikasi **Alight Motion** di smartphone kamu.\n` +
      `2. Masuk / Login menggunakan email **\`${userData.email}\`**.\n` +
      `3. Sekarang akunmu sudah **Bebas Watermark**, semua efek VIP, font, dan preset proyek terbuka penuh! 🎨💖`,
    footer: {
      text: "Ayaa Bot 🌸 • Alight Motion Pro VIP 1 Tahun",
    },
  };

  const components: ActionRowComponent[] = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 3, // Success
          label: "✅ Lisensi Aktif (1 Tahun)",
          custom_id: "am_btn_done",
          disabled: true,
          emoji: { name: "👑" },
        },
        {
          type: 2,
          style: 2, // Secondary
          label: "Aktivasi Akun Lain",
          custom_id: "am_btn_request",
          emoji: { name: "➕" },
        },
      ],
    },
  ];

  return { embeds: [embed], components };
}

export function buildAmPremErrorPanel(errorMessage: string, email?: string) {
  const embed = {
    title: "❌ Terjadi Kendala Aktivasi AM 🥺",
    color: BOT_THEME.COLOR_ROSE,
    description:
      `Maaf yaa manis, proses aktivasi tidak dapat diselesaikan:\n\n` +
      `⚠️ **Penyebab:**\n` +
      `> *${errorMessage}*\n\n` +
      `💡 **Tips Solusi:**\n` +
      `• Pastikan email yang kamu ketik sudah benar.\n` +
      `• Pastikan menyalin **seluruh isi tautan** dari email (jangan terpotong).\n` +
      `• Jika link sudah kedaluwarsa, klik tombol **Kirim Ulang Link** di bawah ini.`,
    footer: {
      text: "Ayaa Bot 🌸 • Hubungi admin jika terus mengalami kendala",
    },
  };

  const components: ActionRowComponent[] = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 1, // Primary
          label: "📧 Kirim Ulang Link",
          custom_id: "am_btn_request",
          emoji: { name: "🔄" },
        },
        {
          type: 2,
          style: 3, // Success
          label: "🔗 Coba Verifikasi Lagi",
          custom_id: email ? `am_btn_verify:${email}` : "am_btn_verify",
          emoji: { name: "✨" },
        },
      ],
    },
  ];

  return { embeds: [embed], components };
}
