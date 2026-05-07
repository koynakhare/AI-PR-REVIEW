import express, { Router } from "express";
import { getPrFetchQueue } from "../queues/prFetchQueue";
import { getPrSnapshot } from "../modules/review/prSnapshot.store";

function parseGitHubPrUrl(prUrl: string): { repoFullName: string; prNumber: number } | null {
  // Supports: https://github.com/{owner}/{repo}/pull/{number}
  try {
    const u = new URL(prUrl);
    if (u.hostname !== "github.com") return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 4) return null;
    const [owner, repo, pullLiteral, numStr] = parts;
    if (pullLiteral !== "pull") return null;
    const prNumber = Number(numStr);
    if (!Number.isFinite(prNumber) || prNumber <= 0) return null;
    return { repoFullName: `${owner}/${repo}`, prNumber };
  } catch {
    return null;
  }
}

export const reviewsRouter = Router();

reviewsRouter.post("/", express.json(), async (req, res) => {
  const prUrl = (req.body?.prUrl as string | undefined) ?? "";
  const parsed = parseGitHubPrUrl(prUrl);
  if (!parsed) {
    return res.status(400).json({ ok: false, error: "Invalid GitHub PR URL" });
  }

  const job = await getPrFetchQueue().add("fetch-pr", {
    repoFullName: parsed.repoFullName,
    prNumber: parsed.prNumber,
    prUrl,
    source: "manual_pr_url",
  });

  return res.json({ ok: true, enqueued: true, jobId: job.id });
});

reviewsRouter.get("/snapshot", async (req, res) => {
  const prUrl = String(req.query.prUrl ?? "");
  const headSha = typeof req.query.headSha === "string" ? req.query.headSha : undefined;
  const parsed = parseGitHubPrUrl(prUrl);
  if (!parsed) {
    return res.status(400).json({ ok: false, error: "Invalid GitHub PR URL" });
  }

  const snapshot = await getPrSnapshot({
    repoFullName: parsed.repoFullName,
    prNumber: parsed.prNumber,
    headSha,
  });
  console.log("snapshot", snapshot);

  if (!snapshot) {
    return res.status(404).json({
      ok: false,
      error: "PR snapshot not found yet. Trigger webhook or POST /api/reviews first.",
    });
  }

  return res.json({ ok: true, snapshot });
});

