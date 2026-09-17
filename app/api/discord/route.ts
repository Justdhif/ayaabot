import { NextRequest, NextResponse } from "next/server";
import { verifyKey } from "discord-interactions";
import { waitUntil } from "@vercel/functions";
import {
  getUserByDiscordId,
  getUserRecentTransactions,
  refundUserBalance,
  rollbackGift,
} from "@/services/economy.service";
import { handleHelpCommand } from "@/commands/help";
import { handleBalanceCommand } from "@/commands/balance";
import { handleClaimCommand } from "@/commands/claim";
import { handleHdCommand } from "@/commands/hd";
import { handleFilterCommand } from "@/commands/filter";
import { handleConvertCommand } from "@/commands/convert";
import { handleGiftCommand } from "@/commands/gift";
import { handleWatermarkCommand } from "@/commands/watermark";
import { handleAvatarCommand } from "@/commands/avatar";
import { getDiscordAvatarUrl } from "@/services/avatar.service";
import { BOT_THEME, ECONOMY } from "@/config/constants";
import {
  buildHdPanel,
  buildFilterPanel,
  buildConvertPanel,
  buildWatermarkPanel,
  buildGiftPanel,
} from "@/components/discord-buttons";

export const maxDuration = 60; // Allow up to 60s execution for image processing

async function patchDiscordOriginalMessage(
  applicationId: string,
  token: string,
  result: {
    responsePayload: any;
    fileAttachment?: { buffer: Buffer; filename: string; contentType: string };
  }
): Promise<boolean> {
  const webhookUrl = `https://discord.com/api/v10/webhooks/${applicationId}/${token}/messages/@original`;
  const messageData = result.responsePayload.data || result.responsePayload;
  if (messageData && typeof messageData === "object" && messageData.components === undefined) {
    messageData.components = [];
  }

  try {
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
        const errorText = await patchRes.text().catch(() => "");
        console.error("Failed to patch message with file:", patchRes.status, errorText);
        return false;
      }
      return true;
    } else {
      const patchRes = await fetch(webhookUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!patchRes.ok) {
        const errorText = await patchRes.text().catch(() => "");
        console.error("Failed to patch message text:", patchRes.status, errorText);
        return false;
      }
      return true;
    }
  } catch (netErr) {
    console.error("Network error patching Discord message:", netErr);
    return false;
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
    const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
    const interactionToken = interaction.token;
    const discordUserId = interaction.member?.user?.id || interaction.user?.id;
    const commandName = interaction.data?.name;

    if (!discordUserId) {
      return NextResponse.json({
        type: 4,
        data: { content: "❌ Unable to identify Discord user." },
      });
    }

    waitUntil(
      (async () => {
        try {
          // Authorization Check: Whitelist verification against Neon database / in-memory cache
          const user = await getUserByDiscordId(discordUserId);
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

          // Command Dispatch
          switch (commandName) {
            case "help": {
              const response = handleHelpCommand();
              await patchDiscordOriginalMessage(applicationId, interactionToken, {
                responsePayload: response,
              });
              break;
            }

            case "balance": {
              const response = handleBalanceCommand(user);
              await patchDiscordOriginalMessage(applicationId, interactionToken, {
                responsePayload: response,
              });
              break;
            }

            case "claim": {
              const response = await handleClaimCommand(user.discordId, interaction.guild_id);
              await patchDiscordOriginalMessage(applicationId, interactionToken, {
                responsePayload: response,
              });
              break;
            }

            case "hd": {
              const options = interaction.data?.options || [];
              const imageOption = options.find((opt: any) => opt.name === "image");
              const scaleOption = options.find((opt: any) => opt.name === "scale");
              const modeOption = options.find((opt: any) => opt.name === "mode");

              const attachmentId = imageOption?.value;
              const attachment = interaction.data?.resolved?.attachments?.[attachmentId];

              if (!attachment || !attachment.url) {
                await patchDiscordOriginalMessage(applicationId, interactionToken, {
                  responsePayload: {
                    embeds: [
                      {
                        title: "🌸 Mana Fotonya Manis? 📷",
                        color: BOT_THEME.COLOR_ROSE,
                        description:
                          "Jangan lupa sertakan foto yang mau kamu sulap di kolom `image` yaa manis~ 🎀\n\n" +
                          "👉 *Contoh: Ketik `/hd image:` lalu upload fotomu, nanti panel tombol pilihan 2× / 4× dan karakternya akan langsung muncul!* 💕",
                      },
                    ],
                  },
                });
                break;
              }

              const scale = scaleOption ? Number(scaleOption.value) : 2;
              const mode = modeOption ? (modeOption.value as "sharp" | "soft") : "sharp";

              const panel = buildHdPanel(user, attachment.url, scale, mode);
              await patchDiscordOriginalMessage(applicationId, interactionToken, {
                responsePayload: panel,
              });
              break;
            }

            case "filter": {
              const options = interaction.data?.options || [];
              const imageOption = options.find((opt: any) => opt.name === "image");
              const presetOption = options.find((opt: any) => opt.name === "preset");

              const attachmentId = imageOption?.value;
              const attachment = interaction.data?.resolved?.attachments?.[attachmentId];

              if (!attachment || !attachment.url) {
                await patchDiscordOriginalMessage(applicationId, interactionToken, {
                  responsePayload: {
                    embeds: [
                      {
                        title: "🌸 Mana Fotonya Manis? 📷",
                        color: BOT_THEME.COLOR_ROSE,
                        description:
                          "Jangan lupa sertakan foto yang mau kamu beri filter di kolom `image` yaa manis~ 🎀\n\n" +
                          "👉 *Contoh: Ketik `/filter image:` lalu upload fotomu, nanti panel tombol preset filter aesthetic akan muncul!* 💕",
                      },
                    ],
                  },
                });
                break;
              }

              const preset = presetOption?.value || "pink_glow";
              const panel = buildFilterPanel(user, attachment.url, preset);
              await patchDiscordOriginalMessage(applicationId, interactionToken, {
                responsePayload: panel,
              });
              break;
            }

            case "convert": {
              const options = interaction.data?.options || [];
              const imageOption = options.find((opt: any) => opt.name === "image");
              const formatOption = options.find((opt: any) => opt.name === "format");
              const qualityOption = options.find((opt: any) => opt.name === "quality");

              const attachmentId = imageOption?.value;
              const attachment = interaction.data?.resolved?.attachments?.[attachmentId];

              if (!attachment || !attachment.url) {
                await patchDiscordOriginalMessage(applicationId, interactionToken, {
                  responsePayload: {
                    embeds: [
                      {
                        title: "🌸 Mana Fotonya Manis? 📷",
                        color: BOT_THEME.COLOR_ROSE,
                        description:
                          "Jangan lupa sertakan foto yang mau kamu konversi di kolom `image` yaa manis~ 🎀\n\n" +
                          "👉 *Contoh: Ketik `/convert image:` lalu upload fotomu, nanti tombol format WebP/PNG/JPG akan muncul!* 💕",
                      },
                    ],
                  },
                });
                break;
              }

              const format = formatOption?.value || "webp";
              const quality = qualityOption ? Number(qualityOption.value) : 80;

              const panel = buildConvertPanel(user, attachment.url, format, quality);
              await patchDiscordOriginalMessage(applicationId, interactionToken, {
                responsePayload: panel,
              });
              break;
            }

            case "gift": {
              const options = interaction.data?.options || [];
              const userOption = options.find((opt: any) => opt.name === "user" || opt.name === "target");
              const amountOption = options.find((opt: any) => opt.name === "amount");
              const resourceOption = options.find((opt: any) => opt.name === "resource");

              const targetDiscordId = userOption?.value;
              if (!targetDiscordId) {
                await patchDiscordOriginalMessage(applicationId, interactionToken, {
                  responsePayload: {
                    embeds: [
                      {
                        title: "🌸 Mau Kirim Kado ke Siapa Manis? 🎁",
                        color: BOT_THEME.COLOR_ROSE,
                        description:
                          "Silakan pilih teman yang mau kamu kirimi kado di kolom `user` yaa manis~ 🎀\n\n" +
                          "👉 *Contoh: Ketik `/gift user: @teman`, nanti panel tombol pilih saldo & nominal kado akan langsung muncul!* 💕",
                      },
                    ],
                  },
                });
                break;
              }

              const resolvedTargetUser = interaction.data?.resolved?.users?.[targetDiscordId];
              const targetUsername =
                resolvedTargetUser?.global_name || resolvedTargetUser?.username || "Teman Manis";

              const amount = amountOption ? Math.max(1, Number(amountOption.value)) : 100;
              const resource = (resourceOption?.value as "money" | "limit") || "money";

              const panel = buildGiftPanel(user, targetDiscordId, targetUsername, resource, amount);
              await patchDiscordOriginalMessage(applicationId, interactionToken, {
                responsePayload: panel,
              });
              break;
            }

            case "watermark": {
              const options = interaction.data?.options || [];
              const imageOption = options.find((opt: any) => opt.name === "image");
              const textOption = options.find((opt: any) => opt.name === "text");
              const posOption = options.find((opt: any) => opt.name === "position");
              const opacityOption = options.find((opt: any) => opt.name === "opacity");

              const attachmentId = imageOption?.value;
              const attachment = interaction.data?.resolved?.attachments?.[attachmentId];

              if (!attachment || !attachment.url) {
                await patchDiscordOriginalMessage(applicationId, interactionToken, {
                  responsePayload: {
                    embeds: [
                      {
                        title: "🌸 Mana Fotonya Manis? 📷",
                        color: BOT_THEME.COLOR_ROSE,
                        description:
                          "Jangan lupa sertakan foto yang mau kamu beri watermark di kolom `image` yaa manis~ 🎀\n\n" +
                          "👉 *Contoh: Ketik `/watermark image:` lalu upload fotomu, nanti panel tombol posisi & kepekatan akan muncul!* 💕",
                      },
                    ],
                  },
                });
                break;
              }

              const wmText = textOption?.value || `@${user.username || "Ayaa Bot"}`;
              const position = posOption?.value || "bottom_right";
              const opacity = opacityOption?.value || "normal";

              const panel = buildWatermarkPanel(user, attachment.url, opacity, position, wmText);
              await patchDiscordOriginalMessage(applicationId, interactionToken, {
                responsePayload: panel,
              });
              break;
            }

            // Message Context Menu Command (Klik kanan foto di chat -> Apps -> Watermark Foto)
            case "Watermark Foto": {
              const targetMessageId = interaction.data?.target_id;
              const targetMessage = interaction.data?.resolved?.messages?.[targetMessageId];
              const attachment = targetMessage?.attachments?.[0];

              if (!attachment || !attachment.url) {
                await patchDiscordOriginalMessage(applicationId, interactionToken, {
                  responsePayload: {
                    embeds: [
                      {
                        title: "🌸 Mana Fotonya Manis? 📷",
                        color: BOT_THEME.COLOR_ROSE,
                        description: "Pesan yang kamu pilih tidak memiliki lampiran foto yaa manis~ 🥺",
                      },
                    ],
                  },
                });
                break;
              }

              const panel = buildWatermarkPanel(user, attachment.url);
              await patchDiscordOriginalMessage(applicationId, interactionToken, {
                responsePayload: panel,
              });
              break;
            }

            case "avatar": {
              const options = interaction.data?.options || [];
              const userOption = options.find((opt: any) => opt.name === "user");
              const serverOption = options.find((opt: any) => opt.name === "server");

              if (serverOption?.value === true) {
                const avatarRes = handleAvatarCommand({
                  isServerIcon: true,
                  guildId: interaction.guild_id,
                  guildIconHash: interaction.guild?.icon,
                  guildName: interaction.guild?.name,
                });
                await patchDiscordOriginalMessage(applicationId, interactionToken, {
                  responsePayload: avatarRes,
                });
                break;
              }

              let targetUser = interaction.member?.user || interaction.user;
              if (userOption?.value) {
                targetUser = interaction.data?.resolved?.users?.[userOption.value] || targetUser;
              }

              const avatarRes = handleAvatarCommand({ targetUser });
              await patchDiscordOriginalMessage(applicationId, interactionToken, {
                responsePayload: avatarRes,
              });
              break;
            }

            default: {
              await patchDiscordOriginalMessage(applicationId, interactionToken, {
                responsePayload: {
                  content: `❌ Unknown command: \`/${commandName}\``,
                },
              });
              break;
            }
          }
        } catch (cmdErr) {
          console.error(`Unexpected command error for /${commandName}:`, cmdErr);
          await patchDiscordOriginalMessage(applicationId, interactionToken, {
            responsePayload: {
              embeds: [
                {
                  title: "😿 Ups, Ayaa Mengalami Sedikit Kendala",
                  color: BOT_THEME.COLOR_ROSE,
                  description:
                    "Maaf yaa manis, terjadi kendala saat memproses perintahmu. Silakan coba beberapa saat lagi yaa~ 🌸",
                },
              ],
            },
          });
        }
      })()
    );

    return NextResponse.json({ type: 5 });
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
      const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
      const interactionToken = interaction.token;

      waitUntil(
        (async () => {
          try {
            const claimResult = await handleClaimCommand(discordUserId, interaction.guild_id);
            await patchDiscordOriginalMessage(applicationId, interactionToken, {
              responsePayload: claimResult,
            });
          } catch (claimErr) {
            console.error("Background button claim error:", claimErr);
          }
        })()
      );

      return NextResponse.json({ type: 6 });
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

    // Button 3: Upscale Avatar to 2x HD
    if (action === "btn_hd_avatar") {
      const targetUserId = customId.split(":")[1] || discordUserId;
      const avatarUrl = getDiscordAvatarUrl(targetUserId, null, 2048);

      const avatarAttachment = {
        id: "avatar",
        filename: `${targetUserId}_avatar.png`,
        url: avatarUrl,
        size: 0,
      };

      const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
      const interactionToken = interaction.token;

      waitUntil(
        (async () => {
          try {
            const hdResult = await handleHdCommand(user, avatarAttachment, { scale: 2, mode: "sharp" });
            const delivered = await patchDiscordOriginalMessage(applicationId, interactionToken, hdResult);

            if (!delivered && hdResult.fileAttachment) {
              await refundUserBalance(
                user.id,
                ECONOMY.HD_COST_MONEY_2X,
                ECONOMY.HD_COST_LIMIT_2X,
                "Discord gagal mengirim HD Avatar"
              );
            }
          } catch (err) {
            console.error("Avatar HD upscale error:", err);
          }
        })()
      );

      return NextResponse.json({ type: 5 });
    }

    // ---------------------------------------------------------
    // Interactive Panel Buttons: HD (Sulap Foto)
    // ---------------------------------------------------------
    if (action === "hd_sw") {
      const [, scaleStr, mode] = customId.split(":");
      const scale = Number(scaleStr) || 2;
      const imageUrl =
        interaction.message?.embeds?.[0]?.image?.url ||
        interaction.message?.attachments?.[0]?.url ||
        "";
      const panel = buildHdPanel(user, imageUrl, scale, mode as "sharp" | "soft");
      return NextResponse.json({ type: 7, data: panel });
    }

    if (action === "hd_run") {
      const [, scaleStr, mode] = customId.split(":");
      const scale = Number(scaleStr) || 2;
      const imageUrl =
        interaction.message?.embeds?.[0]?.image?.url ||
        interaction.message?.attachments?.[0]?.url ||
        "";

      if (!imageUrl) {
        return NextResponse.json({
          type: 4,
          data: { content: "❌ URL gambar tidak ditemukan.", flags: 64 },
        });
      }

      const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
      const interactionToken = interaction.token;

      waitUntil(
        (async () => {
          try {
            const attachment = {
              id: "hd_img",
              filename: "photo.png",
              url: imageUrl,
              size: 0,
            };
            const hdResult = await handleHdCommand(user, attachment, {
              scale,
              mode: mode as "sharp" | "soft",
            });
            const delivered = await patchDiscordOriginalMessage(
              applicationId,
              interactionToken,
              hdResult
            );

            if (!delivered && hdResult.fileAttachment) {
              const costMoney =
                scale === 4 ? ECONOMY.HD_COST_MONEY_4X : ECONOMY.HD_COST_MONEY_2X;
              const costLimit =
                scale === 4 ? ECONOMY.HD_COST_LIMIT_4X : ECONOMY.HD_COST_LIMIT_2X;
              await refundUserBalance(
                user.id,
                costMoney,
                costLimit,
                "Discord gagal mengirim file HD"
              );
            }
          } catch (err) {
            console.error("Background HD button execution error:", err);
          }
        })()
      );

      return NextResponse.json({
        type: 7,
        data: {
          embeds: [
            {
              title: "⏳ Sedang Menyulap Foto Kamu Menjadi HD... 🌸",
              color: BOT_THEME.COLOR_PINK,
              description:
                `Ayaa sedang memproses fotomu dengan skala **${scale}×** (${mode})~ ✨\n\n` +
                "Tunggu sebentar yaa manis, hasilnya akan segera dikirimkan! 💕",
              image: { url: imageUrl },
            },
          ],
          components: [],
        },
      });
    }

    // ---------------------------------------------------------
    // Interactive Panel Buttons: Filter
    // ---------------------------------------------------------
    if (action === "fl_sw") {
      const [, preset] = customId.split(":");
      const imageUrl =
        interaction.message?.embeds?.[0]?.image?.url ||
        interaction.message?.attachments?.[0]?.url ||
        "";
      const panel = buildFilterPanel(user, imageUrl, preset);
      return NextResponse.json({ type: 7, data: panel });
    }

    if (action === "fl_run") {
      const [, preset] = customId.split(":");
      const imageUrl =
        interaction.message?.embeds?.[0]?.image?.url ||
        interaction.message?.attachments?.[0]?.url ||
        "";

      if (!imageUrl) {
        return NextResponse.json({
          type: 4,
          data: { content: "❌ URL gambar tidak ditemukan.", flags: 64 },
        });
      }

      const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
      const interactionToken = interaction.token;

      waitUntil(
        (async () => {
          try {
            const attachment = {
              id: "filter_img",
              filename: "photo.png",
              url: imageUrl,
              size: 0,
            };
            const filterResult = await handleFilterCommand(user, attachment, preset);
            const delivered = await patchDiscordOriginalMessage(
              applicationId,
              interactionToken,
              filterResult
            );

            if (!delivered && filterResult.fileAttachment) {
              await refundUserBalance(
                user.id,
                ECONOMY.FILTER_COST_MONEY,
                0,
                "Discord gagal mengirim file Filter"
              );
            }
          } catch (err) {
            console.error("Background Filter button execution error:", err);
          }
        })()
      );

      return NextResponse.json({
        type: 7,
        data: {
          embeds: [
            {
              title: "⏳ Sedang Menerapkan Filter Aesthetic... 🌸",
              color: BOT_THEME.COLOR_PURPLE,
              description: `Ayaa sedang memberi sentuhan filter **${preset}** pada fotomu~ ✨\nTunggu sebentar yaa manis! 💕`,
              image: { url: imageUrl },
            },
          ],
          components: [],
        },
      });
    }

    // ---------------------------------------------------------
    // Interactive Panel Buttons: Convert
    // ---------------------------------------------------------
    if (action === "cv_sw") {
      const [, format, qualityStr] = customId.split(":");
      const quality = Number(qualityStr) || 80;
      const imageUrl =
        interaction.message?.embeds?.[0]?.image?.url ||
        interaction.message?.attachments?.[0]?.url ||
        "";
      const panel = buildConvertPanel(user, imageUrl, format, quality);
      return NextResponse.json({ type: 7, data: panel });
    }

    if (action === "cv_run") {
      const [, format, qualityStr] = customId.split(":");
      const quality = Number(qualityStr) || 80;
      const imageUrl =
        interaction.message?.embeds?.[0]?.image?.url ||
        interaction.message?.attachments?.[0]?.url ||
        "";

      if (!imageUrl) {
        return NextResponse.json({
          type: 4,
          data: { content: "❌ URL gambar tidak ditemukan.", flags: 64 },
        });
      }

      const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
      const interactionToken = interaction.token;

      waitUntil(
        (async () => {
          try {
            const attachment = {
              id: "convert_img",
              filename: "photo.png",
              url: imageUrl,
              size: 0,
            };
            const convertResult = await handleConvertCommand(user, attachment, {
              format,
              quality,
            });
            const delivered = await patchDiscordOriginalMessage(
              applicationId,
              interactionToken,
              convertResult
            );

            if (!delivered && convertResult.fileAttachment) {
              await refundUserBalance(
                user.id,
                ECONOMY.CONVERT_COST_MONEY,
                0,
                "Discord gagal mengirim file Convert"
              );
            }
          } catch (err) {
            console.error("Background Convert button execution error:", err);
          }
        })()
      );

      return NextResponse.json({
        type: 7,
        data: {
          embeds: [
            {
              title: "⏳ Sedang Mengonversi & Mengompres Foto... 📦",
              color: BOT_THEME.COLOR_SKY,
              description: `Ayaa sedang memproses konversi ke format **${format.toUpperCase()}** (${quality}% kualitas)~ ✨`,
              image: { url: imageUrl },
            },
          ],
          components: [],
        },
      });
    }

    // ---------------------------------------------------------
    // Interactive Panel Buttons: Watermark
    // ---------------------------------------------------------
    if (action === "wm_sw") {
      const [, opacity, position] = customId.split(":");
      const imageUrl =
        interaction.message?.embeds?.[0]?.image?.url ||
        interaction.message?.attachments?.[0]?.url ||
        "";
      const footerText = interaction.message?.embeds?.[0]?.footer?.text || "";
      const textMatch = footerText.match(/text=(.+)$/);
      const activeText = textMatch ? textMatch[1] : `@${user.username || "Ayaa Bot"}`;

      const panel = buildWatermarkPanel(user, imageUrl, opacity, position, activeText);
      return NextResponse.json({ type: 7, data: panel });
    }

    if (action === "wm_run") {
      const [, opacity, position] = customId.split(":");
      const imageUrl =
        interaction.message?.embeds?.[0]?.image?.url ||
        interaction.message?.attachments?.[0]?.url ||
        "";
      const footerText = interaction.message?.embeds?.[0]?.footer?.text || "";
      const textMatch = footerText.match(/text=(.+)$/);
      const activeText = textMatch ? textMatch[1] : `@${user.username || "Ayaa Bot"}`;

      if (!imageUrl) {
        return NextResponse.json({
          type: 4,
          data: { content: "❌ URL gambar tidak ditemukan.", flags: 64 },
        });
      }

      const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
      const interactionToken = interaction.token;

      waitUntil(
        (async () => {
          try {
            const attachment = {
              id: "wm_img",
              filename: "photo.png",
              url: imageUrl,
              size: 0,
            };
            const wmResult = await handleWatermarkCommand(user, attachment, {
              text: activeText,
              position,
              opacity,
            });
            const delivered = await patchDiscordOriginalMessage(
              applicationId,
              interactionToken,
              wmResult
            );

            if (!delivered && wmResult.fileAttachment) {
              await refundUserBalance(
                user.id,
                ECONOMY.WATERMARK_COST_MONEY,
                0,
                "Discord gagal mengirim file Watermark"
              );
            }
          } catch (err) {
            console.error("Background Watermark button execution error:", err);
          }
        })()
      );

      return NextResponse.json({
        type: 7,
        data: {
          embeds: [
            {
              title: "⏳ Sedang Menempelkan Watermark... 🎨",
              color: BOT_THEME.COLOR_ROSE,
              description: `Ayaa sedang menempelkan watermark \`${activeText}\` pada fotomu~ ✨\nTunggu sebentar yaa manis! 💕`,
              image: { url: imageUrl },
            },
          ],
          components: [],
        },
      });
    }

    // ---------------------------------------------------------
    // Interactive Panel Buttons: Gift
    // ---------------------------------------------------------
    if (action === "gf_sw") {
      const [, resource, amountStr, targetId] = customId.split(":");
      const amount = Number(amountStr) || 100;
      const footerText = interaction.message?.embeds?.[0]?.footer?.text || "";
      const nameMatch = footerText.match(/Gift to: (.+) \(/);
      const targetUsername = nameMatch ? nameMatch[1] : "Teman Manis";

      const panel = buildGiftPanel(
        user,
        targetId,
        targetUsername,
        resource as "money" | "limit",
        amount
      );
      return NextResponse.json({ type: 7, data: panel });
    }

    if (action === "gf_add") {
      const [, adderStr, resource, amountStr, targetId] = customId.split(":");
      const newAmount = (Number(amountStr) || 0) + (Number(adderStr) || 0);
      const footerText = interaction.message?.embeds?.[0]?.footer?.text || "";
      const nameMatch = footerText.match(/Gift to: (.+) \(/);
      const targetUsername = nameMatch ? nameMatch[1] : "Teman Manis";

      const panel = buildGiftPanel(
        user,
        targetId,
        targetUsername,
        resource as "money" | "limit",
        newAmount
      );
      return NextResponse.json({ type: 7, data: panel });
    }

    if (action === "gf_rst") {
      const [, resource, targetId] = customId.split(":");
      const footerText = interaction.message?.embeds?.[0]?.footer?.text || "";
      const nameMatch = footerText.match(/Gift to: (.+) \(/);
      const targetUsername = nameMatch ? nameMatch[1] : "Teman Manis";

      const panel = buildGiftPanel(
        user,
        targetId,
        targetUsername,
        resource as "money" | "limit",
        100
      );
      return NextResponse.json({ type: 7, data: panel });
    }

    if (action === "gf_run") {
      const [, resource, amountStr, targetId] = customId.split(":");
      const amount = Number(amountStr) || 100;
      const footerText = interaction.message?.embeds?.[0]?.footer?.text || "";
      const nameMatch = footerText.match(/Gift to: (.+) \(/);
      const targetUsername = nameMatch ? nameMatch[1] : "Teman Manis";

      const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
      const interactionToken = interaction.token;

      waitUntil(
        (async () => {
          try {
            const giftResult = await handleGiftCommand(
              discordUserId,
              targetId,
              amount,
              resource as "money" | "limit",
              undefined,
              targetUsername
            );

            const delivered = await patchDiscordOriginalMessage(
              applicationId,
              interactionToken,
              {
                responsePayload: giftResult,
              }
            );

            if (!delivered) {
              const targetUserObj = await getUserByDiscordId(targetId);
              if (targetUserObj) {
                await rollbackGift(
                  user.id,
                  targetUserObj.id,
                  amount,
                  resource as any,
                  "Discord webhook gagal mengirim kado"
                );
              }
            }
          } catch (err) {
            console.error("Background Gift button error:", err);
          }
        })()
      );

      return NextResponse.json({
        type: 7,
        data: {
          embeds: [
            {
              title: "⏳ Sedang Mengirim Kado Manis... 🎁",
              color: BOT_THEME.COLOR_PINK,
              description: `Ayaa sedang memproses pengiriman **${amount.toLocaleString("id-ID")} ${resource === "limit" ? "Tiket Limit" : "Money"}** untuk <@${targetId}>~ ✨`,
            },
          ],
          components: [],
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
