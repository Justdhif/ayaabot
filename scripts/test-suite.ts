import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/db";
import { users, transactions, usageLogs } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { getUserByDiscordId, claimDailyReward, deductForHd } from "../src/services/economy.service";
import { checkClaimCooldown, checkHdCooldown } from "../src/services/ratelimit.service";
import { upscaleImage } from "../src/services/upscaler.service";
import sharp from "sharp";

async function runTestSuite() {
  console.log("🚀 Starting CuanHD Comprehensive Test Suite...\n");

  const testDiscordId = "test_user_99999";

  // Cleanup any old test user
  await db.delete(users).where(eq(users.discordId, testDiscordId));

  // 1. Create Test User
  console.log("1️⃣ Testing User Creation & Whitelist...");
  const [created] = await db
    .insert(users)
    .values({
      discordId: testDiscordId,
      username: "TestRunner",
      money: 0,
      limitCount: 0,
    })
    .returning();
  console.log(`✅ User created: ${created.username} (ID: ${created.id})`);

  const fetched = await getUserByDiscordId(testDiscordId);
  if (!fetched || fetched.discordId !== testDiscordId) {
    throw new Error("❌ Failed to fetch user by Discord ID");
  }
  console.log("✅ Whitelist query passed!");

  // 2. Test Claim Daily Reward
  console.log("\n2️⃣ Testing /claim Logic & Cooldown...");
  const claim1 = await claimDailyReward(testDiscordId);
  if (!claim1.success || !claim1.user) {
    throw new Error("❌ Initial claim failed");
  }
  console.log(`✅ Claim 1 successful! Money: ${claim1.user.money}, Limit: ${claim1.user.limitCount}`);
  if (claim1.user.money !== 1000 || claim1.user.limitCount !== 5) {
    throw new Error(`❌ Expected 1000 Money and 5 Limit, got ${claim1.user.money} and ${claim1.user.limitCount}`);
  }

  // Check transaction log
  const txList = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, created.id));
  if (txList.length !== 1 || txList[0].type !== "CLAIM") {
    throw new Error("❌ Transaction log for CLAIM was not recorded properly");
  }
  console.log("✅ CLAIM transaction logged in database!");

  // Try claiming again immediately (should be rejected by 24h cooldown)
  const claim2 = await claimDailyReward(testDiscordId);
  if (claim2.success || !claim2.alreadyClaimed) {
    throw new Error("❌ Second claim was supposed to be rejected by cooldown!");
  }
  console.log(`✅ Cooldown enforced! Remaining: ${claim2.remainingCooldown}`);

  // 3. Test HD Deduction & Resource Safety
  console.log("\n3️⃣ Testing HD Resource Deduction...");
  const deduct = await deductForHd(created.id);
  if (!deduct.success || !deduct.user) {
    throw new Error("❌ Deduct for HD failed");
  }
  console.log(`✅ HD deducted! Money: ${deduct.user.money} (-100), Limit: ${deduct.user.limitCount} (-1)`);
  if (deduct.user.money !== 900 || deduct.user.limitCount !== 4) {
    throw new Error(`❌ Balance mismatch after deduction: Money ${deduct.user.money}, Limit ${deduct.user.limitCount}`);
  }

  // 4. Test Image Upscaling (Sharp 2x)
  console.log("\n4️⃣ Testing Image Upscaling Service (Sharp 2x)...");
  // Create a 50x50 test image
  const sampleBuffer = await sharp({
    create: {
      width: 50,
      height: 50,
      channels: 4,
      background: { r: 50, g: 150, b: 250, alpha: 1 },
    },
  })
    .png()
    .toBuffer();

  const upscale = await upscaleImage({
    imageBuffer: sampleBuffer,
    originalWidth: 50,
    originalHeight: 50,
    scale: 2,
  });

  if (!upscale.success || !upscale.outputBuffer) {
    throw new Error(`❌ Upscaling failed: ${upscale.error}`);
  }
  console.log(`✅ Upscaling succeeded! Output size: ${upscale.outputWidth}x${upscale.outputHeight} in ${upscale.processingTimeMs}ms`);
  if (upscale.outputWidth !== 100 || upscale.outputHeight !== 100) {
    throw new Error(`❌ Expected 100x100, got ${upscale.outputWidth}x${upscale.outputHeight}`);
  }

  // 5. Test Usage Log
  console.log("\n5️⃣ Testing Usage Log Insertion...");
  const [log] = await db
    .insert(usageLogs)
    .values({
      userId: created.id,
      originalFilename: "test_sample.png",
      originalWidth: 50,
      originalHeight: 50,
      outputWidth: upscale.outputWidth,
      outputHeight: upscale.outputHeight,
      scale: 2,
      status: "SUCCESS",
      processingTimeMs: upscale.processingTimeMs,
    })
    .returning();
  console.log(`✅ Usage log recorded: Log ID ${log.id}, Status ${log.status}`);

  // 6. Cleanup test data
  console.log("\n🧹 Cleaning up test user and records...");
  await db.delete(users).where(eq(users.id, created.id));
  console.log("✅ Cleanup complete!");

  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! Neon DB & Business Logic fully verified!");
}

runTestSuite().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});
