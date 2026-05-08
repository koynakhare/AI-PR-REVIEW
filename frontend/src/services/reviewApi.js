const ANALYZE_ENDPOINT = "/api/reviews";
const SNAPSHOT_ENDPOINT = "/api/reviews/snapshot";

async function parseResponse(response) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    throw new Error("Received an invalid server response.");
  }

  if (!response.ok) {
    throw new Error(data?.error || "Request failed.");
  }

  return data;
}

export async function enqueueReview(prUrl) {
  const response = await fetch(ANALYZE_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prUrl }),
  });

  return parseResponse(response);
}

export async function fetchReviewSnapshot(prUrl) {
  const params = new URLSearchParams({ prUrl });
  const response = await fetch(`${SNAPSHOT_ENDPOINT}?${params.toString()}`);
  return parseResponse(response);
}

export async function pollReviewSnapshot(prUrl, options = {}) {
  const {
    timeoutMs = 90_000,
    intervalMs = 2_500,
    onTick,
    shouldStop,
  } = options;

  const startedAt = Date.now();
  let latestPayload = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      latestPayload = await fetchReviewSnapshot(prUrl);
      if (onTick) onTick(latestPayload);

      const hasReview = Boolean(latestPayload?.snapshot?.aiReview);
      if (hasReview) return latestPayload;
      if (shouldStop?.(latestPayload)) return latestPayload;
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found yet")) {
        await delay(intervalMs);
        continue;
      }
      throw error;
    }

    await delay(intervalMs);
  }

  throw new Error("Timed out while waiting for AI review. Try fetching snapshot again.");
}

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
