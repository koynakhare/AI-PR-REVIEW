import React, { useCallback, useMemo, useState } from "react";
import { BookOpenText, CheckCircle2, Sparkles } from "lucide-react";
import { enqueueReview, fetchReviewSnapshot, pollReviewSnapshot } from "../services/reviewApi";
import { REVIEW_STATUS } from "../types/review";
import PrUrlForm from "../components/review/PrUrlForm";
import ReviewStatus from "../components/review/ReviewStatus";
import SummaryCard from "../components/review/SummaryCard";
import RisksCard from "../components/review/RisksCard";
import SuggestionsCard from "../components/review/SuggestionsCard";
import FileCommentsAccordion from "../components/review/FileCommentsAccordion";

const DEFAULT_PR_URL = "";
const GITHUB_PR_REGEX = /^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+\/?$/i;

export default function ReviewDashboard() {
  const [prUrl, setPrUrl] = useState(DEFAULT_PR_URL);
  const [status, setStatus] = useState(REVIEW_STATUS.IDLE);
  const [jobId, setJobId] = useState("");
  const [statusMessage, setStatusMessage] = useState("Paste a PR URL to begin analysis.");
  const [snapshot, setSnapshot] = useState(null);
  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingSnapshot, setIsFetchingSnapshot] = useState(false);

  const validationError = useMemo(() => {
    if (!prUrl) return "PR URL is required.";
    if (!GITHUB_PR_REGEX.test(prUrl)) {
      return "Enter a valid GitHub PR URL (https://github.com/{owner}/{repo}/pull/{number}).";
    }
    return "";
  }, [prUrl]);

  const aiReview = snapshot?.aiReview;
  const hasResults = Boolean(aiReview && !aiReview.error);

  const handlePrUrlChange = useCallback((event) => {
    setPrUrl(event.target.value.trim());
    setGlobalError("");
  }, []);

  const handleAnalyze = useCallback(
    async (event) => {
      event.preventDefault();
      if (validationError) return;

      setIsSubmitting(true);
      setGlobalError("");
      setSnapshot(null);
      setStatus(REVIEW_STATUS.QUEUED);
      setStatusMessage("Review request queued. Waiting for worker...");

      try {
        const enqueueData = await enqueueReview(prUrl);
        setJobId(String(enqueueData.jobId ?? ""));
        setStatus(REVIEW_STATUS.PROCESSING);
        setStatusMessage("Processing PR snapshot and generating AI review...");

        const pollData = await pollReviewSnapshot(prUrl, {
          timeoutMs: 90_000,
          intervalMs: 2_500,
          onTick: (data) => {
            if (data?.snapshot) {
              setSnapshot(data.snapshot);
            }
          },
        });

        if (pollData?.snapshot?.aiReview?.error) {
          setStatus(REVIEW_STATUS.ERROR);
          setStatusMessage("Analysis completed with an AI error.");
          setGlobalError(pollData.snapshot.aiReview.error);
          return;
        }

        setSnapshot(pollData.snapshot);
        setStatus(REVIEW_STATUS.COMPLETED);
        setStatusMessage("Review completed successfully.");
      } catch (error) {
        setStatus(REVIEW_STATUS.ERROR);
        setStatusMessage("Unable to complete review.");
        setGlobalError(error instanceof Error ? error.message : "Unexpected error occurred.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [prUrl, validationError],
  );

  const handleFetchSnapshot = useCallback(async () => {
    if (validationError) return;

    setIsFetchingSnapshot(true);
    setGlobalError("");

    try {
      const data = await fetchReviewSnapshot(prUrl);
      setSnapshot(data.snapshot);
      if (data.snapshot?.aiReview?.error) {
        setStatus(REVIEW_STATUS.ERROR);
        setStatusMessage("Snapshot fetched with AI error.");
        setGlobalError(data.snapshot.aiReview.error);
      } else if (data.snapshot?.aiReview) {
        setStatus(REVIEW_STATUS.COMPLETED);
        setStatusMessage("Snapshot fetched successfully.");
      } else {
        setStatus(REVIEW_STATUS.PROCESSING);
        setStatusMessage("Snapshot available. AI review still processing...");
      }
    } catch (error) {
      setStatus(REVIEW_STATUS.ERROR);
      setStatusMessage("Snapshot fetch failed.");
      setGlobalError(error instanceof Error ? error.message : "Unexpected error occurred.");
    } finally {
      setIsFetchingSnapshot(false);
    }
  }, [prUrl, validationError]);

  return (
    <div className="app-shell">
      <div className="bg-orb bg-orb-primary" aria-hidden="true" />
      <div className="bg-orb bg-orb-accent" aria-hidden="true" />

      <nav className="top-nav">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true" />
          <span>AI PR Review</span>
        </div>
        <div className="nav-actions">
          <button type="button" className="nav-btn">
            <BookOpenText size={16} aria-hidden="true" /> Docs
          </button>
          <button type="button" className="nav-btn">GitHub</button>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-chip">
          <Sparkles size={14} aria-hidden="true" />
          AI-Powered Code Quality
        </div>
        <h1>Review Pull Requests with AI in Seconds</h1>
        <p>
          Submit a pull request URL, monitor queue status, and get concise AI feedback with risks,
          suggestions, and file-level comments in one place.
        </p>
      </header>

      <main className="dashboard">
        <PrUrlForm
          prUrl={prUrl}
          onPrUrlChange={handlePrUrlChange}
          onAnalyze={handleAnalyze}
          onFetchSnapshot={handleFetchSnapshot}
          isSubmitting={isSubmitting}
          isFetchingSnapshot={isFetchingSnapshot}
          validationError={validationError}
        />

        <ReviewStatus status={status} jobId={jobId} message={statusMessage} />

        {globalError ? (
          <section className="error-banner" role="alert">
            <strong>Review Error:</strong> {globalError}
          </section>
        ) : null}

        {isSubmitting ? (
          <section className="results-grid" aria-label="Loading review results">
            <div className="card skeleton-card" />
            <div className="card skeleton-card" />
            <div className="card skeleton-card" />
            <div className="card skeleton-card" />
          </section>
        ) : null}

        {!isSubmitting && hasResults ? (
          <section className="results-grid" aria-live="polite">
            <SummaryCard summary={aiReview.summary} />
            <RisksCard risks={aiReview.risks} />
            <SuggestionsCard suggestions={aiReview.suggestions} />
            <FileCommentsAccordion comments={aiReview.fileComments} />
          </section>
        ) : null}

        {!isSubmitting && !hasResults && !globalError ? (
          <section className="empty-state">
            <CheckCircle2 size={28} aria-hidden="true" />
            <h3>Ready when you are</h3>
            <p>Run an analysis to see AI summary, risks, suggestions, and file-level insights.</p>
          </section>
        ) : null}
      </main>

      <footer className="footer">Built for fast, reliable pull request intelligence.</footer>
    </div>
  );
}
