import { getPrFetchQueue } from "../queues/prFetchQueue";

export async function enqueuePrFetchFromGitHubWebhook(params: {
  repoFullName: string;
  prNumber: number;
  headSha: string;
  prUrl: string;
}) {
  const { repoFullName, prNumber, headSha, prUrl } = params;

  const job = await getPrFetchQueue().add("fetch-pr", {
    repoFullName,
    prNumber,
    headSha,
    prUrl,
    source: "github_webhook",
  });

  return { jobId: job.id };
}

