# CuanHD — Private Discord Bot (MVP)

CuanHD adalah private Discord bot untuk image upscaling (HD enhancement) dengan sistem virtual economy (Money, Limit, Daily Claim, dan Rate Limit). Bot ini menggunakan arsitektur serverless Next.js App Router yang siap di-deploy ke Vercel dan terhubung ke Neon PostgreSQL.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router / Serverless API)
- **Language**: TypeScript
- **Database**: Neon PostgreSQL
- **ORM**: Drizzle ORM
- **Image Processing**: Sharp (Lanczos3 2× upscaler & metadata validator)
- **Discord**: Discord HTTP Interactions (Ed25519 signature verification)

---

## 📂 Struktur Project

```text
cuanhd/
├── app/
│   └── api/
│       ├── discord/
│       │   └── route.ts         # Endpoint webhook interaksi Discord
│       └── health/
│           └── route.ts         # Healthcheck API & verifikasi koneksi DB
├── src/
│   ├── commands/
│   │   ├── claim.ts             # Handler /claim
│   │   ├── balance.ts           # Handler /balance
│   │   ├── hd.ts                # Handler /hd
│   │   └── help.ts              # Handler /help
│   ├── config/
│   │   └── constants.ts         # Konstanta economy & batas gambar
│   ├── db/
│   │   ├── index.ts             # Inisialisasi Drizzle ORM + Neon Pool
│   │   └── schema.ts            # Schema tabel users, transactions, usage_logs
│   └── services/
│       ├── economy.service.ts   # Logika transaksi atomic Money & Limit
│       ├── image.service.ts     # Validasi file gambar & dimensi (Sharp)
│       ├── ratelimit.service.ts # Cooldown claim (24 jam) & HD (15 detik)
│       └── upscaler.service.ts  # Layanan upscaling gambar
├── scripts/
│   ├── register-commands.ts     # Script registrasi slash commands ke Discord API
│   ├── seed-users.ts            # Seeder whitelist user ke Neon PostgreSQL
│   └── test-suite.ts            # Skrip verifikasi & integration test mandiri
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

---

## 🚀 Cara Menjalankan & Konfigurasi

### 1. Konfigurasi Environment (`.env.local`)

Isi file `.env.local`:

```env
# Neon PostgreSQL
DATABASE_URL=postgresql://neondb_owner:npg_T9SO1AmiuXyZ@ep-mute-dust-b3b8shvi-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Discord Developer Portal Credentials
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_application_id_here
DISCORD_PUBLIC_KEY=your_public_key_here
DISCORD_GUILD_ID=your_guild_id_here # Opsional (untuk update instan di server tertentu)

# Whitelist User ID (opsional jika menggunakan seeder)
WHITELIST_DISCORD_IDS=123456789012345678,876543210987654321

# External Upscaling API (Opsional, bawaan menggunakan Sharp 2x Lanczos3)
UPSCALER_API_KEY=
UPSCALER_API_URL=
```

### 2. Migrasi Database ke Neon

Skema database sudah diterapkan ke Neon DB. Jika Anda membuat perubahan skema di kemudian hari:

```bash
npm run db:push
```

### 3. Tambahkan User ke Whitelist

Jalankan skrip seeder dengan argumen ID Discord:

```bash
npx tsx scripts/seed-users.ts <DISCORD_USER_ID_1> <DISCORD_USER_ID_2>
```

### 4. Daftarkan Slash Command ke Discord

Setelah mengisi `DISCORD_TOKEN` dan `DISCORD_CLIENT_ID`:

```bash
npm run register:commands
```

### 5. Jalankan Lokal / Test Suite

Uji seluruh alur database dan fungsionalitas bot:

```bash
npx tsx scripts/test-suite.ts
```

Jalankan development server Next.js:

```bash
npm run dev
```

---

## 🌐 Deployment ke Vercel

1. Push repository ke GitHub.
2. Hubungkan proyek di dashboard [Vercel](https://vercel.com).
3. Masukkan Environment Variables di Vercel:
   - `DATABASE_URL`
   - `DISCORD_TOKEN`
   - `DISCORD_CLIENT_ID`
   - `DISCORD_PUBLIC_KEY`
4. Di **Discord Developer Portal** > **General Information**:
   - Masukkan **Interactions Endpoint URL**: `https://<your-vercel-domain>.vercel.app/api/discord`
   - Discord akan mengirim ping verifikasi dan bot Anda langsung aktif melayani interaksi!
