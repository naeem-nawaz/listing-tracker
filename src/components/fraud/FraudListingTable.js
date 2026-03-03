import React from 'react';
import AIStatusBadge from '../listing/AIStatusBadge';

function getScoreClassName(score) {
  if (score == null) return 'fraud-table-score fraud-table-score--gray';
  const n = Number(score);
  if (n <= 40) return 'fraud-table-score fraud-table-score--green';
  if (n <= 70) return 'fraud-table-score fraud-table-score--orange';
  return 'fraud-table-score fraud-table-score--red';
}

function formatPrice(val) {
  if (val == null || val === '') return '—';
  return new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(val);
}

function FraudListingTable({ listings, onView }) {
  if (!listings.length) {
    return (
      <div className="fraud-table-empty">
        <p>No listings match the filter.</p>
      </div>
    );
  }

  return (
    <div className="fraud-table-wrap">
      <table className="fraud-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>City</th>
            <th>Price</th>
            <th>Fraud Score</th>
            <th>AI Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {listings.map((row) => (
            <tr key={row.id}>
              <td>{row.id}</td>
              <td>{row.title || '—'}</td>
              <td>{row.city || '—'}</td>
              <td>PKR {formatPrice(row.price)}</td>
              <td>
                <span className={getScoreClassName(row.fraud_score)}>
                  {row.fraud_score != null ? row.fraud_score : '—'}
                </span>
              </td>
              <td>
                <AIStatusBadge status={row.ai_status} fraud_score={row.fraud_score} />
              </td>
              <td>
                <button
                  type="button"
                  className="fraud-table__view-btn"
                  onClick={() => onView(row)}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FraudListingTable;
