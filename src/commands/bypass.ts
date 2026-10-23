import { User } from "@/db/schema";
import { buildBypassInitialPanel } from "@/components/panels";

export function handleBypassCommand(user?: User) {
  const panel = buildBypassInitialPanel(user);
  return {
    type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
    data: panel,
  };
}
