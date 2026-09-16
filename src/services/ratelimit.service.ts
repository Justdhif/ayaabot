import { ECONOMY } from "../config/constants";

export interface CooldownStatus {
  canExecute: boolean;
  remainingMs: number;
  formattedRemaining: string;
}

export function checkClaimCooldown(lastClaimAt: Date | null): CooldownStatus {
  if (!lastClaimAt) {
    return { canExecute: true, remainingMs: 0, formattedRemaining: "0s" };
  }

  const cooldownMs = ECONOMY.CLAIM_COOLDOWN_HOURS * 60 * 60 * 1000;
  const elapsed = Date.now() - new Date(lastClaimAt).getTime();
  const remainingMs = cooldownMs - elapsed;

  if (remainingMs <= 0) {
    return { canExecute: true, remainingMs: 0, formattedRemaining: "0s" };
  }

  const totalMinutes = Math.ceil(remainingMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let formatted = "";
  if (hours > 0) {
    formatted += `${hours}h `;
  }
  formatted += `${minutes}m`;

  return {
    canExecute: false,
    remainingMs,
    formattedRemaining: formatted.trim(),
  };
}

export function checkHdCooldown(lastHdAt: Date | null): CooldownStatus {
  if (!lastHdAt) {
    return { canExecute: true, remainingMs: 0, formattedRemaining: "0s" };
  }

  const cooldownMs = ECONOMY.HD_COOLDOWN_SECONDS * 1000;
  const elapsed = Date.now() - new Date(lastHdAt).getTime();
  const remainingMs = cooldownMs - elapsed;

  if (remainingMs <= 0) {
    return { canExecute: true, remainingMs: 0, formattedRemaining: "0s" };
  }

  const seconds = Math.ceil(remainingMs / 1000);

  return {
    canExecute: false,
    remainingMs,
    formattedRemaining: `${seconds} seconds`,
  };
}
