import React, { memo } from "react";
import { Sparkles } from "lucide-react";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

const SummaryCard = memo(function SummaryCard({ summary }) {
  return (
    <Card>
      <SectionHeader icon={Sparkles} title="AI Summary" />
      <p className="content-text">{summary || "No summary generated yet."}</p>
    </Card>
  );
});

export default SummaryCard;
