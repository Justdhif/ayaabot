import { User } from "@/db/schema";
import { BOT_THEME, COMPRESS_MODES, STITCH_LAYOUTS, STITCH_BORDERS } from "@/config/constants";
import { handleHelpCommand } from "@/commands/help";
import { handleBalanceCommand } from "@/commands/balance";
import { handleClaimCommand } from "@/commands/claim";
import { handleHdCommand } from "@/commands/hd";
import { handleFilterCommand } from "@/commands/filter";
import { handleConvertCommand } from "@/commands/convert";
import { handleGiftCommand } from "@/commands/gift";
import { handleWatermarkCommand } from "@/commands/watermark";
import { handleAvatarCommand } from "@/commands/avatar";
import { handleCompressCommand } from "@/commands/compress";
import { handleStitchCommand } from "@/commands/stitch";
import {
  buildHdPanel,
  buildFilterPanel,
  buildConvertPanel,
  buildWatermarkPanel,
  buildGiftPanel,
  buildCompressPanel,
  buildStitchPanel,
} from "@/components/panels";
import { patchDiscordOriginalMessage } from "./client";

export async function handleCommandInteraction(
  interaction: any,
  user: User,
  discordUserId: string,
  applicationId: string,
  interactionToken: string
): Promise<void> {
  const commandName = interaction.data?.name;

  try {
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
        const response = await handleClaimCommand(discordUserId, interaction.guild_id);
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
                    "Jangan lupa sertakan foto yang mau disulap di kolom `image` yaa manis~ 🎀\n\n" +
                    "👉 *Contoh: Ketik `/hd image:` lalu upload fotomu, nanti panel tombol pilihan skala & mode akan muncul!* 💕",
                },
              ],
            },
          });
          break;
        }

        const scale = scaleOption?.value ? Number(scaleOption.value) : 2;
        const mode = (modeOption?.value as "sharp" | "soft") || "sharp";

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
                    "Jangan lupa sertakan foto yang mau diberi filter di kolom `image` yaa manis~ 🎀\n\n" +
                    "👉 *Contoh: Ketik `/filter image:` lalu upload fotomu, nanti panel tombol pilihan filter akan muncul!* 💕",
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
                    "Jangan lupa sertakan foto yang mau dikonversi di kolom `image` yaa manis~ 🎀\n\n" +
                    "👉 *Contoh: Ketik `/convert image:` lalu upload fotomu, nanti panel tombol format & kualitas akan muncul!* 💕",
                },
              ],
            },
          });
          break;
        }

        const format = formatOption?.value || "webp";
        const quality = qualityOption?.value ? Number(qualityOption.value) : 80;

        const panel = buildConvertPanel(user, attachment.url, format, quality);
        await patchDiscordOriginalMessage(applicationId, interactionToken, {
          responsePayload: panel,
        });
        break;
      }

      case "gift": {
        const options = interaction.data?.options || [];
        const userOption = options.find((opt: any) => opt.name === "user");
        const amountOption = options.find((opt: any) => opt.name === "amount");
        const resourceOption = options.find((opt: any) => opt.name === "resource");

        const targetDiscordId = userOption?.value;
        if (!targetDiscordId) {
          await patchDiscordOriginalMessage(applicationId, interactionToken, {
            responsePayload: {
              content: "❌ Sebutkan teman yang ingin kamu beri kado yaa manis! 🎀",
            },
          });
          break;
        }

        const resolvedUser = interaction.data?.resolved?.users?.[targetDiscordId];
        const targetUsername = resolvedUser?.username || "Teman Manis";
        const amount = amountOption?.value ? Number(amountOption.value) : 100;
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

      case "compress": {
        const options = interaction.data?.options || [];
        const imageOption = options.find((opt: any) => opt.name === "image");
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
                    "Jangan lupa sertakan foto yang mau kamu kompres di kolom `image` yaa manis~ 🎀\n\n" +
                    "👉 *Contoh: Ketik `/compress image:` lalu upload fotomu, nanti tombol target kompresi (<8MB dll) akan muncul!* 💕",
                },
              ],
            },
          });
          break;
        }

        const panel = buildCompressPanel(user, attachment.url, COMPRESS_MODES.AUTO_8MB, "webp");
        await patchDiscordOriginalMessage(applicationId, interactionToken, {
          responsePayload: panel,
        });
        break;
      }

      case "stitch":
      case "collage": {
        const options = interaction.data?.options || [];
        const attResolved = interaction.data?.resolved?.attachments || {};
        const imageUrls: string[] = [];

        for (const name of ["image1", "image2", "image3", "image4"]) {
          const opt = options.find((o: any) => o.name === name);
          if (opt?.value && attResolved[opt.value]?.url) {
            imageUrls.push(attResolved[opt.value].url);
          }
        }

        if (imageUrls.length < 2) {
          await patchDiscordOriginalMessage(applicationId, interactionToken, {
            responsePayload: {
              embeds: [
                {
                  title: "🌸 Butuh Minimal 2 Gambar Manis! 📷",
                  color: BOT_THEME.COLOR_ROSE,
                  description:
                    "Untuk menyatukan gambar (stitch/kolase), kamu perlu melampirkan minimal **2 gambar** di `image1` dan `image2` yaa manis~ 🎀\n\n" +
                    "Bisa sampai 4 gambar sekaligus lho! Cocok banget buat perbandingan *Before vs After* 💕",
                },
              ],
            },
          });
          break;
        }

        const panel = buildStitchPanel(
          user,
          imageUrls,
          STITCH_LAYOUTS.HORIZONTAL,
          STITCH_BORDERS.NONE
        );
        await patchDiscordOriginalMessage(applicationId, interactionToken, {
          responsePayload: panel,
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
}
