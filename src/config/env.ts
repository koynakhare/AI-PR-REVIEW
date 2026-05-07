import dotenv from "dotenv";

dotenv.config();

export type AppEnv = {
  NODE_ENV: string;
  PORT: number;
  REDIS_URL: string;
  GITHUB_WEBHOOK_SECRET: string;
  GITHUB_TOKEN?: string;
  AI_PROVIDER?: string;
  AI_API_KEY?: string;
  AI_MODEL?: string;
};

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

function optional(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

export const env: AppEnv = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 3000),
  REDIS_URL: required("REDIS_URL"),
  GITHUB_WEBHOOK_SECRET: required("GITHUB_WEBHOOK_SECRET"),
  GITHUB_TOKEN: optional("GITHUB_TOKEN"),
  AI_PROVIDER: optional("AI_PROVIDER"),
  AI_API_KEY: optional("AI_API_KEY"),
  AI_MODEL: optional("AI_MODEL"),
};

