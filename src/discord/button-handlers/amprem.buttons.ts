import { NextResponse } from "next/server";
import { User } from "@/db/schema";
import { getAmPendingEmail } from "@/services/alight-motion.service";

export async function handleAmPremButtons(
  interaction: any,
  user: User,
  action: string,
  customId: string,
  discordUserId: string
): Promise<NextResponse | null> {
  // 1. Tombol Buka Modal Minta Link Email
  if (action === "am_btn_request") {
    const cachedEmail = getAmPendingEmail(discordUserId) || "";

    return NextResponse.json({
      type: 9, // MODAL
      data: {
        title: "📧 Minta Link Alight Motion",
        custom_id: "am_modal_request",
        components: [
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "am_input_email",
                label: "Email Akun Alight Motion",
                style: 1, // Short
                placeholder: "contoh: akunmu@gmail.com",
                min_length: 5,
                max_length: 100,
                required: true,
                value: cachedEmail || undefined,
              },
            ],
          },
        ],
      },
    });
  }

  // 2. Tombol Buka Modal Verifikasi Link
  if (action === "am_btn_verify") {
    // Cek apakah ada email yang tersimpan di customId (am_btn_verify:email@xyz) atau di session
    const [, emailParam] = customId.split(":");
    const cachedEmail = emailParam || getAmPendingEmail(discordUserId) || "";

    return NextResponse.json({
      type: 9, // MODAL
      data: {
        title: "🔗 Verifikasi Alight Motion Pro",
        custom_id: "am_modal_verify",
        components: [
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "am_input_email",
                label: "Email Akun Alight Motion",
                style: 1, // Short
                placeholder: "contoh: akunmu@gmail.com",
                min_length: 5,
                max_length: 100,
                required: true,
                value: cachedEmail || undefined,
              },
            ],
          },
          {
            type: 1,
            components: [
              {
                type: 4,
                custom_id: "am_input_link",
                label: "Tautan Verifikasi dari Email",
                style: 2, // Paragraph
                placeholder: "Tempel (paste) seluruh tautan panjang yang disalin dari tombol email di sini...",
                min_length: 10,
                max_length: 2000,
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
