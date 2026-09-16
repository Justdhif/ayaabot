import { NextRequest, NextResponse } from "next/server";
import { verifyKey } from "discord-interactions";
import { waitUntil } from "@vercel/functions";
import { getUserByDiscordId } from "@/services/economy.service";
import { handleHelpCommand } from "@/commands/help";
import { handleBalanceCommand } from "@/commands/balance";
import { handleClaimCommand } from "@/commands/claim";
import { handleHdCommand } from "@/commands/hd";

export const maxDuration = 60; // Allow up to 60s execution for image processing

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
          content: "🔒 **Access Denied**\n\nYou are not authorized to use CuanHD.",
          flags: 64, // Ephemeral (visible only to user)
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
        const attachmentId = imageOption?.value;
        const attachment = interaction.data?.resolved?.attachments?.[attachmentId];

        const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
        const interactionToken = interaction.token;

        // Process HD upscaling asynchronously to avoid Discord's 3-second timeout limit
        waitUntil(
          (async () => {
            try {
              const hdResult = await handleHdCommand(user, attachment);
              const webhookUrl = `https://discord.com/api/v10/webhooks/${applicationId}/${interactionToken}/messages/@original`;
              const messageData = hdResult.responsePayload.data || hdResult.responsePayload;

              if (hdResult.fileAttachment) {
                const formData = new FormData();
                formData.append("payload_json", JSON.stringify(messageData));

                const fileBlob = new Blob([new Uint8Array(hdResult.fileAttachment.buffer)], {
                  type: hdResult.fileAttachment.contentType,
                });

                formData.append("files[0]", fileBlob, hdResult.fileAttachment.filename);

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
            } catch (err) {
              console.error("Background HD processing error:", err);
            }
          })()
        );

        // Immediate deferred response: Tells Discord to show "AyaaBot is thinking..."
        return NextResponse.json({ type: 5 });
      }

      default: {
        return NextResponse.json({
          type: 4,
          data: { content: `❌ Unknown command: \`/${commandName}\`` },
        });
      }
    }
  }

  return NextResponse.json({ error: "Unsupported interaction type" }, { status: 400 });
}
