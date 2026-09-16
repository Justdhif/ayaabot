import { eq, sql } from "drizzle-orm";
import { db } from "../db";
import { users, transactions, User } from "../db/schema";
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

export interface ClaimResult {
  success: boolean;
  user?: User;
  alreadyClaimed?: boolean;
  remainingCooldown?: string;
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
    };
  }

  const now = new Date();

  // Atomically update user balance and insert transaction
  const updatedUser = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(users)
      .set({
        money: sql`${users.money} + ${ECONOMY.CLAIM_MONEY}`,
        limitCount: sql`${users.limitCount} + ${ECONOMY.CLAIM_LIMIT}`,
        lastClaimAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, user.id))
      .returning();

    await tx.insert(transactions).values({
      userId: user.id,
      type: "CLAIM",
      moneyChange: ECONOMY.CLAIM_MONEY,
      limitChange: ECONOMY.CLAIM_LIMIT,
      description: "Daily reward claim",
      createdAt: now,
    });

    return updated;
  });

  return {
    success: true,
    user: updatedUser,
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
