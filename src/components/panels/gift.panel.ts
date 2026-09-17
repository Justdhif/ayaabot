import { BOT_THEME } from "@/config/constants";
import { User } from "@/db/schema";
import { ActionRowComponent } from "./types";

export function buildGiftPanel(
  user: User,
  targetDiscordId: string,
  targetUsername: string = "Teman Manis",
  resource: "money" | "limit" = "money",
  amount: number = 100
) {
  const isAffordable = resource === "money" ? user.money >= amount : user.limitCount >= amount;
  const resourceLabel = resource === "money" ? "Money 💰" : "Tiket Limit 🎟️";

  const embed = {
    title: "🎁 Kotak Kado Manis — Panel Pengiriman 🌸",
    color: BOT_THEME.COLOR_PINK,
    description:
      `Halo **${user.username || "Manis"}**! Mau bagi-bagi rezeki ke **${targetUsername}** (<@${targetDiscordId}>)?\n\n` +
      `🎁 **Jenis Kado:** **${resourceLabel}**\n` +
      `💎 **Jumlah:** **${amount.toLocaleString("id-ID")}**\n` +
      `👛 **Saldo Kamu Saat Ini:** ${user.money.toLocaleString("id-ID")} 💰 • ${user.limitCount} 🎟️\n\n` +
      (isAffordable
        ? `*Gunakan tombol di bawah untuk menambah nominal, lalu klik **Kirim Kado**!*`
        : `⚠️ **Saldo kamu tidak cukup untuk mengirim ${amount.toLocaleString("id-ID")} ${resourceLabel}.**`),
    footer: {
      text: `Ayaa Bot 🌸 • Gift to: ${targetUsername} (${targetDiscordId}) | ${resource}:${amount}`,
    },
  };

  const components: ActionRowComponent[] = [
    // Row 1: Resource Selector (Money vs Limit)
    {
      type: 1,
      components: [
        {
          type: 2,
          style: resource === "money" ? 1 : 2,
          label: "💰 Uang Jajan (Money)",
          custom_id: `gf_sw:money:${amount}:${targetDiscordId}`,
        },
        {
          type: 2,
          style: resource === "limit" ? 1 : 2,
          label: "🎟️ Tiket Limit",
          custom_id: `gf_sw:limit:${amount}:${targetDiscordId}`,
        },
      ],
    },
    // Row 2: Quick Amount Adders
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 2,
          label: "+100",
          custom_id: `gf_add:100:${resource}:${amount}:${targetDiscordId}`,
        },
        {
          type: 2,
          style: 2,
          label: "+500",
          custom_id: `gf_add:500:${resource}:${amount}:${targetDiscordId}`,
        },
        {
          type: 2,
          style: 2,
          label: "+1.000",
          custom_id: `gf_add:1000:${resource}:${amount}:${targetDiscordId}`,
        },
        {
          type: 2,
          style: 2,
          label: "+5.000",
          custom_id: `gf_add:5000:${resource}:${amount}:${targetDiscordId}`,
        },
        {
          type: 2,
          style: 4, // Danger Red (Reset)
          label: "🔄 Reset",
          custom_id: `gf_rst:${resource}:${targetDiscordId}`,
        },
      ],
    },
    // Row 3: Action Run
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 3,
          label: `🎁 Kirim ${amount.toLocaleString("id-ID")} ${resourceLabel} 🎁`,
          custom_id: `gf_run:${resource}:${amount}:${targetDiscordId}`,
          disabled: !isAffordable,
        },
      ],
    },
  ];

  return { embeds: [embed], components };
}
