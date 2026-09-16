import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not set in .env.local");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  // You can pass discord IDs as command line args or via WHITELIST_DISCORD_IDS env var
  const envIds = process.env.WHITELIST_DISCORD_IDS
    ? process.env.WHITELIST_DISCORD_IDS.split(",").map((id) => id.trim())
    : [];

  const cliIds = process.argv.slice(2);
  const targetIds = cliIds.length > 0 ? cliIds : envIds;

  const defaultUsers = targetIds.length > 0
    ? targetIds.map((id, index) => ({
        discordId: id,
        username: `Authorized User ${index + 1}`,
        money: 0,
        limitCount: 0,
      }))
    : [
        {
          discordId: "123456789012345678", // Placeholder User A (Owner)
          username: "Owner (Placeholder)",
          money: 0,
          limitCount: 0,
        },
        {
          discordId: "876543210987654321", // Placeholder User B (Authorized)
          username: "Authorized User (Placeholder)",
          money: 0,
          limitCount: 0,
        },
      ];

  console.log("🌱 Seeding whitelisted users into database...");

  for (const user of defaultUsers) {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.discordId, user.discordId));

    if (existing.length === 0) {
      await db.insert(users).values(user);
      console.log(`✅ Inserted user: ${user.username} (${user.discordId})`);
    } else {
      console.log(`ℹ️ User already exists: ${user.username} (${user.discordId})`);
    }
  }

  console.log("✨ Seeding completed!");
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
