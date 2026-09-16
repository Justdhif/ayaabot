import { eq, sql, desc, or, isNull, lte } from "drizzle-orm";
import { db } from "../db";
import { users, transactions, User, Transaction } from "../db/schema";
import { ECONOMY } from "../config/constants";
import { checkClaimCooldown } from "./ratelimit.service";

export async function getUserByDiscordId(discordId: string): Promise<User | null> {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.discordId, discordId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export function getStreakReward(streak: number): { money: number; limit: number; isBonus: boolean } {
  if (streak >= 7) return { money: 3000, limit: 8, isBonus: true };
  if (streak === 6) return { money: 2400, limit: 7, isBonus: true };
  if (streak === 5) return { money: 2000, limit: 7, isBonus: true };
  if (streak === 4) return { money: 1700, limit: 6, isBonus: true };
  if (streak === 3) return { money: 1500, limit: 6, isBonus: true };
  if (streak === 2) return { money: 1200, limit: 5, isBonus: true };
  return { money: 1000, limit: 5, isBonus: false };
}

export interface ClaimResult {
  success: boolean;
  user?: User;
  alreadyClaimed?: boolean;
  remainingCooldown?: string;
  streak?: number;
  rewardMoney?: number;
  rewardLimit?: number;
  isBonus?: boolean;
  error?: string;
}

export async function claimDailyReward(discordId: string): Promise<ClaimResult> {
  const user = await getUserByDiscordId(discordId);
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const cooldown = checkClaimCooldown(user.lastClaimAt);
  if (!cooldown.canExecute) {
    return {
      success: false,
      alreadyClaimed: true,
      remainingCooldown: cooldown.formattedRemaining,
      streak: user.claimStreak || 0,
    };
  }

  const now = new Date();
  let newStreak = 1;
  if (user.lastClaimAt) {
    const elapsedMs = now.getTime() - new Date(user.lastClaimAt).getTime();
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    // Consecutive day claim window: between 24h and 48h
    if (elapsedHours >= 24 && elapsedHours <= 48) {
      newStreak = (user.claimStreak || 0) + 1;
    } else {
      // Missed more than 48 hours: streak resets to 1
      newStreak = 1;
    }
  }

  const reward = getStreakReward(newStreak);

  // Atomically update user balance, streak and insert transaction
  const updatedUser = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(users)
      .set({
        money: sql`${users.money} + ${reward.money}`,
        limitCount: sql`${users.limitCount} + ${reward.limit}`,
        claimStreak: newStreak,
        lastClaimAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, user.id))
      .returning();

    await tx.insert(transactions).values({
      userId: user.id,
      type: "CLAIM",
      moneyChange: reward.money,
      limitChange: reward.limit,
      description: `Daily claim (Streak Hari ke-${newStreak})`,
      createdAt: now,
    });

    return updated;
  });

  return {
    success: true,
    user: updatedUser,
    streak: newStreak,
    rewardMoney: reward.money,
    rewardLimit: reward.limit,
    isBonus: reward.isBonus,
  };
}

export interface DeductHdResult {
  success: boolean;
  user?: User;
  insufficientMoney?: boolean;
  insufficientLimit?: boolean;
  error?: string;
}

export async function deductForHd(userId: string, scale: number = 2): Promise<DeductHdResult> {
  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!currentUser) {
    return { success: false, error: "User not found" };
  }

  const costMoney = scale === 4 ? ECONOMY.HD_COST_MONEY_4X : ECONOMY.HD_COST_MONEY_2X;
  const costLimit = scale === 4 ? ECONOMY.HD_COST_LIMIT_4X : ECONOMY.HD_COST_LIMIT_2X;

  if (currentUser.money < costMoney) {
    return { success: false, insufficientMoney: true };
  }

  if (currentUser.limitCount < costLimit) {
    return { success: false, insufficientLimit: true };
  }

  const now = new Date();

  const updatedUser = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(users)
      .set({
        money: sql`${users.money} - ${costMoney}`,
        limitCount: sql`${users.limitCount} - ${costLimit}`,
        lastHdAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, userId))
      .returning();

    await tx.insert(transactions).values({
      userId: userId,
      type: "HD",
      moneyChange: -costMoney,
      limitChange: -costLimit,
      description: `HD upscale ${scale}x cost`,
      createdAt: now,
    });

    return updated;
  });

  return {
    success: true,
    user: updatedUser,
  };
}

export interface SimpleDeductResult {
  success: boolean;
  user?: User;
  insufficientMoney?: boolean;
  error?: string;
}

export async function deductForFilter(userId: string, preset: string): Promise<SimpleDeductResult> {
  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!currentUser) {
    return { success: false, error: "User not found" };
  }

  const costMoney = ECONOMY.FILTER_COST_MONEY;

  if (currentUser.money < costMoney) {
    return { success: false, insufficientMoney: true };
  }

  const now = new Date();

  const updatedUser = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(users)
      .set({
        money: sql`${users.money} - ${costMoney}`,
        updatedAt: now,
      })
      .where(eq(users.id, userId))
      .returning();

    await tx.insert(transactions).values({
      userId: userId,
      type: "FILTER",
      moneyChange: -costMoney,
      limitChange: 0,
      description: `Aesthetic filter (${preset}) cost`,
      createdAt: now,
    });

    return updated;
  });

  return {
    success: true,
    user: updatedUser,
  };
}

export async function deductForConvert(userId: string, targetFormat: string): Promise<SimpleDeductResult> {
  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!currentUser) {
    return { success: false, error: "User not found" };
  }

  const costMoney = ECONOMY.CONVERT_COST_MONEY;

  if (currentUser.money < costMoney) {
    return { success: false, insufficientMoney: true };
  }

  const now = new Date();

  const updatedUser = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(users)
      .set({
        money: sql`${users.money} - ${costMoney}`,
        updatedAt: now,
      })
      .where(eq(users.id, userId))
      .returning();

    await tx.insert(transactions).values({
      userId: userId,
      type: "CONVERT",
      moneyChange: -costMoney,
      limitChange: 0,
      description: `Format convert to ${targetFormat.toUpperCase()} cost`,
      createdAt: now,
    });

    return updated;
  });

  return {
    success: true,
    user: updatedUser,
  };
}

export async function getUserRecentTransactions(
  userId: string,
  limit: number = 5
): Promise<Transaction[]> {
  return await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit);
}

export async function getUsersReadyForClaim(): Promise<User[]> {
  const threshold = new Date(Date.now() - ECONOMY.CLAIM_COOLDOWN_HOURS * 60 * 60 * 1000);
  return await db
    .select()
    .from(users)
    .where(or(isNull(users.lastClaimAt), lte(users.lastClaimAt, threshold)));
}

export interface GiftResult {
  success: boolean;
  sender?: User;
  receiver?: User;
  amount?: number;
  resource?: "money" | "limit";
  message?: string;
  error?: string;
}

export async function transferGift(
  senderDiscordId: string,
  targetDiscordId: string,
  amount: number,
  resource: "money" | "limit" = "money",
  message?: string,
  targetUsername?: string
): Promise<GiftResult> {
  const safeAmount = Math.floor(amount);

  if (!targetDiscordId) {
    return { success: false, error: "Sebutkan teman yang ingin kamu beri kado yaa manis! 🎀" };
  }

  if (safeAmount <= 0 || isNaN(safeAmount)) {
    return { success: false, error: "Jumlah kado harus berupa angka positif lebih dari 0 yaa manis! 🎀" };
  }

  if (senderDiscordId === targetDiscordId) {
    return { success: false, error: "Kamu tidak bisa mengirim kado ke diri sendiri yaa~ 🥺💕" };
  }

  const sender = await getUserByDiscordId(senderDiscordId);
  if (!sender) {
    return { success: false, error: "Akun kamu belum terdaftar di whitelist." };
  }

  let receiver = await getUserByDiscordId(targetDiscordId);
  if (!receiver) {
    try {
      const [newRec] = await db
        .insert(users)
        .values({
          discordId: targetDiscordId,
          username: targetUsername || "Teman Manis",
          money: 0,
          limitCount: 0,
          claimStreak: 0,
        })
        .onConflictDoNothing()
        .returning();

      receiver = newRec || (await getUserByDiscordId(targetDiscordId));
    } catch (insertErr) {
      console.warn("[Gift] Auto-provision receiver error:", insertErr);
      receiver = await getUserByDiscordId(targetDiscordId);
    }
  }

  if (!receiver) {
    return { success: false, error: "Ayaa gagal menyiapkan profil penerima kado. Coba lagi yaa~ 🥺" };
  }

  if (resource === "money" && sender.money < safeAmount) {
    return {
      success: false,
      error: `Saldo uang jajan kamu tidak cukup. Kamu punya **${sender.money.toLocaleString("id-ID")} Money**, tapi mau kirim **${safeAmount.toLocaleString("id-ID")} Money**. 👛`,
    };
  }

  if (resource === "limit" && sender.limitCount < safeAmount) {
    return {
      success: false,
      error: `Tiket limit kamu tidak cukup. Kamu punya **${sender.limitCount} Limit**, tapi mau kirim **${safeAmount} Limit**. 🎟️`,
    };
  }

  const now = new Date();
  const cleanMsg = message && message.trim().length > 0 ? message.trim() : "Kado manis untukmu! 🌸";

  const { updatedSender, updatedReceiver } = await db.transaction(async (tx) => {
    const [uSender] = await tx
      .update(users)
      .set({
        money: resource === "money" ? sql`${users.money} - ${safeAmount}` : users.money,
        limitCount: resource === "limit" ? sql`${users.limitCount} - ${safeAmount}` : users.limitCount,
        updatedAt: now,
      })
      .where(eq(users.id, sender.id))
      .returning();

    const [uReceiver] = await tx
      .update(users)
      .set({
        money: resource === "money" ? sql`${users.money} + ${safeAmount}` : users.money,
        limitCount: resource === "limit" ? sql`${users.limitCount} + ${safeAmount}` : users.limitCount,
        updatedAt: now,
      })
      .where(eq(users.id, receiver.id))
      .returning();

    // Log for sender
    await tx.insert(transactions).values({
      userId: sender.id,
      type: "GIFT_SENT",
      moneyChange: resource === "money" ? -safeAmount : 0,
      limitChange: resource === "limit" ? -safeAmount : 0,
      description: `Kirim kado untuk @${receiver.username || receiver.discordId}: "${cleanMsg}"`,
      createdAt: now,
    });

    // Log for receiver
    await tx.insert(transactions).values({
      userId: receiver.id,
      type: "GIFT_RECEIVED",
      moneyChange: resource === "money" ? safeAmount : 0,
      limitChange: resource === "limit" ? safeAmount : 0,
      description: `Terima kado dari @${sender.username || sender.discordId}: "${cleanMsg}"`,
      createdAt: now,
    });

    return { updatedSender: uSender, updatedReceiver: uReceiver };
  });

  return {
    success: true,
    sender: updatedSender,
    receiver: updatedReceiver,
    amount: safeAmount,
    resource,
    message: cleanMsg,
  };
}
