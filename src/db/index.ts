import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "./schema";

// Configure websocket constructor for Node.js environments
if (typeof WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}
// Enable fast HTTP fetch queries for serverless to prevent WebSocket timeouts/stalls
neonConfig.poolQueryViaFetch = true;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is not defined");
}

const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });
