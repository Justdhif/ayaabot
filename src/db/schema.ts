import { pgTable, uuid, varchar, integer, timestamp, text, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    discordId: varchar("discord_id", { length: 32 }).notNull().unique(),
    username: varchar("username", { length: 100 }),
    money: integer("money").notNull().default(0),
    limitCount: integer("limit_count").notNull().default(0),
    lastClaimAt: timestamp("last_claim_at", { mode: "date", withTimezone: true }),
    lastHdAt: timestamp("last_hd_at", { mode: "date", withTimezone: true }),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("users_discord_id_idx").on(table.discordId),
  ]
);

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 30 }).notNull(), // 'CLAIM' | 'HD' | 'BONUS' | etc.
  moneyChange: integer("money_change").notNull().default(0),
  limitChange: integer("limit_change").notNull().default(0),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const usageLogs = pgTable("usage_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  originalFilename: varchar("original_filename", { length: 255 }),
  originalWidth: integer("original_width"),
  originalHeight: integer("original_height"),
  outputWidth: integer("output_width"),
  outputHeight: integer("output_height"),
  scale: integer("scale"),
  status: varchar("status", { length: 20 }).notNull(), // 'PROCESSING' | 'SUCCESS' | 'FAILED'
  processingTimeMs: integer("processing_time_ms"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type UsageLog = typeof usageLogs.$inferSelect;
export type NewUsageLog = typeof usageLogs.$inferInsert;
