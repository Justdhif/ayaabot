import { User } from "@/db/schema";
import { buildAmPremInitialPanel } from "@/components/panels";

export function handleAmPremCommand(user?: User) {
  const panel = buildAmPremInitialPanel(user);
  return {
    type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
    data: panel,
  };
}
