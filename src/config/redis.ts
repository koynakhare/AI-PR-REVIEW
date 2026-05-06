import IORedis from "ioredis";
import { env } from "./env";

let client: IORedis | null = null;

export function getRedis(): IORedis {
  if (!client) {
    client = new IORedis(env.REDIS_URL, {
      maxRetriesPerRequest: null,
      // Avoid connecting (and retry-spam) until the first Redis command.
      lazyConnect: true,
    });
  }
  return client;
}

export async function disconnectRedis(): Promise<void> {
  if (!client) return;
  const c = client;
  client = null;
  await c.quit();
}

