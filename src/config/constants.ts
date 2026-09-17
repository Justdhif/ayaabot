export const ECONOMY = {
  CLAIM_MONEY: 1000,
  CLAIM_LIMIT: 5,

  HD_COST_MONEY_2X: 100,
  HD_COST_LIMIT_2X: 1,
  HD_COST_MONEY_4X: 200,
  HD_COST_LIMIT_4X: 2,
  // Backward compatibility alias:
  HD_COST_MONEY: 100,
  HD_COST_LIMIT: 1,

  FILTER_COST_MONEY: 50,
  CONVERT_COST_MONEY: 25,
  WATERMARK_COST_MONEY: 25,

  CLAIM_COOLDOWN_HOURS: 24,
  HD_COOLDOWN_SECONDS: 15,
} as const;

export const WATERMARK_POSITIONS = {
  BOTTOM_RIGHT: "bottom_right",
  BOTTOM_LEFT: "bottom_left",
  CENTER: "center",
  TOP_RIGHT: "top_right",
} as const;

export const WATERMARK_OPACITY = {
  SUBTLE: "subtle", // 40%
  NORMAL: "normal", // 70%
  SOLID: "solid",   // 100%
} as const;

export const IMAGE_CONFIG = {
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10 MB
  ALLOWED_MIME_TYPES: ["image/png", "image/jpeg", "image/webp"],
  ALLOWED_EXTENSIONS: ["png", "jpg", "jpeg", "webp"],
  DEFAULT_SCALE: 2,
  MAX_OUTPUT_DIMENSION: 4096, // Maximum width/height to prevent serverless OOM
} as const;

export const FILTER_PRESETS = {
  PINK_GLOW: "pink_glow",
  VINTAGE_WARM: "vintage_warm",
  BW_DREAMY: "bw_dreamy",
  ANIME_POP: "anime_pop",
} as const;

export type FilterPresetKey = (typeof FILTER_PRESETS)[keyof typeof FILTER_PRESETS];

export const CONVERT_FORMATS = {
  PNG: "png",
  JPG: "jpg",
  WEBP: "webp",
} as const;

export type ConvertFormatKey = (typeof CONVERT_FORMATS)[keyof typeof CONVERT_FORMATS];

export const BOT_THEME = {
  NAME: "Ayaa Bot",
  COLOR_PINK: 0xFFA6C9, // Cute Soft Pastel Pink
  COLOR_GOLD: 0xFFD166,
  COLOR_ROSE: 0xFF758F,
  COLOR_PURPLE: 0xC77DFF,
  COLOR_SKY: 0x4CC9F0,
  BANNER_URL: "https://ayaabot.vercel.app/banner.png",
} as const;

export const DISCORD_CONFIG = {
  STREAK_3D_ROLE_ID: "1549701196812525568",
  STREAK_3D_ROLE_NAME: "ayaa sweetheart",
  DEFAULT_GUILD_ID: "1549351162510319678",
  DEFAULT_CHANNEL_ID: "1549351163558633564",
} as const;

