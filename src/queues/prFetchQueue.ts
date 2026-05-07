import { Queue } from "bullmq";
import { getRedis } from "../config/redis";

export type FetchPrJob = {
  repoFullName: string; // owner/repo
  prNumber: number;
  prUrl: string;
  headSha?: string;
  source: "github_webhook" | "manual_pr_url";
};

let queue: Queue<FetchPrJob> | null = null;

/** Lazy so the API process can boot before Redis is running; connects on first enqueue. */
export function getPrFetchQueue(): Queue<FetchPrJob> {
  console.log("getPrFetchQueue");
  if (!queue) {
    queue = new Queue<FetchPrJob>("pr-fetch", { connection: getRedis() });
  }
  return queue;
}

