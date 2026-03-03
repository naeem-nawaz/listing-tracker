import React from 'react';

/**
 * Action buttons for a fraud review row: View, Approve, Reject, Limited visibility.
 * AI: auto approve, reject (not block), limited visibility – check if something is wrong.
 */
function FraudActions({
  listingId,
  onView,
  onApprove,
  onReject,
  onLimitedVisibility,
  disabled = false,
  loading = false,
}) {
  const handleView = () => {
    if (typeof onView === 'function') onView(listingId);
  };
  const handleApprove = () => {
    if (typeof onApprove === 'function') onApprove(listingId);
  };
  const handleReject = () => {
    if (typeof onReject === 'function') onReject(listingId);
  };
  const handleLimitedVisibility = () => {
    if (typeof onLimitedVisibility === 'function') onLimitedVisibility(listingId);
  };

  return (
    <div className="fraud-actions">
      <button
        type="button"
        className="fraud-actions__btn fraud-actions__btn--view"
        onClick={handleView}
        title="View details"
        disabled={disabled}
      >
        View
      </button>
      <button
        type="button"
        className="fraud-actions__btn fraud-actions__btn--approve"
        onClick={handleApprove}
        title="Approve listing"
        disabled={disabled}
      >
        {loading ? '…' : 'Approve'}
      </button>
      <button
        type="button"
        className="fraud-actions__btn fraud-actions__btn--reject"
        onClick={handleReject}
        title="Reject listing"
        disabled={disabled}
      >
        {loading ? '…' : 'Reject'}
      </button>
      <button
        type="button"
        className="fraud-actions__btn fraud-actions__btn--limited"
        onClick={handleLimitedVisibility}
        title="Limited visibility – check if something is wrong"
        disabled={disabled}
      >
        {loading ? '…' : 'Limited visibility'}
      </button>
    </div>
  );
}

export default FraudActions;
