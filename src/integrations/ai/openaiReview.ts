import axios from "axios";
import { env } from "../../config/env";
import { AiReview, PrFileSnapshot } from "../../modules/review/prSnapshot.store";

type ReviewInput = {
  prUrl: string;
  repoFullName: string;
  prNumber: number;
  title?: string;
  body?: string | null;
  files: PrFileSnapshot[];
};

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}\n...[truncated ${s.length - max} chars]`;
}

function extractJsonObject(text: string): unknown {
  // Best-effort: find the first {...} block
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;
  const candidate = text.slice(first, last + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string") as string[];
}

function asFileComments(v: unknown): { filename: string; comment: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => {
      if (!x || typeof x !== "object") return null;
      const obj = x as Record<string, unknown>;
      const filename = typeof obj.filename === "string" ? obj.filename : "";
      const comment = typeof obj.comment === "string" ? obj.comment : "";
      if (!filename || !comment) return null;
      return { filename, comment };
    })
    .filter(Boolean) as { filename: string; comment: string }[];
}

export async function generateOpenAiPrReview(input: ReviewInput): Promise<AiReview> {
  const provider = (env.AI_PROVIDER ?? "").toLowerCase();
  const apiKey = env.AI_API_KEY;
  const model = env.AI_MODEL ?? "gpt-4o-mini";

  if (provider && provider !== "openai") {
    return {
      provider: "openai",
      model,
      generatedAt: new Date().toISOString(),
      summary: "",
      risks: [],
      suggestions: [],
      fileComments: [],
      error: `AI_PROVIDER is '${env.AI_PROVIDER}', not 'openai'`,
    };
  }

  if (!apiKey) {
    return {
      provider: "openai",
      model,
      generatedAt: new Date().toISOString(),
      summary: "",
      risks: [],
      suggestions: [],
      fileComments: [],
      error: "Missing AI_API_KEY",
    };
  }

  // Keep prompt bounded.
  const filesForPrompt = input.files.slice(0, 30).map((f) => ({
    filename: f.filename,
    status: f.status,
    additions: f.additions,
    deletions: f.deletions,
    changes: f.changes,
    patch: f.patch ? truncate(f.patch, 4000) : undefined,
  }));

  const userPayload = {
    pr: {
      prUrl: input.prUrl,
      repoFullName: input.repoFullName,
      prNumber: input.prNumber,
      title: input.title ?? "",
      body: input.body ?? "",
    },
    files: filesForPrompt,
    output_schema: {
      summary: "string",
      risks: ["string"],
      suggestions: ["string"],
      fileComments: [{ filename: "string", comment: "string" }],
    },
  };

  const system = [
    "You are a senior software engineer reviewing a GitHub pull request.",
    "Be concrete, actionable, and prioritize correctness, security, performance, and maintainability.",
    "Return ONLY valid JSON matching the provided output_schema. No markdown, no extra keys.",
  ].join("\n");

  const client = axios.create({
    baseURL: "https://api.openai.com/v1",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    timeout: 60_000,
  });

  const { data } = await client.post("/chat/completions", {
    model,
    temperature: 0.2,
    messages: [
      { role: "system", content: system },
      { role: "user", content: JSON.stringify(userPayload) },
    ],
  });

  const text: string =
    data?.choices?.[0]?.message?.content ??
    "";

  const parsed = extractJsonObject(text);
  const obj = (parsed && typeof parsed === "object") ? (parsed as Record<string, unknown>) : null;

  const summary = obj && typeof obj.summary === "string" ? obj.summary : "";
  const risks = obj ? asStringArray(obj.risks) : [];
  const suggestions = obj ? asStringArray(obj.suggestions) : [];
  const fileComments = obj ? asFileComments(obj.fileComments) : [];

  if (!summary) {
    return {
      provider: "openai",
      model,
      generatedAt: new Date().toISOString(),
      summary: "",
      risks: [],
      suggestions: [],
      fileComments: [],
      error: "OpenAI response was not valid JSON in expected shape",
    };
  }

  return {
    provider: "openai",
    model,
    generatedAt: new Date().toISOString(),
    summary,
    risks,
    suggestions,
    fileComments,
  };
}

