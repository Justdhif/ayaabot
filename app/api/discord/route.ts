import { NextRequest, NextResponse } from "next/server";
import { verifyKey } from "discord-interactions";
import { waitUntil } from "@vercel/functions";
import { getUserByDiscordId, getUserRecentTransactions } from "@/services/economy.service";
import { handleHelpCommand } from "@/commands/help";
import { handleBalanceCommand } from "@/commands/balance";
import { handleClaimCommand } from "@/commands/claim";
import { handleHdCommand } from "@/commands/hd";
import { handleFilterCommand } from "@/commands/filter";
import { handleConvertCommand } from "@/commands/convert";
import { handleGiftCommand } from "@/commands/gift";
import { BOT_THEME } from "@/config/constants";

export const maxDuration = 60; // Allow up to 60s execution for image processing

async function patchDiscordOriginalMessage(
  applicationId: string,
  token: string,
  result: {
    responsePayload: any;
    fileAttachment?: { buffer: Buffer; filename: string; contentType: string };
  }
) {
  const webhookUrl = `https://discord.com/api/v10/webhooks/${applicationId}/${token}/messages/@original`;
  const messageData = result.responsePayload.data || result.responsePayload;

  if (result.fileAttachment) {
    const formData = new FormData();
    formData.append("payload_json", JSON.stringify(messageData));

    const fileBlob = new Blob([new Uint8Array(result.fileAttachment.buffer)], {
      type: result.fileAttachment.contentType,
    });

    formData.append("files[0]", fileBlob, result.fileAttachment.filename);

    const patchRes = await fetch(webhookUrl, {
      method: "PATCH",
      body: formData,
    });

    if (!patchRes.ok) {
      const errorText = await patchRes.text();
      console.error("Failed to patch message with file:", patchRes.status, errorText);
    }
  } else {
    const patchRes = await fetch(webhookUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    });

    if (!patchRes.ok) {
      const errorText = await patchRes.text();
      console.error("Failed to patch message text:", patchRes.status, errorText);
    }
  }
}

export async function POST(req: NextRequest) {
  const signature =
    req.headers.get("x-signature-ed25519") ||
    req.headers.get("X-Signature-Ed25519");
  const timestamp =
    req.headers.get("x-signature-timestamp") ||
    req.headers.get("X-Signature-Timestamp");
  const rawBody = await req.text();

  const publicKey = process.env.DISCORD_PUBLIC_KEY;

  // 1. Verify Discord Request Signature
  if (publicKey) {
    if (!signature || !timestamp) {
      return new NextResponse("Missing signature headers", { status: 401 });
    }

    const isValid = await verifyKey(rawBody, signature, timestamp, publicKey);
    if (!isValid) {
      return new NextResponse("Invalid signature", { status: 401 });
    }
  } else {
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("DISCORD_PUBLIC_KEY is not configured", { status: 500 });
    }
  }

  let interaction: any;
  try {
    interaction = JSON.parse(rawBody);
  } catch {
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  // 2. Handle PING (Type 1)
  if (interaction.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // 3. Handle Application Commands (Type 2)
  if (interaction.type === 2) {
    const discordUserId = interaction.member?.user?.id || interaction.user?.id;
    const commandName = interaction.data?.name;

    if (!discordUserId) {
      return NextResponse.json({
        type: 4,
        data: { content: "❌ Unable to identify Discord user." },
      });
    }

    // Authorization Check: Whitelist verification against Neon database
    const user = await getUserByDiscordId(discordUserId);
    if (!user) {
      return NextResponse.json({
        type: 4,
        data: {
          embeds: [
            {
              title: "🔒 Akses Terbatas yaa~ 🌸",
              color: 0xFF758F,
              description:
                "Maaf yaa manis, Ayaa Bot saat ini berstatus **Private Bot** dan hanya bisa digunakan oleh teman-teman yang sudah terdaftar di whitelist~ 🥺💕",
            },
          ],
          flags: 64, // Ephemeral (hanya terlihat oleh user)
        },
      });
    }

    // Command Dispatch
    switch (commandName) {
      case "help": {
        const response = handleHelpCommand();
        return NextResponse.json(response);
      }

      case "balance": {
        const response = handleBalanceCommand(user);
        return NextResponse.json(response);
      }

      case "claim": {
        const response = await handleClaimCommand(user.discordId);
        return NextResponse.json(response);
      }

      case "hd": {
        const options = interaction.data?.options || [];
        const imageOption = options.find((opt: any) => opt.name === "image");
        const scaleOption = options.find((opt: any) => opt.name === "scale");
        const modeOption = options.find((opt: any) => opt.name === "mode");

        const attachmentId = imageOption?.value;
        const attachment = interaction.data?.resolved?.attachments?.[attachmentId];
        const scale = scaleOption ? Number(scaleOption.value) : 2;
        const mode = modeOption ? (modeOption.value as "sharp" | "soft") : "sharp";

        const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
        const interactionToken = interaction.token;

        waitUntil(
          (async () => {
            try {
              const hdResult = await handleHdCommand(user, attachment, { scale, mode });
              await patchDiscordOriginalMessage(applicationId, interactionToken, hdResult);
            } catch (err) {
              console.error("Background HD processing error:", err);
            }
          })()
        );

        return NextResponse.json({ type: 5 });
      }

      case "filter": {
        const options = interaction.data?.options || [];
        const imageOption = options.find((opt: any) => opt.name === "image");
        const presetOption = options.find((opt: any) => opt.name === "preset");

        const attachmentId = imageOption?.value;
        const attachment = interaction.data?.resolved?.attachments?.[attachmentId];
        const preset = presetOption?.value;

        const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
        const interactionToken = interaction.token;

        waitUntil(
          (async () => {
            try {
              const filterResult = await handleFilterCommand(user, attachment, preset);
              await patchDiscordOriginalMessage(applicationId, interactionToken, filterResult);
            } catch (err) {
              console.error("Background Filter processing error:", err);
            }
          })()
        );

        return NextResponse.json({ type: 5 });
      }

      case "convert": {
        const options = interaction.data?.options || [];
        const imageOption = options.find((opt: any) => opt.name === "image");
        const formatOption = options.find((opt: any) => opt.name === "format");
        const qualityOption = options.find((opt: any) => opt.name === "quality");

        const attachmentId = imageOption?.value;
        const attachment = interaction.data?.resolved?.attachments?.[attachmentId];
        const format = formatOption?.value;
        const quality = qualityOption ? Number(qualityOption.value) : 85;

        const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
        const interactionToken = interaction.token;

        waitUntil(
          (async () => {
            try {
              const convertResult = await handleConvertCommand(user, attachment, { format, quality });
              await patchDiscordOriginalMessage(applicationId, interactionToken, convertResult);
            } catch (err) {
              console.error("Background Convert processing error:", err);
            }
          })()
        );

        return NextResponse.json({ type: 5 });
      }

      case "gift": {
        const options = interaction.data?.options || [];
        const userOption = options.find((opt: any) => opt.name === "user" || opt.name === "target");
        const amountOption = options.find((opt: any) => opt.name === "amount");
        const resourceOption = options.find((opt: any) => opt.name === "resource");
        const messageOption = options.find((opt: any) => opt.name === "message");

        const targetDiscordId = userOption?.value;
        const amount = Number(amountOption?.value || 0);
        const resource = (resourceOption?.value as "money" | "limit") || "money";
        const message = messageOption?.value;

        const response = await handleGiftCommand(
          discordUserId,
          targetDiscordId,
          amount,
          resource,
          message
        );
        return NextResponse.json(response);
      }

      default: {
        return NextResponse.json({
          type: 4,
          data: { content: `❌ Unknown command: \`/${commandName}\`` },
        });
      }
    }
  }

  // 4. Handle Message Component Interactions (Buttons, Type 3)
  if (interaction.type === 3) {
    const discordUserId = interaction.member?.user?.id || interaction.user?.id;
    const customId = interaction.data?.custom_id || "";

    if (!discordUserId) {
      return NextResponse.json({
        type: 4,
        data: { content: "❌ Unable to identify Discord user.", flags: 64 },
      });
    }

    const user = await getUserByDiscordId(discordUserId);
    if (!user) {
      return NextResponse.json({
        type: 4,
        data: {
          embeds: [
            {
              title: "🔒 Akses Terbatas yaa~ 🌸",
              color: 0xff758f,
              description:
                "Maaf yaa manis, tombol ini hanya bisa digunakan oleh teman-teman yang sudah terdaftar di whitelist~ 🥺💕",
            },
          ],
          flags: 64,
        },
      });
    }

    const [action] = customId.split(":");

    // Button 1: Claim Daily Reward
    if (action === "btn_claim") {
      const claimResult = await handleClaimCommand(discordUserId);
      return NextResponse.json(claimResult);
    }

    // Button 2: View Recent Transactions
    if (action === "btn_history") {
      const txs = await getUserRecentTransactions(user.id, 5);

      const historyText =
        txs.length > 0
          ? txs
              .map((t) => {
                const moneyStr =
                  t.moneyChange > 0 ? `+${t.moneyChange}` : `${t.moneyChange}`;
                const limitStr =
                  t.limitChange !== 0
                    ? ` (${t.limitChange > 0 ? `+${t.limitChange}` : t.limitChange} 🎟️)`
                    : "";
                const dateStr = new Date(t.createdAt).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                });
                return `• **[${t.type}]** \`${moneyStr} 💰${limitStr}\` — *${t.description || "-"}* (\`${dateStr}\`)`;
              })
              .join("\n")
          : "Belum ada riwayat transaksi yang tercatat.";

      return NextResponse.json({
        type: 4,
        data: {
          flags: 64, // Ephemeral: only visible to the user who clicked
          embeds: [
            {
              title: "📜 Riwayat Transaksi Terakhir Kamu — Ayaa Bot 🌸",
              color: BOT_THEME.COLOR_PINK,
              description:
                `Halo **${user.username || "Manis"}**! Ini dia 5 transaksi terakhir kamu:\n\n` +
                historyText,
              footer: {
                text: `Ayaa Bot 🌸 • Saldo saat ini: ${user.money.toLocaleString("id-ID")} Money • ${user.limitCount} Limit`,
              },
            },
          ],
        },
      });
    }

    return NextResponse.json({
      type: 4,
      data: { content: "❌ Unknown button interaction.", flags: 64 },
    });
  }

  return NextResponse.json({ error: "Unsupported interaction type" }, { status: 400 });
}
