import React, { memo } from "react";
import { CircleDashed, LoaderCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import SectionHeader from "../ui/SectionHeader";

const statusConfig = {
  idle: { label: "Idle", tone: "neutral", Icon: CircleDashed },
  queued: { label: "Queued", tone: "warning", Icon: CircleDashed },
  processing: { label: "Processing", tone: "info", Icon: LoaderCircle },
  completed: { label: "Completed", tone: "success", Icon: CheckCircle2 },
  error: { label: "Error", tone: "danger", Icon: AlertTriangle },
};

const ReviewStatus = memo(function ReviewStatus({ status, jobId, message }) {
  const config = statusConfig[status] ?? statusConfig.idle;
  const Icon = config.Icon;
  const iconClassName = status === "processing" ? "spin" : "";

  return (
    <Card>
      <SectionHeader
        icon={LoaderCircle}
        title="Queue Status"
        subtitle="Track where your pull request is in the review pipeline."
      />
      <div className="status-panel">
        <Badge tone={config.tone}>
          <Icon size={14} className={iconClassName} aria-hidden="true" /> {config.label}
        </Badge>
        {jobId ? <p className="status-job">Job ID: {jobId}</p> : null}
        {message ? <p className="status-message">{message}</p> : null}
      </div>
    </Card>
  );
});

export default ReviewStatus;
