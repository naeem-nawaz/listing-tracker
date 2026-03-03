import React from 'react';
import FraudScoreBadge from './FraudScoreBadge';
import FraudActions from './FraudActions';

/**
 * Responsive table for fraud review listings.
 * Displays Listing ID, Title, Seller, City, Price, Fraud Score, Status, Actions.
 */
function FraudTable({
  listings,
  onView,
  onApprove,
  onReject,
  onLimitedVisibility,
  processingId = null,
}) {
  const formatPrice = (value) => {
    const num = Number(value);
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toLocaleString();
  };

  const formatStatus = (status) => {
    return status
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  if (!listings || listings.length === 0) {
    return (
      <div className="fraud-table-empty">
        <p>No listings in soft review.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive fraud-table-wrapper">
      <table className="table table-hover fraud-table">
        <thead className="fraud-table__head">
          <tr>
            <th scope="col">Listing ID</th>
            <th scope="col">Property Title</th>
            <th scope="col">Seller Name</th>
            <th scope="col">City</th>
            <th scope="col">Price</th>
            <th scope="col">Fraud Score</th>
            <th scope="col">Fraud Status</th>
            <th scope="col" className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody className="fraud-table__body">
          {listings.map((row) => (
            <tr key={row.id} className="fraud-table__row">
              <td className="fraud-table__id">{row.id}</td>
              <td className="fraud-table__title">{row.property_title}</td>
              <td>{row.seller_name}</td>
              <td>{row.city}</td>
              <td className="fraud-table__price">
                Rs. {formatPrice(row.price)}
              </td>
              <td>
                <FraudScoreBadge score={row.fraud_score} />
              </td>
              <td>
                <span className="fraud-table__status">
                  {formatStatus(row.fraud_status)}
                </span>
              </td>
              <td className="text-end">
                <FraudActions
                  listingId={row.id}
                  onView={onView}
                  onApprove={onApprove}
                  onReject={onReject}
                  onLimitedVisibility={onLimitedVisibility}
                  disabled={processingId !== null}
                  loading={processingId === row.id}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FraudTable;
