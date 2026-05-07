import React, { memo, useMemo } from "react";
import { FileCode, MessageSquare } from "lucide-react";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

const FileCommentsAccordion = memo(function FileCommentsAccordion({ comments }) {
  const grouped = useMemo(() => {
    return comments.reduce((acc, item) => {
      if (!acc[item.filename]) acc[item.filename] = [];
      acc[item.filename].push(item.comment);
      return acc;
    }, {});
  }, [comments]);

  const fileNames = Object.keys(grouped);

  return (
    <Card>
      <SectionHeader
        icon={FileCode}
        title="File-Level Comments"
        subtitle="Comments are grouped by file for easier triage."
      />
      {fileNames.length ? (
        <div className="accordion-list">
          {fileNames.map((filename) => (
            <details key={filename} className="accordion-item">
              <summary>
                <span className="accordion-title">{filename}</span>
                <span className="accordion-meta">{grouped[filename].length} comments</span>
              </summary>
              <ul className="comment-list">
                {grouped[filename].map((comment, index) => (
                  <li key={`${filename}-${index}`}>
                    <MessageSquare size={14} aria-hidden="true" />
                    <span>{comment}</span>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      ) : (
        <p className="content-text muted">No file-level comments available.</p>
      )}
    </Card>
  );
});

export default FileCommentsAccordion;
