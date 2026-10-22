import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { User } from "@/db/schema";
import {
  sendVerificationLink,
  verifyMagicLink,
  findAlightPresets,
  setAmPendingEmail,
  getAmPendingEmail,
  clearAmPendingEmail,
} from "@/services/alight-motion.service";
import {
  buildAmPremLinkSentPanel,
  buildAmPremSuccessPanel,
  buildAmPremErrorPanel,
  buildPresetResultPanel,
  buildPresetNotFoundPanel,
  buildPresetErrorPanel,
} from "@/components/panels";
import { patchDiscordOriginalMessage } from "../client";

export function getModalInputValue(interaction: any, fieldCustomId: string): string {
  const rows = interaction.data?.components || [];
  for (const row of rows) {
    for (const comp of row.components || []) {
      if (comp.custom_id === fieldCustomId) {
        return comp.value?.trim() || "";
      }
    }
  }
  return "";
}

export async function handleAmPremModals(
  interaction: any,
  user: User,
  customId: string,
  discordUserId: string
): Promise<NextResponse | null> {
  const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
  const interactionToken = interaction.token;

  // 1. Submit Modal: Minta Link Email
  if (customId === "am_modal_request") {
    const email = getModalInputValue(interaction, "am_input_email");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      waitUntil(
        (async () => {
          await patchDiscordOriginalMessage(applicationId, interactionToken, {
            responsePayload: buildAmPremErrorPanel(
              `Format email "${email}" tidak valid. Harap periksa kembali penulisan alamat email Anda.`,
              email
            ),
          });
        })()
      );
      return NextResponse.json({ type: 6 });
    }

    waitUntil(
      (async () => {
        try {
          await sendVerificationLink(email, discordUserId);

          const panel = buildAmPremLinkSentPanel(email);
          await patchDiscordOriginalMessage(applicationId, interactionToken, {
            responsePayload: panel,
          });
        } catch (err: any) {
          console.error("Error sending AM verification link:", err);
          const errorMsg = err?.message || "Gagal menghubungi server Alight Motion.";
          await patchDiscordOriginalMessage(applicationId, interactionToken, {
            responsePayload: buildAmPremErrorPanel(errorMsg, email),
          });
        }
      })()
    );

    return NextResponse.json({ type: 6 });
  }

  // 2. Submit Modal: Verifikasi Link Magic Link
  if (customId === "am_modal_verify") {
    let email = getModalInputValue(interaction, "am_input_email");
    const magicLink = getModalInputValue(interaction, "am_input_link");

    if (!email) {
      email = getAmPendingEmail(discordUserId) || "";
    }

    if (!email || !magicLink) {
      waitUntil(
        (async () => {
          await patchDiscordOriginalMessage(applicationId, interactionToken, {
            responsePayload: buildAmPremErrorPanel(
              "Email atau link verifikasi tidak boleh kosong. Harap isi kedua formulir.",
              email
            ),
          });
        })()
      );
      return NextResponse.json({ type: 6 });
    }

    waitUntil(
      (async () => {
        try {
          const result = await verifyMagicLink(email, magicLink, discordUserId);

          if (result.isPremium) {
            clearAmPendingEmail(discordUserId);
            const panel = buildAmPremSuccessPanel(result.userData);
            await patchDiscordOriginalMessage(applicationId, interactionToken, {
              responsePayload: panel,
            });
          } else {
            const errorMsg = result.premiumError || "Akun login berhasil, namun gagal mengaitkan lisensi Pro VIP.";
            await patchDiscordOriginalMessage(applicationId, interactionToken, {
              responsePayload: buildAmPremErrorPanel(errorMsg, email),
            });
          }
        } catch (err: any) {
          console.error("Error verifying AM magic link:", err);
          const errorMsg = err?.message || "Tautan tidak valid atau sudah kedaluwarsa.";
          await patchDiscordOriginalMessage(applicationId, interactionToken, {
            responsePayload: buildAmPremErrorPanel(errorMsg, email),
          });
        }
      })()
    );

    return NextResponse.json({ type: 6 });
  }

  // 3. Submit Modal: Cari Preset TikTok
  if (customId === "am_modal_find_preset") {
    const tiktokUrl = getModalInputValue(interaction, "am_input_tiktok_url");

    if (!tiktokUrl || (!tiktokUrl.includes("tiktok.com") && !tiktokUrl.includes("douyin"))) {
      waitUntil(
        (async () => {
          await patchDiscordOriginalMessage(applicationId, interactionToken, {
            responsePayload: buildPresetErrorPanel(
              "URL tidak valid. Pastikan kamu menyertakan link video TikTok seperti: https://vt.tiktok.com/xxxx/ atau https://www.tiktok.com/@user/video/xxxx"
            ),
          });
        })()
      );
      return NextResponse.json({ type: 6 });
    }

    waitUntil(
      (async () => {
        try {
          const result = await findAlightPresets(tiktokUrl);

          if (result.totalPresetsFound > 0) {
            const panel = buildPresetResultPanel(result, tiktokUrl);
            await patchDiscordOriginalMessage(applicationId, interactionToken, {
              responsePayload: panel,
            });
          } else {
            const panel = buildPresetNotFoundPanel(result, tiktokUrl);
            await patchDiscordOriginalMessage(applicationId, interactionToken, {
              responsePayload: panel,
            });
          }
        } catch (err: any) {
          console.error("Error finding presets from TikTok:", err);
          const errorMsg = err?.message || "Gagal memindai video TikTok.";
          await patchDiscordOriginalMessage(applicationId, interactionToken, {
            responsePayload: buildPresetErrorPanel(errorMsg),
          });
        }
      })()
    );

    return NextResponse.json({ type: 6 });
  }

  return null;
}
