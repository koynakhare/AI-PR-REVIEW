/**
 * @typedef {"idle" | "queued" | "processing" | "completed" | "error"} ReviewStatus
 */

/**
 * @typedef {Object} AiFileComment
 * @property {string} filename
 * @property {string} comment
 */

/**
 * @typedef {Object} AiReview
 * @property {"openai" | "groq"} provider
 * @property {string} model
 * @property {string} generatedAt
 * @property {string} summary
 * @property {string[]} risks
 * @property {string[]} suggestions
 * @property {AiFileComment[]} fileComments
 * @property {string=} error
 */

/**
 * @typedef {Object} PrFileSnapshot
 * @property {string} filename
 * @property {string} status
 * @property {number} additions
 * @property {number} deletions
 * @property {number} changes
 * @property {string=} patch
 */

/**
 * @typedef {Object} PrSnapshot
 * @property {"github"} provider
 * @property {string} repoFullName
 * @property {number} prNumber
 * @property {string} prUrl
 * @property {string} headSha
 * @property {PrFileSnapshot[]} files
 * @property {string} fetchedAt
 * @property {AiReview=} aiReview
 */

/**
 * @typedef {Object} EnqueueReviewResponse
 * @property {boolean} ok
 * @property {boolean} enqueued
 * @property {string} jobId
 */

/**
 * @typedef {Object} SnapshotResponse
 * @property {boolean} ok
 * @property {PrSnapshot} snapshot
 */

export const REVIEW_STATUS = {
  IDLE: "idle",
  QUEUED: "queued",
  PROCESSING: "processing",
  COMPLETED: "completed",
  ERROR: "error",
};
