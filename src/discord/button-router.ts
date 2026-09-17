import { NextResponse } from "next/server";
import { User } from "@/db/schema";
import {
  handleCommonButtons,
  handleHdButtons,
  handleFilterButtons,
  handleConvertButtons,
  handleWatermarkButtons,
  handleGiftButtons,
  handleCompressButtons,
  handleStitchButtons,
} from "./button-handlers";

export async function handleButtonInteraction(
  interaction: any,
  user: User,
  discordUserId: string
): Promise<NextResponse> {
  const customId = interaction.data?.custom_id || "";
  const [action] = customId.split(":");

  let response: NextResponse | null = null;

  if (action.startsWith("btn_")) {
    response = await handleCommonButtons(interaction, user, action, customId, discordUserId);
  } else if (action.startsWith("hd_")) {
    response = await handleHdButtons(interaction, user, action, customId);
  } else if (action.startsWith("fl_")) {
    response = await handleFilterButtons(interaction, user, action, customId);
  } else if (action.startsWith("cv_")) {
    response = await handleConvertButtons(interaction, user, action, customId);
  } else if (action.startsWith("wm_")) {
    response = await handleWatermarkButtons(interaction, user, action, customId);
  } else if (action.startsWith("gf_")) {
    response = await handleGiftButtons(interaction, user, action, customId, discordUserId);
  } else if (action.startsWith("cp_")) {
    response = await handleCompressButtons(interaction, user, action, customId);
  } else if (action.startsWith("st_")) {
    response = await handleStitchButtons(interaction, user, action, customId);
  }

  if (response) {
    return response;
  }

  return NextResponse.json({
    type: 4,
    data: { content: "❌ Unknown button interaction.", flags: 64 },
  });
}
