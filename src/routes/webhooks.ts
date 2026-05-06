import express, { Router } from "express";
import { env } from "../config/env";
import { GitHubPullRequestEvent } from "../integrations/github/githubWebhooks.types";
import { verifyGitHubSignature256 } from "../integrations/github/webhookSignature";
import { enqueuePrFetchFromGitHubWebhook } from "../services/githubWebhook.service";

export const webhooksRouter = Router();

webhooksRouter.post(
  "/github",
  express.raw({ type: "*/*" }),
  async (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? (req.body as Buffer) : Buffer.from("");
    if (
      !verifyGitHubSignature256({
        secret: env.GITHUB_WEBHOOK_SECRET,
        signature256Header: req.header("x-hub-signature-256"),
        rawBody,
      })
    ) {
      return res.status(401).json({ ok: false, error: "Invalid signature" });
    }

    const event = req.header("x-github-event") ?? "unknown";
    if (event !== "pull_request") {
      return res.json({ ok: true, ignored: true, event });
    }

    let payload: GitHubPullRequestEvent;
    try {
      payload = JSON.parse(rawBody.toString("utf8")) as GitHubPullRequestEvent;
    } catch {
      return res.status(400).json({ ok: false, error: "Invalid JSON payload" });
    }

    const action = payload.action;
    if (!["opened", "reopened", "synchronize", "ready_for_review"].includes(action)) {
      return res.json({ ok: true, ignored: true, action });
    }

    const repoFullName =
      payload.pull_request?.base?.repo?.full_name ?? payload.repository?.full_name;
    const prNumber = payload.pull_request?.number;
    const headSha = payload.pull_request?.head?.sha;
    const prUrl = payload.pull_request?.html_url;

    if (!repoFullName || !prNumber || !headSha || !prUrl) {
      return res.status(400).json({ ok: false, error: "Missing PR fields" });
    }

    const { jobId } = await enqueuePrFetchFromGitHubWebhook({
      repoFullName,
      prNumber,
      headSha,
      prUrl,
    });

    return res.json({ ok: true, enqueued: true, jobId });
  },
);

