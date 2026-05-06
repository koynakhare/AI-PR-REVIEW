import { Worker } from "bullmq";
import { getRedis } from "./config/redis";
import { FetchPrJob } from "./queues/prFetchQueue";
import { fetchPullRequest, fetchPullRequestFiles } from "./integrations/github/githubClient";
import { savePrSnapshot } from "./modules/review/prSnapshot.store";

async function main(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("Worker starting…");

  const worker = new Worker<FetchPrJob>(
    "pr-fetch",
    async (job) => {
      const { repoFullName, prNumber, prUrl } = job.data;

      const pr = await fetchPullRequest(repoFullName, prNumber);
      const headSha = job.data.headSha ?? pr.head.sha;

      const files = await fetchPullRequestFiles(repoFullName, prNumber);

      await savePrSnapshot({
        provider: "github",
        repoFullName,
        prNumber,
        prUrl,
        headSha,
        files: files.map((f) => ({
          filename: f.filename,
          status: f.status,
          additions: f.additions,
          deletions: f.deletions,
          changes: f.changes,
          patch: f.patch,
        })),
        fetchedAt: new Date().toISOString(),
      });

      return { repoFullName, prNumber, headSha, fileCount: files.length };
    },
    { connection: getRedis() },
  );

  worker.on("completed", (job, result) => {
    // eslint-disable-next-line no-console
    console.log(`Job ${job.id} completed`, result);
  });

  worker.on("failed", (job, err) => {
    // eslint-disable-next-line no-console
    console.error(`Job ${job?.id} failed`, err);
  });
}

void main();

