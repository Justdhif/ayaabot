import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users, transactions, usageLogs } from "../src/db/schema";
import { inArray } from "drizzle-orm";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL is not set");
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  const dummyIds = ["123456789012345678", "876543210987654321"];
  console.log("Searching for dummy users with IDs:", dummyIds);

  const dummyUsers = await db
    .select()
    .from(users)
    .where(inArray(users.discordId, dummyIds));

  console.log(`Found ${dummyUsers.length} dummy user(s).`);

  if (dummyUsers.length > 0) {
    const ids = dummyUsers.map((u) => u.id);
    await db.delete(transactions).where(inArray(transactions.userId, ids));
    await db.delete(usageLogs).where(inArray(usageLogs.userId, ids));
    await db.delete(users).where(inArray(users.id, ids));
    console.log("✅ Successfully deleted dummy users and related records.");
  }

  const allUsers = await db.select().from(users);
  console.log("Current active users in DB:");
  allUsers.forEach((u) => {
    console.log(` - ${u.username} (Discord ID: ${u.discordId}, Money: ${u.money}, Limit: ${u.limitCount})`);
  });
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error cleaning dummy users:", err);
    process.exit(1);
  });
