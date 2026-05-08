import React, { memo } from "react";
import { AlertTriangle } from "lucide-react";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

const RisksCard = memo(function RisksCard({ risks }) {
  return (
    <Card>
      <SectionHeader icon={AlertTriangle} title="Risks" />
      {risks.length ? (
        <ul className="content-list">
          {risks.map((risk, index) => (
            <li key={`${risk}-${index}`}>{risk}</li>
          ))}
        </ul>
      ) : (
        <p className="content-text muted">No major risks identified.</p>
      )}
    </Card>
  );
});

export default RisksCard;
