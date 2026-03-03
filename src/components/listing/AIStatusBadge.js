import React from 'react';

/**
 * Displays AI review status as a colored badge.
 * status: "pending_ai_review" | "approved" | "check_something_wrong" | "rejected"
 * fraud_score: optional number
 * AI: approve, reject (not block), limited visibility – check if something is wrong.
 */
function AIStatusBadge({ status, fraud_score }) {
  const config = {
    pending_ai_review: { label: 'Under AI Review', className: 'ai-status-badge ai-status-badge--yellow' },
    approved: { label: 'Approved', className: 'ai-status-badge ai-status-badge--green' },
    check_something_wrong: { label: 'Check Something Wrong', className: 'ai-status-badge ai-status-badge--orange' },
    // backward compatibility for old status values
    limited_visibility: { label: 'Check Something Wrong', className: 'ai-status-badge ai-status-badge--orange' },
    blocked: { label: 'Rejected', className: 'ai-status-badge ai-status-badge--red' },
    rejected: { label: 'Rejected', className: 'ai-status-badge ai-status-badge--red' },
  };

  const { label, className } = config[status] || {
    label: status ? String(status) : 'Pending AI Review',
    className: 'ai-status-badge ai-status-badge--yellow',
  };

  return (
    <span className={className} role="status">
      {label}
      {fraud_score != null && (
        <span className="ai-status-badge__score"> (Score: {fraud_score})</span>
      )}
    </span>
  );
}

export default AIStatusBadge;
