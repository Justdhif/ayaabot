export interface PatchDiscordMessagePayload {
  responsePayload: any;
  fileAttachment?: {
    buffer: Buffer;
    filename: string;
    contentType: string;
  };
}

export async function patchDiscordOriginalMessage(
  applicationId: string,
  token: string,
  result: PatchDiscordMessagePayload
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
