export type GitHubPullRequestEvent = {
  action: string;
  pull_request: {
    number: number;
    head: { sha: string };
    base: { repo: { full_name: string } };
    html_url: string;
  };
  repository?: { full_name: string };
};

