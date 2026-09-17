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
    description: "Sulap foto jadi 2x / 4x HD jernih via tombol interaktif ✨",
    options: [
      {
        name: "image",
        description: "Foto yang mau disulap (PNG, JPG, JPEG, WEBP, maks 10 MB)",
        type: 11, // ATTACHMENT
        required: true,
      },
    ],
  },
  {
    name: "filter",
    description: "Beri filter aesthetic manis pada fotomu via tombol interaktif (50 💰) 🌸",
    options: [
      {
        name: "image",
        description: "Foto yang mau diberi filter (maks 10 MB)",
        type: 11, // ATTACHMENT
        required: true,
      },
    ],
  },
  {
    name: "convert",
    description: "Ubah format & kompres foto via tombol interaktif (25 💰) 📦",
    options: [
      {
        name: "image",
        description: "Foto yang mau diubah format atau dikompres (maks 10 MB)",
        type: 11, // ATTACHMENT
        required: true,
      },
    ],
  },
  {
    name: "gift",
    description: "Kirim kado koin/tiket ke teman via panel tombol interaktif 🎁",
    options: [
      {
        name: "user",
        description: "Teman yang ingin kamu beri kado manis",
        type: 6, // USER
        required: true,
      },
      {
        name: "amount",
        description: "Jumlah koin/tiket awal (opsional, bisa diatur lewat tombol)",
        type: 4, // INTEGER
        required: false,
      },
    ],
  },
  {
    name: "watermark",
    description: "Tempel watermark tanda kepemilikan/hak cipta via tombol interaktif (25 💰) 🎨",
    options: [
      {
        name: "image",
        description: "Foto yang mau diberi watermark (maks 10 MB)",
        type: 11, // ATTACHMENT
        required: true,
      },
      {
        name: "text",
        description: "Teks tulisan watermark (misal: @nama_kamu)",
        type: 3, // STRING
        required: false,
      },
    ],
  },
  {
    name: "Watermark Foto",
    type: 3, // MESSAGE context menu command (Klik kanan foto -> Apps -> Watermark Foto)
  },
  {
    name: "avatar",
    description: "Lihat & unduh foto profil user atau ikon server dalam kualitas 4096px HD 🖼️",
    options: [
      {
        name: "user",
        description: "User yang ingin dilihat foto profilnya (Default: Diri sendiri)",
        type: 6, // USER
        required: false,
      },
      {
        name: "server",
        description: "Pilih True untuk mengambil foto ikon server saat ini",
        type: 5, // BOOLEAN
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
