import { NextResponse } from "next/server";
import { User } from "@/db/schema";
import { handleAmPremModals } from "./modal-handlers/amprem.modal";
import { handleBypassModals } from "./modal-handlers/bypass.modal";

export async function handleModalInteraction(
  interaction: any,
  user: User,
  discordUserId: string
): Promise<NextResponse> {
  const customId = interaction.data?.custom_id || "";

  let response: NextResponse | null = null;

  if (customId.startsWith("am_modal_")) {
    response = await handleAmPremModals(interaction, user, customId, discordUserId);
  } else if (customId.startsWith("bp_modal_")) {
    response = await handleBypassModals(interaction, user, customId, discordUserId);
  }

  if (response) {
    return response;
  }

  return NextResponse.json({
    type: 4,
    data: { content: "❌ Unknown modal submission.", flags: 64 },
  });
}
