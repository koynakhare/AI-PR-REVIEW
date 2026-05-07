import React, { memo } from "react";
import { Lightbulb } from "lucide-react";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

const SuggestionsCard = memo(function SuggestionsCard({ suggestions }) {
  return (
    <Card>
      <SectionHeader icon={Lightbulb} title="Suggestions" />
      {suggestions.length ? (
        <ul className="content-list">
          {suggestions.map((suggestion, index) => (
            <li key={`${suggestion}-${index}`}>{suggestion}</li>
          ))}
        </ul>
      ) : (
        <p className="content-text muted">No suggestions provided for this snapshot.</p>
      )}
    </Card>
  );
});

export default SuggestionsCard;
