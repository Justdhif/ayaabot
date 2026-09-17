import { NextRequest, NextResponse } from "next/server";
import { verifyKey } from "discord-interactions";
import { waitUntil } from "@vercel/functions";
import { getUserByDiscordId } from "@/services/economy.service";
import {
  handleCommandInteraction,
  handleButtonInteraction,
  patchDiscordOriginalMessage,
} from "@/discord";

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

  const discordUserId = interaction.member?.user?.id || interaction.user?.id;
  if (!discordUserId) {
    return NextResponse.json({
      type: 4,
      data: { content: "❌ Unable to identify Discord user.", flags: 64 },
    });
  }

  // Whitelist Verification
  const user = await getUserByDiscordId(discordUserId);

  // 3. Handle Application Commands (Type 2)
  if (interaction.type === 2) {
    const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
    const interactionToken = interaction.token;

    waitUntil(
      (async () => {
        if (!user) {
          await patchDiscordOriginalMessage(applicationId, interactionToken, {
            responsePayload: {
              embeds: [
                {
                  title: "🔒 Akses Terbatas yaa~ 🌸",
                  color: 0xff758f,
                  description:
                    "Maaf yaa manis, Ayaa Bot saat ini berstatus **Private Bot** dan hanya bisa digunakan oleh teman-teman yang sudah terdaftar di whitelist~ 🥺💕",
                },
              ],
            },
          });
          return;
        }

        await handleCommandInteraction(
          interaction,
          user,
          discordUserId,
          applicationId,
          interactionToken
        );
      })()
    );

    // Return deferred response immediately to Discord (< 25ms)
    return NextResponse.json({ type: 5 });
  }

  // 4. Handle Message Component Interactions (Buttons, Type 3)
  if (interaction.type === 3) {
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

    return await handleButtonInteraction(interaction, user, discordUserId);
  }

  return NextResponse.json({ error: "Unsupported interaction type" }, { status: 400 });
}
