import { User } from "@/db/schema";
import { buildPresetInitialPanel } from "@/components/panels";

export function handlePresetCommand(user?: User) {
  const panel = buildPresetInitialPanel(user);
  return {
    type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
    data: panel,
  };
}
