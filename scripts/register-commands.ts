import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const commands = [
  {
    name: "claim",
    description: "Ambil uang jajan harian kamu (+1.000 Money & +5 Limit) 🌸",
  },
  {
    name: "balance",
    description: "Cek isi dompet & sisa tiket limit kamu 🎀",
  },
  {
    name: "hd",
    description: "Sulap foto jadi 2x / 4x lebih jernih & tajam ✨",
    options: [
      {
        name: "image",
        description: "Foto yang mau disulap (PNG, JPG, JPEG, WEBP, maks 10 MB)",
        type: 11, // ATTACHMENT
        required: true,
      },
      {
        name: "scale",
        description: "Pilihan skala pembesaran (Default: 2x)",
        type: 4, // INTEGER
        required: false,
        choices: [
          { name: "2x (Standar — 100 💰 + 1 🎟️)", value: 2 },
          { name: "4x (Ultra HD — 200 💰 + 2 🎟️)", value: 4 },
        ],
      },
      {
        name: "mode",
        description: "Karakter hasil sulap foto (Default: Sharp)",
        type: 3, // STRING
        required: false,
        choices: [
          { name: "Sharp (Detail & Tajam)", value: "sharp" },
          { name: "Soft (Halus & Mulus)", value: "soft" },
        ],
      },
    ],
  },
  {
    name: "filter",
    description: "Beri filter warna manis & aesthetic pada fotomu (50 💰) 🌸",
    options: [
      {
        name: "image",
        description: "Foto yang mau diberi filter (maks 10 MB)",
        type: 11, // ATTACHMENT
        required: true,
      },
      {
        name: "preset",
        description: "Pilihan preset filter estetik",
        type: 3, // STRING
        required: true,
        choices: [
          { name: "Soft Pink Glow 🌸 (Aura pink lembut & dreamy)", value: "pink_glow" },
          { name: "Vintage Warm ☕ (Nuansa klasik hangat & nostalgic)", value: "vintage_warm" },
          { name: "B&W Dreamy 🖤 (Hitam putih kontras elegan)", value: "bw_dreamy" },
          { name: "Anime Pop 🎨 (Warna cerah, vibrant & tajam)", value: "anime_pop" },
        ],
      },
    ],
  },
  {
    name: "convert",
    description: "Ubah format foto & kompres ukuran file (25 💰) 📦",
    options: [
      {
        name: "image",
        description: "Foto yang mau diubah format atau dikompres (maks 10 MB)",
        type: 11, // ATTACHMENT
        required: true,
      },
      {
        name: "format",
        description: "Target format file gambar",
        type: 3, // STRING
        required: true,
        choices: [
          { name: "WebP (Ultra Efisien & Modern)", value: "webp" },
          { name: "PNG (Lossless & Transparan)", value: "png" },
          { name: "JPG / JPEG (Standar Ringan)", value: "jpg" },
        ],
      },
      {
        name: "quality",
        description: "Kualitas kompresi gambar (Default: 80%)",
        type: 4, // INTEGER
        required: false,
        choices: [
          { name: "100% (Kualitas Penuh / Maksimal)", value: 100 },
          { name: "80% (Seimbang — Rekomendasi)", value: 80 },
          { name: "60% (Kompresi Ekstra Hemat)", value: 60 },
        ],
      },
    ],
  },
  {
    name: "gift",
    description: "Kirim kado koin atau tiket ke teman spesialmu dengan ucapan manis 🎁",
    options: [
      {
        name: "user",
        description: "Teman yang ingin kamu beri kado manis",
        type: 6, // USER
        required: true,
      },
      {
        name: "amount",
        description: "Jumlah koin atau tiket yang ingin dikirim (minimal 1)",
        type: 4, // INTEGER
        required: true,
      },
      {
        name: "resource",
        description: "Jenis kado yang ingin kamu kirim (Default: Money)",
        type: 3, // STRING
        required: false,
        choices: [
          { name: "Money (Uang Jajan 💰)", value: "money" },
          { name: "Limit (Tiket HD 🎟️)", value: "limit" },
        ],
      },
      {
        name: "message",
        description: "Pesan atau ucapan manis spesial (opsional)",
        type: 3, // STRING
        required: false,
      },
    ],
  },
  {
    name: "help",
    description: "Tampilkan menu panduan imut Ayaa Bot~ 🐾",
  },
];

async function main() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token || !clientId) {
    console.error("❌ DISCORD_TOKEN and DISCORD_CLIENT_ID must be set in .env.local");
    process.exit(1);
  }

  const url = guildId
    ? `https://discord.com/api/v10/applications/${clientId}/guilds/${guildId}/commands`
    : `https://discord.com/api/v10/applications/${clientId}/commands`;

  console.log(`📡 Registering ${commands.length} slash commands to ${guildId ? `Guild (${guildId})` : "Global"}...`);

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commands),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Failed to register commands: ${response.status} ${errorText}`);
    process.exit(1);
  }

  const result = await response.json();
  console.log(`✅ Successfully updated ${result.length} commands with cute descriptions:`);
  for (const cmd of result) {
    console.log(`   - /${cmd.name} (id: ${cmd.id})`);
  }
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  process.exit(1);
});
