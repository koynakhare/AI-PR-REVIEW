import axios, { AxiosInstance } from "axios";
import { env } from "../../config/env";

export type GitHubPullRequest = {
  number: number;
  html_url: string;
  title?: string;
  body?: string | null;
  head: { sha: string };
  base: { repo: { full_name: string } };
};

export type GitHubPullRequestFile = {
  sha: string;
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
};

export function getGitHubClient(): AxiosInstance {
  const token = env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("Missing GITHUB_TOKEN (needed to fetch PR code from GitHub API)");
  }

  return axios.create({
    baseURL: "https://api.github.com",
    headers: {
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      Accept: "application/vnd.github+json",
      "User-Agent": "ai-pr-reviewer",
    },
    timeout: 30_000,
  });
}

export async function fetchPullRequest(repoFullName: string, prNumber: number): Promise<GitHubPullRequest> {
  const gh = getGitHubClient();
  const { data } = await gh.get<GitHubPullRequest>(`/repos/${repoFullName}/pulls/${prNumber}`);
  return data;
}

export async function fetchPullRequestFiles(repoFullName: string, prNumber: number): Promise<GitHubPullRequestFile[]> {
  const gh = getGitHubClient();
  const files: GitHubPullRequestFile[] = [];

  // GitHub paginates at 30 by default; max 100.
  let page = 1;
  for (;;) {
    const { data } = await gh.get<GitHubPullRequestFile[]>(
      `/repos/${repoFullName}/pulls/${prNumber}/files`,
      { params: { per_page: 100, page } },
    );
    files.push(...data);
    if (data.length < 100) break;
    page += 1;
  }

  return files;
}

