import { NextResponse } from "next/server";
import { waitUntil } from "@vercel/functions";
import { User } from "@/db/schema";
import { bypassLink, normalizeInputUrl } from "@/services/bypass.service";
import { buildBypassSuccessPanel, buildBypassErrorPanel } from "@/components/panels";
import { patchDiscordOriginalMessage } from "../client";
import { getModalInputValue } from "./amprem.modal";

export async function handleBypassModals(
  interaction: any,
  user: User,
  customId: string,
  discordUserId: string
): Promise<NextResponse | null> {
  const applicationId = interaction.application_id || process.env.DISCORD_CLIENT_ID;
  const interactionToken = interaction.token;

  if (customId === "bp_modal_submit") {
    const rawInput = getModalInputValue(interaction, "bp_input_url");
    const inputUrl = normalizeInputUrl(rawInput);

    if (!inputUrl || (!inputUrl.startsWith("http://") && !inputUrl.startsWith("https://"))) {
      waitUntil(
        (async () => {
          await patchDiscordOriginalMessage(applicationId, interactionToken, {
            responsePayload: buildBypassErrorPanel(
              "URL tidak valid. Masukkan tautan web seperti: https://sfl.gl/xxxx atau https://mediafire.com/file/xxxx",
              rawInput
            ),
          });
        })()
      );
      return NextResponse.json({ type: 6 });
    }

    waitUntil(
      (async () => {
        try {
          const result = await bypassLink(inputUrl);
          const panel = buildBypassSuccessPanel(result);
          await patchDiscordOriginalMessage(applicationId, interactionToken, {
            responsePayload: panel,
          });
        } catch (err: any) {
          console.error("Error bypassing link:", err);
          const errorMsg = err?.message || "Gagal melewati link.";
          await patchDiscordOriginalMessage(applicationId, interactionToken, {
            responsePayload: buildBypassErrorPanel(errorMsg, inputUrl),
          });
        }
      })()
    );

    return NextResponse.json({ type: 6 });
  }

  return null;
}
