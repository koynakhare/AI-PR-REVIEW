import React, { memo } from "react";

const SectionHeader = memo(function SectionHeader({ icon: Icon, title, subtitle, actions }) {
  return (
    <header className="section-header">
      <div className="section-header-main">
        {Icon ? <Icon size={18} className="section-icon" aria-hidden="true" /> : null}
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </div>
      {actions ? <div className="section-actions">{actions}</div> : null}
    </header>
  );
});

export default SectionHeader;
