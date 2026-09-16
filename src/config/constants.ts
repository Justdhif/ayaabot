export const ECONOMY = {
  CLAIM_MONEY: 1000,
  CLAIM_LIMIT: 5,

  HD_COST_MONEY: 100,
  HD_COST_LIMIT: 1,

  CLAIM_COOLDOWN_HOURS: 24,
  HD_COOLDOWN_SECONDS: 15,
} as const;

export const IMAGE_CONFIG = {
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB
  ALLOWED_MIME_TYPES: ["image/png", "image/jpeg", "image/webp"],
  ALLOWED_EXTENSIONS: ["png", "jpg", "jpeg", "webp"],
  DEFAULT_SCALE: 2,
} as const;
