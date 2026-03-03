import React from 'react';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending_ai_review', label: 'Pending Review' },
  { value: 'check_something_wrong', label: 'Check Something Wrong' },
  { value: 'rejected', label: 'Rejected' },
];

function FraudFilterBar({ value, onChange, disabled }) {
  return (
    <div className="fraud-filter-bar">
      <label htmlFor="fraud-status-filter" className="fraud-filter-bar__label">
        Filter by AI Status
      </label>
      <select
        id="fraud-status-filter"
        className="fraud-filter-bar__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label="Filter by AI status"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value || 'all'} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FraudFilterBar;
