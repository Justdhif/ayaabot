# CuanHD — Product Requirements Document

> **Project Type:** Private Discord Bot
> **Version:** 1.0.0 (MVP)
> **Status:** Planning
> **Platform:** Discord
> **Primary Goal:** Image Upscaling / HD Enhancement
> **Database:** Neon PostgreSQL
> **Deployment:** Vercel
> **Language:** TypeScript

---

# 1. Product Overview

## 1.1 Product Name

**CuanHD**

## 1.2 Product Description

CuanHD adalah private Discord bot yang digunakan untuk melakukan **image upscaling** dan meningkatkan kualitas gambar melalui layanan AI image upscaling.

Bot memiliki sistem economy sederhana yang terdiri dari:

* Money
* Limit
* Daily Claim
* Per-user Cooldown / Rate Limit

User mendapatkan Money dan Limit melalui command `/claim`, kemudian menggunakan resource tersebut ketika melakukan image upscaling menggunakan `/hd`.

Bot hanya ditujukan untuk **2 user yang telah di-whitelist**.

---

# 2. Background

Image upscaling biasanya membutuhkan layanan atau resource komputasi tertentu. CuanHD dibuat sebagai project pribadi untuk menyediakan cara sederhana melakukan upscaling langsung dari Discord.

Selain fungsi utama image upscaling, bot memiliki sistem economy agar penggunaan resource dapat dikontrol.

Konsep economy tidak dimaksudkan sebagai sistem pembayaran atau mata uang nyata. Money dan Limit hanya merupakan **virtual resource** yang digunakan untuk mengatur penggunaan bot.

---

# 3. Goals

## 3.1 Primary Goals

1. User dapat melakukan upscale gambar langsung melalui Discord.
2. User dapat memperoleh resource melalui `/claim`.
3. User dapat melihat saldo Money dan Limit.
4. Setiap penggunaan `/hd` mengurangi Money dan Limit.
5. Bot memiliki cooldown untuk mencegah spam request.
6. Hanya user yang terdaftar yang dapat menggunakan bot.
7. Data economy tersimpan secara persistent di Neon PostgreSQL.
8. Bot dapat dijalankan menggunakan arsitektur serverless yang kompatibel dengan Vercel.
9. Project memiliki struktur kode yang sederhana dan mudah dikembangkan.

## 3.2 Secondary Goals

1. Menyimpan riwayat transaksi economy.
2. Menyimpan riwayat penggunaan image upscaling.
3. Menampilkan response Discord yang informatif dan menarik.
4. Menangani kegagalan proses upscale tanpa menyebabkan user kehilangan resource secara tidak sengaja.

---

# 4. Non-Goals

Fitur berikut tidak termasuk dalam MVP:

* Public bot
* Multi-server management
* Payment system
* Premium subscription
* Real-money currency
* Web dashboard
* Admin dashboard
* Redis
* Queue system
* GPU server sendiri
* Custom AI model
* User registration melalui Discord
* OAuth authentication
* Leaderboard
* Marketplace
* Trading Money antar user
* Daily leaderboard
* Complex moderation system

Fitur tersebut dapat dipertimbangkan untuk versi berikutnya apabila diperlukan.

---

# 5. Target Users

## 5.1 Primary Users

Bot hanya digunakan oleh dua user.

Contoh:

```text
User A → Owner / Developer
User B → Authorized User
```

Setiap user memiliki:

* Discord ID
* Username
* Money
* Limit
* Claim cooldown
* Upscale cooldown
* Usage history
* Transaction history

## 5.2 Unauthorized Users

User lain yang mencoba menggunakan command bot harus ditolak.

Response:

```text
🔒 Access Denied

You are not authorized to use CuanHD.
```

---

# 6. Product Scope

MVP memiliki empat slash command utama:

```text
/claim
/balance
/hd
/help
```

---

# 7. Core Features

## 7.1 User Whitelist

Bot hanya dapat digunakan oleh Discord user yang sudah terdaftar.

Identitas user ditentukan menggunakan:

```text
discord_id
```

Bukan menggunakan:

* username
* display name
* nickname

Hal ini dilakukan karena username dan display name dapat berubah.

### Requirement

Setiap command harus melakukan pengecekan authorization sebelum menjalankan business logic.

### Logic

```text
Receive command
       ↓
Get Discord User ID
       ↓
Search user in database
       ↓
User exists?
   ┌───┴───┐
  YES      NO
   │        │
   ▼        ▼
Continue   Reject
```

---

# 8. Economy System

CuanHD memiliki dua jenis virtual resource.

## 8.1 Money

Money digunakan sebagai biaya image upscaling.

Default:

```text
Starting Money = 0
Claim Reward = +1000
HD Cost = -100
```

## 8.2 Limit

Limit menentukan jumlah penggunaan image upscaling.

Default:

```text
Starting Limit = 0
Claim Reward = +5
HD Cost = -1
```

## 8.3 HD Cost

Setiap `/hd` membutuhkan:

```text
100 Money
1 Limit
```

User harus memiliki kedua resource tersebut.

Contoh:

```text
Money = 500
Limit = 3
```

Setelah satu kali `/hd`:

```text
Money = 400
Limit = 2
```

---

# 9. Daily Claim

## 9.1 Purpose

Memberikan resource gratis kepada user secara berkala.

## 9.2 Command

```text
/claim
```

## 9.3 Reward

Default reward:

```text
+1000 Money
+5 Limit
```

## 9.4 Claim Cooldown

User hanya dapat melakukan claim satu kali setiap:

```text
24 hours
```

Cooldown bersifat per-user.

User A tidak mempengaruhi cooldown User B.

## 9.5 Claim Flow

```text
/claim
   ↓
Check authorization
   ↓
Get user
   ↓
Check last_claim_at
   ↓
Can claim?
 ┌──────┴──────┐
YES            NO
 │              │
 ▼              ▼
Add reward     Show remaining cooldown
 │
 ▼
Update last_claim_at
 │
 ▼
Create transaction
 │
 ▼
Return result
```

## 9.6 Successful Response

```text
🎁 Daily Reward Claimed!

💰 +1,000 Money
🎟️ +5 Limit

Your Balance:

💰 Money: 1,000
🎟️ Limit: 5

Come back tomorrow for another reward.
```

## 9.7 Failed Claim

```text
⏳ Daily Reward Already Claimed

You can claim again in:

12h 32m
```

---

# 10. Balance

## 10.1 Command

```text
/balance
```

## 10.2 Purpose

Menampilkan kondisi economy user.

## 10.3 Information

Response harus menampilkan:

* Money
* Limit
* Claim status
* Remaining claim cooldown jika ada

## 10.4 Example

```text
╭────────────────────────╮
│       💎 CuanHD        │
├────────────────────────┤
│                        │
│ 💰 Money      2,000    │
│ 🎟️ Limit          8   │
│                        │
│ 🎁 Claim     Available │
│                        │
╰────────────────────────╯
```

---

# 11. Image Upscaling

## 11.1 Command

```text
/hd
```

## 11.2 Purpose

Melakukan image upscaling menggunakan external image upscaling service.

## 11.3 Input

MVP hanya membutuhkan satu input:

```text
image
```

Contoh:

```text
/hd image:photo.png
```

## 11.4 Supported Formats

MVP mendukung:

```text
PNG
JPG
JPEG
WEBP
```

## 11.5 Maximum File Size

Default:

```text
10 MB
```

Nilai ini dapat disesuaikan berdasarkan batas Discord dan layanan upscaling yang digunakan.

## 11.6 Default Scale

MVP menggunakan:

```text
2x
```

Pilihan scale belum diperlukan pada versi pertama.

---

# 12. `/hd` Processing Flow

```text
User
 │
 │ /hd + image
 ▼
Check Authorization
 │
 ▼
Validate Attachment
 │
 ▼
Validate Image Format
 │
 ▼
Validate File Size
 │
 ▼
Check User Cooldown
 │
 ▼
Check Money
 │
 ▼
Check Limit
 │
 ▼
Start Processing
 │
 ▼
Send Image to Upscaling API
 │
 ▼
Receive Result
 │
 ├───────────────┐
 ▼               ▼
SUCCESS         FAILED
 │               │
 ▼               ▼
Deduct          Refund /
Resources       Keep Balance
 │               │
 ▼               ▼
Save Usage      Save Failed Log
Log
 │
 ▼
Send HD Image
```

---

# 13. Economy Transaction Safety

Resource user tidak boleh berkurang apabila proses upscale gagal.

Contoh:

Sebelum:

```text
Money = 1000
Limit = 5
```

User menjalankan `/hd`.

Jika berhasil:

```text
Money = 900
Limit = 4
```

Jika gagal:

```text
Money = 1000
Limit = 5
```

Tidak ada resource yang hilang.

Database transaction harus digunakan untuk memastikan perubahan economy dilakukan secara atomic.

---

# 14. Rate Limit

## 14.1 Purpose

Rate limit digunakan untuk mencegah user mengirim request upscale secara berlebihan.

## 14.2 Default Cooldown

```text
15 seconds per user
```

Cooldown hanya berlaku untuk command `/hd`.

## 14.3 Example

User menjalankan:

```text
/hd
```

Bot memproses request.

Jika user mencoba lagi sebelum 15 detik:

```text
⏳ Please wait 8 seconds before using /hd again.
```

User lain tetap dapat menjalankan `/hd`.

## 14.4 Rate Limit Flow

```text
/hd
 ↓
Get last_hd_at
 ↓
Calculate elapsed time
 ↓
Elapsed >= 15 seconds?
 ┌────────┴────────┐
YES                NO
 │                  │
 ▼                  ▼
Continue          Reject
                  request
```

---

# 15. `/help`

## 15.1 Purpose

Menampilkan semua command yang tersedia.

## 15.2 Response

```text
╭────────────────────────────╮
│        🤖 CuanHD Help      │
├────────────────────────────┤
│                            │
│ /claim                     │
│ Get your daily reward      │
│                            │
│ /balance                   │
│ Check your Money & Limit   │
│                            │
│ /hd                        │
│ Upscale an image           │
│                            │
│ /help                      │
│ Show this help message     │
│                            │
╰────────────────────────────╯
```

---

# 16. Database Design

Database menggunakan:

```text
Neon PostgreSQL
```

ORM:

```text
Drizzle ORM
```

MVP menggunakan tiga tabel:

```text
users
transactions
usage_logs
```

Relationship:

```text
users
 │
 ├──────────────┐
 │              │
 ▼              ▼
transactions   usage_logs
```

---

# 17. Users Table

## Purpose

Menyimpan data utama user.

## Schema

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    discord_id VARCHAR(32) NOT NULL UNIQUE,
    username VARCHAR(100),

    money INTEGER NOT NULL DEFAULT 0,
    limit_count INTEGER NOT NULL DEFAULT 0,

    last_claim_at TIMESTAMP,
    last_hd_at TIMESTAMP,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Fields

| Field         | Type      | Description              |
| ------------- | --------- | ------------------------ |
| id            | UUID      | Internal user identifier |
| discord_id    | VARCHAR   | Discord User ID          |
| username      | VARCHAR   | Discord username         |
| money         | INTEGER   | Current Money            |
| limit_count   | INTEGER   | Current Limit            |
| last_claim_at | TIMESTAMP | Last daily claim         |
| last_hd_at    | TIMESTAMP | Last HD request          |
| created_at    | TIMESTAMP | Creation timestamp       |
| updated_at    | TIMESTAMP | Last update timestamp    |

---

# 18. Transactions Table

## Purpose

Menyimpan perubahan economy.

## Schema

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    type VARCHAR(30) NOT NULL,

    money_change INTEGER NOT NULL DEFAULT 0,
    limit_change INTEGER NOT NULL DEFAULT 0,

    description TEXT,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Transaction Types

```text
CLAIM
HD
```

Future types:

```text
BONUS
ADMIN_ADJUSTMENT
REFUND
```

## Example

Claim:

```text
type = CLAIM
money_change = 1000
limit_change = 5
```

HD:

```text
type = HD
money_change = -100
limit_change = -1
```

---

# 19. Usage Logs Table

## Purpose

Menyimpan riwayat image processing.

## Schema

```sql
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    original_filename VARCHAR(255),

    original_width INTEGER,
    original_height INTEGER,

    output_width INTEGER,
    output_height INTEGER,

    scale INTEGER,

    status VARCHAR(20) NOT NULL,

    processing_time_ms INTEGER,

    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

## Status

```text
PROCESSING
SUCCESS
FAILED
```

---

# 20. Database Relationship

```text
users
│
│ 1
│
├───────────────< transactions
│
│
└───────────────< usage_logs
```

One user can have multiple transactions and usage logs.

---

# 21. Tech Stack

## 21.1 Core Stack

| Technology             | Purpose                    |
| ---------------------- | -------------------------- |
| TypeScript             | Main programming language  |
| Next.js                | Serverless application/API |
| discord.js             | Discord integration        |
| Neon PostgreSQL        | Database                   |
| Drizzle ORM            | Database access            |
| Zod                    | Validation                 |
| Sharp                  | Image processing utilities |
| External Upscaling API | AI image upscaling         |
| Vercel                 | Deployment                 |
| GitHub                 | Source control             |

---

# 22. Technology Decisions

## 22.1 TypeScript

TypeScript digunakan sebagai bahasa utama agar bot logic, API, database layer, dan utilities berada dalam satu ecosystem.

---

## 22.2 Next.js

Next.js digunakan terutama sebagai serverless backend.

Frontend tidak diperlukan pada MVP.

Contoh endpoint:

```text
/api/discord
/api/health
```

---

## 22.3 discord.js

Digunakan untuk:

* Slash commands
* Discord interactions
* Embeds
* Attachments
* User information
* Discord responses

---

## 22.4 Neon PostgreSQL

Neon digunakan sebagai persistent database.

Database bertanggung jawab menyimpan:

* user
* Money
* Limit
* claim timestamp
* cooldown timestamp
* transactions
* usage logs

---

## 22.5 Drizzle ORM

Drizzle digunakan sebagai database ORM karena ringan dan cocok untuk project TypeScript sederhana.

---

## 22.6 Zod

Zod digunakan untuk melakukan validation terhadap input dan konfigurasi.

Contoh:

* image attachment
* scale
* environment variables
* API response

---

## 22.7 Sharp

Sharp digunakan untuk image processing dasar seperti:

* membaca metadata
* mendapatkan width/height
* resize
* format conversion
* compression
* image validation

Sharp bukan model AI upscaling utama.

---

## 22.8 External Upscaling API

AI image upscaling dilakukan melalui external service.

Arsitektur:

```text
Discord
   │
   ▼
Vercel
   │
   ▼
Upscaling API
   │
   ▼
HD Image
   │
   ▼
Vercel
   │
   ▼
Discord
```

Model/API yang digunakan dapat ditentukan pada tahap implementasi berdasarkan kebutuhan, harga, API availability, dan batas file.

---

# 23. Vercel Architecture

CuanHD menggunakan serverless architecture.

```text
                   Discord
                      │
                      ▼
              ┌───────────────┐
              │    Vercel     │
              │    Next.js    │
              └───────┬───────┘
                      │
             ┌────────┴────────┐
             ▼                 ▼
       ┌──────────┐     ┌───────────────┐
       │   Neon   │     │ Upscaling API │
       │PostgreSQL│     │               │
       └──────────┘     └───────────────┘
```

---

# 24. Discord Interaction Architecture

Discord mengirim interaction ke endpoint aplikasi.

```text
User
 │
 │ /claim
 ▼
Discord
 │
 │ HTTPS Request
 ▼
Vercel
 │
 ▼
Discord Interaction Handler
 │
 ├── Authentication
 ├── Command Router
 └── Business Logic
```

Command router:

```text
interaction.commandName

        │
        ├── claim
        ├── balance
        ├── hd
        └── help
```

---

# 25. Project Structure

```text
cuanhd/
│
├── app/
│   └── api/
│       ├── discord/
│       │   └── route.ts
│       │
│       └── health/
│           └── route.ts
│
├── src/
│   ├── commands/
│   │   ├── claim.ts
│   │   ├── balance.ts
│   │   ├── hd.ts
│   │   └── help.ts
│   │
│   ├── services/
│   │   ├── economy.service.ts
│   │   ├── image.service.ts
│   │   ├── upscaler.service.ts
│   │   └── ratelimit.service.ts
│   │
│   ├── db/
│   │   ├── index.ts
│   │   └── schema.ts
│   │
│   ├── config/
│   │   └── constants.ts
│   │
│   ├── utils/
│   │   └── ...
│   │
│   └── types/
│       └── ...
│
├── drizzle/
│
├── scripts/
│   └── register-commands.ts
│
├── .env.local
├── drizzle.config.ts
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

---

# 26. Environment Variables

Required environment variables:

```env
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_PUBLIC_KEY=
DISCORD_GUILD_ID=

DATABASE_URL=

UPSCALER_API_KEY=
UPSCALER_API_URL=
```

Secrets tidak boleh dimasukkan langsung ke source code.

---

# 27. Configuration

Semua konfigurasi economy dan rate limit harus disimpan dalam satu file.

Contoh:

```ts
export const ECONOMY = {
    CLAIM_MONEY: 1000,
    CLAIM_LIMIT: 5,

    HD_COST_MONEY: 100,
    HD_COST_LIMIT: 1,

    CLAIM_COOLDOWN_HOURS: 24,
    HD_COOLDOWN_SECONDS: 15,
};
```

Dengan cara ini, perubahan economy tidak membutuhkan perubahan di banyak file.

---

# 28. Command Authorization

Semua command harus melalui authorization middleware/function.

Concept:

```ts
const user = await getUserByDiscordId(discordId);

if (!user) {
    return unauthorizedResponse();
}
```

---

# 29. Image Validation

Sebelum image diproses:

```text
Attachment exists?
        ↓
Valid MIME type?
        ↓
Valid extension?
        ↓
File size within limit?
        ↓
Valid image?
        ↓
Process
```

Allowed MIME types:

```text
image/png
image/jpeg
image/webp
```

---

# 30. Error Handling

Bot harus menangani minimal error berikut.

## Unauthorized

```text
🔒 You are not authorized to use CuanHD.
```

## Invalid Image

```text
❌ Please upload a valid image.

Supported formats:
PNG, JPG, JPEG, WEBP
```

## File Too Large

```text
❌ Image is too large.

Maximum file size: 10 MB
```

## Insufficient Money

```text
💰 Insufficient Money.

Required: 100
Your balance: 50
```

## Insufficient Limit

```text
🎟️ Insufficient Limit.

Required: 1
Your limit: 0

Use /claim to get more.
```

## Rate Limited

```text
⏳ Please wait 8 seconds before using /hd again.
```

## Upscaling Failure

```text
❌ Failed to upscale your image.

Your resources were not deducted.
Please try again later.
```

---

# 31. Image Processing Lifecycle

```text
RECEIVED
    │
    ▼
VALIDATING
    │
    ▼
PROCESSING
    │
    ▼
SUCCESS
    │
    ▼
COMPLETED
```

Failure:

```text
PROCESSING
    │
    ▼
FAILED
```

---

# 32. Usage Logging

Setiap request `/hd` harus membuat usage log.

Contoh successful log:

```text
filename:
photo.png

original:
1920x1080

output:
3840x2160

scale:
2

status:
SUCCESS

processing_time:
3200ms
```

---

# 33. Transaction Logging

Setiap perubahan Money atau Limit harus dicatat.

Contoh:

```text
CLAIM

Money:
+1000

Limit:
+5
```

Kemudian:

```text
HD

Money:
-100

Limit:
-1
```

Database balance merupakan current state, sedangkan transaction table digunakan sebagai history.

---

# 34. Data Consistency

Economy update harus dilakukan secara atomic.

Contoh:

```text
BEGIN TRANSACTION

Check balance

Deduct Money
Deduct Limit

Create transaction log

COMMIT
```

Jika terjadi error:

```text
ROLLBACK
```

Tidak boleh terjadi kondisi:

```text
Money berhasil dikurangi
Limit berhasil dikurangi
Upscaling gagal
```

tanpa mekanisme rollback/refund.

---

# 35. User Flow — First Time

```text
User
 │
 ▼
/claim
 │
 ▼
Daily reward
 │
 ├── +1000 Money
 └── +5 Limit
 │
 ▼
/balance
 │
 ▼
Check balance
 │
 ▼
/hd
 │
 ▼
Upload image
 │
 ▼
Image processing
 │
 ▼
Receive HD image
```

---

# 36. User Flow — Normal Usage

```text
/claim
   ↓
Receive resources
   ↓
/balance
   ↓
Check resources
   ↓
/hd
   ↓
Upload image
   ↓
Validation
   ↓
Upscaling
   ↓
Receive result
   ↓
Resources deducted
```

---

# 37. User Flow — Failed Processing

```text
/hd
 ↓
Validation
 ↓
Check balance
 ↓
Processing
 ↓
Upscaling API Error
 ↓
No resource deduction
 ↓
Create FAILED usage log
 ↓
Notify user
```

---

# 38. User Flow — Rate Limited

```text
/hd
 ↓
Check last_hd_at
 ↓
Cooldown active
 ↓
Reject request
 ↓
Show remaining cooldown
```

---

# 39. User Flow — Insufficient Resource

```text
/hd
 ↓
Check Money
 ↓
Money insufficient
 ↓
Reject request
```

atau:

```text
/hd
 ↓
Check Limit
 ↓
Limit insufficient
 ↓
Reject request
```

Tidak ada API request yang dilakukan apabila resource tidak mencukupi.

---

# 40. Performance Requirements

MVP tidak membutuhkan high-scale architecture.

Target:

* Command response secepat mungkin.
* Validation dilakukan sebelum external API request.
* Tidak melakukan image processing jika user tidak memenuhi requirements.
* External API processing time bergantung pada provider.
* Database query harus menggunakan indexed fields untuk `discord_id`.

Index utama:

```sql
CREATE UNIQUE INDEX users_discord_id_idx
ON users(discord_id);
```

---

# 41. Reliability Requirements

Bot harus:

* Tidak crash karena invalid input.
* Tidak mengurangi resource ketika upscale gagal.
* Menangani external API error.
* Menangani database error.
* Menangani timeout.
* Menampilkan error message yang jelas kepada user.

---

# 42. Security Requirements

## 42.1 Secrets

API key dan token harus disimpan sebagai environment variables.

Jangan:

```ts
const token = "MY_SECRET_TOKEN";
```

Gunakan:

```ts
process.env.DISCORD_TOKEN
```

## 42.2 Authorization

Semua command harus memvalidasi Discord ID.

## 42.3 Input Validation

Semua input user harus divalidasi.

## 42.4 External Image

Image yang dikirim ke external API harus berasal dari attachment yang telah divalidasi.

---

# 43. Discord Commands Summary

| Command    | Description        | Cost                |
| ---------- | ------------------ | ------------------- |
| `/claim`   | Get daily reward   | Free                |
| `/balance` | Show Money & Limit | Free                |
| `/hd`      | Upscale image      | 100 Money + 1 Limit |
| `/help`    | Show command help  | Free                |

---

# 44. Economy Summary

| Action      | Money | Limit |
| ----------- | ----: | ----: |
| Daily Claim | +1000 |    +5 |
| HD Upscale  |  -100 |    -1 |
| Balance     |     0 |     0 |
| Help        |     0 |     0 |

---

# 45. Rate Limit Summary

| Action     | Limit                  |
| ---------- | ---------------------- |
| `/claim`   | 1× / 24 hours          |
| `/hd`      | 1× / 15 seconds / user |
| `/balance` | No limit               |
| `/help`    | No limit               |

---

# 46. MVP Acceptance Criteria

## `/claim`

* [ ] User terdaftar dapat menggunakan `/claim`.
* [ ] User tidak terdaftar ditolak.
* [ ] Reward +1000 Money diberikan.
* [ ] Reward +5 Limit diberikan.
* [ ] Claim hanya dapat dilakukan setiap 24 jam.
* [ ] `last_claim_at` diperbarui.
* [ ] Transaction dicatat.

## `/balance`

* [ ] Menampilkan Money.
* [ ] Menampilkan Limit.
* [ ] Menampilkan claim status.
* [ ] Tidak mengubah economy.

## `/hd`

* [ ] User harus terdaftar.
* [ ] Attachment harus berupa image.
* [ ] File size harus valid.
* [ ] User harus memiliki cukup Money.
* [ ] User harus memiliki cukup Limit.
* [ ] Cooldown harus dicek.
* [ ] Image dikirim ke upscaling service.
* [ ] Result dikembalikan ke Discord.
* [ ] Money dikurangi setelah berhasil.
* [ ] Limit dikurangi setelah berhasil.
* [ ] Usage log dibuat.
* [ ] Error tidak menghilangkan resource user.

## `/help`

* [ ] Menampilkan semua command.
* [ ] Tidak membutuhkan resource.

---

# 47. Development Phases

## Phase 1 — Project Setup

* [ ] Create GitHub repository.
* [ ] Create Next.js project.
* [ ] Configure TypeScript.
* [ ] Install discord.js.
* [ ] Configure environment variables.
* [ ] Create Vercel project.

## Phase 2 — Database

* [ ] Create Neon database.
* [ ] Configure Drizzle.
* [ ] Create users table.
* [ ] Create transactions table.
* [ ] Create usage_logs table.
* [ ] Run migration.
* [ ] Create seed users.

## Phase 3 — Discord

* [ ] Create Discord Application.
* [ ] Create Discord Bot.
* [ ] Configure bot permissions.
* [ ] Configure slash commands.
* [ ] Create interaction endpoint.
* [ ] Test `/help`.

## Phase 4 — Economy

* [ ] Implement user authorization.
* [ ] Implement `/claim`.
* [ ] Implement claim cooldown.
* [ ] Implement `/balance`.
* [ ] Implement transaction logging.

## Phase 5 — Image Upscaling

* [ ] Implement image validation.
* [ ] Implement file size validation.
* [ ] Integrate upscaling API.
* [ ] Implement `/hd`.
* [ ] Implement image result response.
* [ ] Implement usage logging.

## Phase 6 — Rate Limit & Safety

* [ ] Implement `/hd` cooldown.
* [ ] Implement resource validation.
* [ ] Implement transaction safety.
* [ ] Implement API error handling.
* [ ] Implement database error handling.

## Phase 7 — Deployment

* [ ] Configure Vercel.
* [ ] Add environment variables.
* [ ] Connect Neon.
* [ ] Deploy.
* [ ] Configure Discord interaction endpoint.
* [ ] Test production bot.

---

# 48. Future Development

Jika project berkembang, fitur berikut dapat dipertimbangkan.

## V2

```text
/profile
/history
/stats
```

## V3

Multiple upscale options:

```text
/hd scale:2
/hd scale:4
```

Contoh economy:

| Scale | Money | Limit |
| ----- | ----: | ----: |
| 2×    |   100 |     1 |
| 4×    |   250 |     2 |

## V4

Image modes:

```text
photo
anime
general
face
```

Tergantung kemampuan upscaling provider.

## V5

Admin commands:

```text
/admin add-money
/admin add-limit
/admin reset
/admin stats
```

Admin command hanya dapat digunakan oleh owner.

---

# 49. Future Architecture

Jika kebutuhan meningkat, architecture dapat dikembangkan menjadi:

```text
                    Discord
                       │
                       ▼
                    Vercel
                       │
              ┌────────┴────────┐
              ▼                 ▼
            Neon          Upscaling API
              │                 │
              │                 ▼
              │             Processing
              │                 │
              └────────┬────────┘
                       ▼
                    Discord
```

Jika external API tidak lagi mencukupi:

```text
Discord
   │
   ▼
Vercel
   │
   ├── Neon
   │
   └── GPU Worker
           │
           ▼
      Real-ESRGAN
```

GPU worker hanya diperlukan jika ingin menjalankan model sendiri.

---

# 50. Project Principles

CuanHD harus mengikuti prinsip:

### Simple

Jangan menambahkan infrastructure yang tidak dibutuhkan.

### Private

Bot hanya digunakan oleh user yang di-whitelist.

### Reliable

User tidak boleh kehilangan resource karena processing failure.

### Maintainable

Business logic dipisahkan dari Discord interaction logic.

### Configurable

Economy dan rate limit mudah diubah melalui configuration file.

### Serverless-Friendly

Architecture harus tetap kompatibel dengan deployment Vercel.

---

# 51. Final Architecture

```text
┌─────────────────────────────────────────────┐
│                  DISCORD                    │
│                                             │
│ /claim   /balance   /hd   /help             │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│                   VERCEL                    │
│                                             │
│              Next.js / TypeScript           │
│                                             │
│  ┌─────────────┐   ┌────────────────────┐  │
│  │   Command   │   │      Services      │  │
│  │   Handler   │──▶│ Economy            │  │
│  │             │   │ Rate Limit         │  │
│  └─────────────┘   │ Image              │  │
│                    │ Upscaler           │  │
│                    └─────────┬──────────┘  │
└──────────────────────────────┼─────────────┘
                               │
                    ┌──────────┴───────────┐
                    ▼                      ▼
          ┌──────────────────┐    ┌─────────────────┐
          │      NEON        │    │   UPSCALER API  │
          │   PostgreSQL     │    │                 │
          │                  │    │ AI Image        │
          │ users            │    │ Upscaling       │
          │ transactions     │    │                 │
          │ usage_logs       │    └─────────────────┘
          └──────────────────┘
```

---

# 52. Final MVP Definition

CuanHD MVP dianggap selesai apabila dua authorized Discord users dapat melakukan workflow berikut:

```text
1. /claim
       ↓
2. Mendapatkan 1000 Money + 5 Limit
       ↓
3. /balance
       ↓
4. Melihat resource
       ↓
5. /hd + image
       ↓
6. Image divalidasi
       ↓
7. Money & Limit diverifikasi
       ↓
8. Cooldown diverifikasi
       ↓
9. Image dikirim ke upscaling API
       ↓
10. Image berhasil di-upscale
       ↓
11. Money -100
       ↓
12. Limit -1
       ↓
13. Result dikirim kembali ke Discord
       ↓
14. Usage & transaction dicatat di Neon
```

Dengan demikian, CuanHD memiliki **core functionality yang lengkap tanpa infrastructure berlebihan**, sehingga cocok untuk project pribadi dengan dua user dan deployment menggunakan Vercel.
