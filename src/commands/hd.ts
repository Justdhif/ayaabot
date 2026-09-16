import { db } from "../db";
import { usageLogs, User } from "../db/schema";
import { ECONOMY } from "../config/constants";
import { checkHdCooldown } from "../services/ratelimit.service";
import { validateAndExtractImage } from "../services/image.service";
import { upscaleImage } from "../services/upscaler.service";
import { deductForHd } from "../services/economy.service";

export interface AttachmentOption {
  id: string;
  filename: string;
  url: string;
  size: number;
  content_type?: string;
  width?: number;
  height?: number;
}

export interface HdExecutionResult {
  isDeferred?: boolean;
  responsePayload: any;
  fileAttachment?: {
    buffer: Buffer;
    filename: string;
    contentType: string;
  };
}

export async function handleHdCommand(
  user: User,
  attachment?: AttachmentOption
): Promise<HdExecutionResult> {
  // 1. Check Rate Limit (15 seconds per user)
  const cooldown = checkHdCooldown(user.lastHdAt);
  if (!cooldown.canExecute) {
    return {
      responsePayload: {
        type: 4,
        data: {
          content: `⏳ Please wait ${cooldown.formattedRemaining} before using /hd again.`,
        },
      },
    };
  }

  // 2. Check Resources (Money & Limit)
  if (user.money < ECONOMY.HD_COST_MONEY) {
    return {
      responsePayload: {
        type: 4,
        data: {
          content: `💰 **Insufficient Money.**\n\nRequired: ${ECONOMY.HD_COST_MONEY}\nYour balance: ${user.money}`,
        },
      },
    };
  }

  if (user.limitCount < ECONOMY.HD_COST_LIMIT) {
    return {
      responsePayload: {
        type: 4,
        data: {
          content: `🎟️ **Insufficient Limit.**\n\nRequired: ${ECONOMY.HD_COST_LIMIT}\nYour limit: ${user.limitCount}\n\nUse \`/claim\` to get more.`,
        },
      },
    };
  }

  // 3. Validate Attachment presence
  if (!attachment || !attachment.url) {
    return {
      responsePayload: {
        type: 4,
        data: {
          content: "❌ Please provide an image to upscale using the `image` parameter.",
        },
      },
    };
  }

  // 4. Validate Image Format and File Size
  const validation = await validateAndExtractImage(
    attachment.url,
    attachment.content_type,
    attachment.size
  );

  if (!validation.valid || !validation.buffer || !validation.width || !validation.height) {
    return {
      responsePayload: {
        type: 4,
        data: {
          content: `❌ ${validation.error || "Please upload a valid image."}\n\nSupported formats: PNG, JPG, JPEG, WEBP. Max size: 10 MB.`,
        },
      },
    };
  }

  // 5. Upscale Processing
  const upscaleResult = await upscaleImage({
    imageBuffer: validation.buffer,
    originalWidth: validation.width,
    originalHeight: validation.height,
  });

  // 6. Handle Upscale Failure (No resources deducted)
  if (!upscaleResult.success || !upscaleResult.outputBuffer) {
    // Record FAILED usage log
    await db.insert(usageLogs).values({
      userId: user.id,
      originalFilename: attachment.filename || "image.png",
      originalWidth: validation.width,
      originalHeight: validation.height,
      outputWidth: null,
      outputHeight: null,
      scale: upscaleResult.scale,
      status: "FAILED",
      processingTimeMs: upscaleResult.processingTimeMs,
    });

    return {
      responsePayload: {
        type: 4,
        data: {
          content:
            "❌ Failed to upscale your image.\n\nYour resources were not deducted. Please try again later.",
        },
      },
    };
  }

  // 7. Upscale Success -> Deduct Money & Limit atomically
  const deductResult = await deductForHd(user.id);
  if (!deductResult.success || !deductResult.user) {
    return {
      responsePayload: {
        type: 4,
        data: {
          content: "❌ Failed to process transaction. Your resources were not deducted.",
        },
      },
    };
  }

  const updatedUser = deductResult.user;

  // 8. Record SUCCESS usage log
  await db.insert(usageLogs).values({
    userId: user.id,
    originalFilename: attachment.filename || "image.png",
    originalWidth: validation.width,
    originalHeight: validation.height,
    outputWidth: upscaleResult.outputWidth,
    outputHeight: upscaleResult.outputHeight,
    scale: upscaleResult.scale,
    status: "SUCCESS",
    processingTimeMs: upscaleResult.processingTimeMs,
  });

  // Prepare result output
  const outputFilename = `cuanhd_2x_${attachment.filename || "upscaled.png"}`;

  return {
    responsePayload: {
      type: 4,
      data: {
        embeds: [
          {
            title: "✨ Image Upscaled Successfully!",
            color: 0x5865f2,
            description: `**Original:** ${validation.width}x${validation.height}\n` +
              `**Output (2×):** ${upscaleResult.outputWidth}x${upscaleResult.outputHeight}\n` +
              `**Processing Time:** ${(upscaleResult.processingTimeMs / 1000).toFixed(2)}s\n\n` +
              `**Balance Remaining:**\n💰 Money: **${updatedUser.money.toLocaleString("en-US")}** (-100)\n` +
              `🎟️ Limit: **${updatedUser.limitCount.toLocaleString("en-US")}** (-1)`,
            image: {
              url: `attachment://${outputFilename}`,
            },
            footer: {
              text: "CuanHD Image Upscaler",
            },
          },
        ],
      },
    },
    fileAttachment: {
      buffer: upscaleResult.outputBuffer,
      filename: outputFilename,
      contentType: "image/png",
    },
  };
}
