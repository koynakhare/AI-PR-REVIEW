import { getRedis } from "../../config/redis";

export type PrFileSnapshot = {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
};

export type AiFileComment = {
  filename: string;
  comment: string;
};

export type AiReview = {
  provider: "openai" | "groq";
  model: string;
  generatedAt: string;
  summary: string;
  risks: string[];
  suggestions: string[];
  fileComments: AiFileComment[];
  error?: string;
};

export type PrSnapshot = {
  provider: "github";
  repoFullName: string;
  prNumber: number;
  prUrl: string;
  headSha: string;
  files: PrFileSnapshot[];
  fetchedAt: string;
  aiReview?: AiReview;
};

const SNAPSHOT_TTL_SECONDS = 60 * 60 * 24 * 7;

function makeSnapshotKey(repoFullName: string, prNumber: number, headSha: string): string {
  return `pr-snapshot:github:${repoFullName}:${prNumber}:${headSha}`;
}

function makeLatestKey(repoFullName: string, prNumber: number): string {
  return `pr-snapshot:github:latest:${repoFullName}:${prNumber}`;
}

export async function savePrSnapshot(snapshot: PrSnapshot): Promise<void> {
  const redis = getRedis();
  const payload = JSON.stringify(snapshot);
  const snapshotKey = makeSnapshotKey(snapshot.repoFullName, snapshot.prNumber, snapshot.headSha);
  const latestKey = makeLatestKey(snapshot.repoFullName, snapshot.prNumber);

  await redis.multi().set(snapshotKey, payload, "EX", SNAPSHOT_TTL_SECONDS).set(latestKey, snapshot.headSha, "EX", SNAPSHOT_TTL_SECONDS).exec();
}

export async function getPrSnapshot(params: {
  repoFullName: string;
  prNumber: number;
  headSha?: string;
}): Promise<PrSnapshot | null> {
  const redis = getRedis();
  const headSha =
    params.headSha ??
    (await redis.get(makeLatestKey(params.repoFullName, params.prNumber)));

  if (!headSha) return null;

  const value = await redis.get(makeSnapshotKey(params.repoFullName, params.prNumber, headSha));
  if (!value) return null;
  return JSON.parse(value) as PrSnapshot;
}
