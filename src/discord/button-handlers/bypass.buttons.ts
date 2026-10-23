import { NextResponse } from "next/server";
import { User } from "@/db/schema";

export async function handleBypassButtons(
  interaction: any,
  user: User,
  action: string,
  customId: string,
  discordUserId: string
): Promise<NextResponse | null> {
  // Tombol Buka Modal Bypass Link
  if (action === "bp_btn_open_modal") {
    return NextResponse.json({
      type: 9, // MODAL
      data: {
        title: "🔓 Bypass Shortlink / Ad-Link",
        custom_id: "bp_modal_submit",
        components: [
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "bp_input_url",
                label: "Link Iklan / Shortlink / File",
                style: 1, // Short
                placeholder: "Tempel link: https://sub2unlock.com/... atau https://mediafire.com/...",
                min_length: 5,
                max_length: 1000,
                required: true,
              },
            ],
          },
        ],
      },
    });
  }

  return null;
}
