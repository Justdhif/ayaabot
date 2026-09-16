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

export async function deductForHd(userId: string): Promise<DeductHdResult> {
  const [currentUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!currentUser) {
    return { success: false, error: "User not found" };
  }

  if (currentUser.money < ECONOMY.HD_COST_MONEY) {
    return { success: false, insufficientMoney: true };
  }

  if (currentUser.limitCount < ECONOMY.HD_COST_LIMIT) {
    return { success: false, insufficientLimit: true };
  }

  const now = new Date();

  const updatedUser = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(users)
      .set({
        money: sql`${users.money} - ${ECONOMY.HD_COST_MONEY}`,
        limitCount: sql`${users.limitCount} - ${ECONOMY.HD_COST_LIMIT}`,
        lastHdAt: now,
        updatedAt: now,
      })
      .where(eq(users.id, userId))
      .returning();

    await tx.insert(transactions).values({
      userId: userId,
      type: "HD",
      moneyChange: -ECONOMY.HD_COST_MONEY,
      limitChange: -ECONOMY.HD_COST_LIMIT,
      description: "HD upscale cost",
      createdAt: now,
    });

    return updated;
  });

  return {
    success: true,
    user: updatedUser,
  };
}
