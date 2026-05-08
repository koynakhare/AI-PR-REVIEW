import React, { memo } from "react";
import { Link } from "lucide-react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import SectionHeader from "../ui/SectionHeader";

const PrUrlForm = memo(function PrUrlForm({
  prUrl,
  onPrUrlChange,
  onAnalyze,
  onFetchSnapshot,
  isSubmitting,
  isFetchingSnapshot,
  validationError,
}) {
  return (
    <Card>
      <SectionHeader
        icon={Link}
        title="Pull Request Input"
        subtitle="Paste a GitHub pull request URL to enqueue a review or fetch the latest snapshot."
      />
      <form
        onSubmit={onAnalyze}
        className="review-form"
        aria-label="Analyze pull request form"
      >
        <Input
          id="pr-url"
          type="url"
          label="GitHub PR URL"
          value={prUrl}
          onChange={onPrUrlChange}
          placeholder="https://github.com/owner/repo/pull/123"
          error={validationError}
          autoComplete="off"
          required
        />
        <div className="review-form-actions">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "Analyzing..." : "Analyze PR"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onFetchSnapshot}
            disabled={isFetchingSnapshot}
          >
            {isFetchingSnapshot ? "Fetching..." : "Fetch Snapshot"}
          </Button>
        </div>
      </form>
    </Card>
  );
});

export default PrUrlForm;
