import React, { useState, useMemo, useEffect, useCallback } from 'react';
import FraudTable from '../../components/fraud/FraudTable';
import { getFraudReviewListings } from '../../api/fraudApi';
import { approveListing, rejectListing, setLimitedVisibilityListing } from '../../api/listingsApi';
import '../../styles/FraudReviewList.css';

const PAGE_SIZE = 5;
const FRAUD_SCORE_FILTERS = [
  { value: '', label: 'All scores' },
  { value: '0-40', label: '0 – 40 (Low)' },
  { value: '41-70', label: '41 – 70 (Medium)' },
  { value: '71-100', label: '71 – 100 (High)' },
];

function FraudReviewList() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scoreFilter, setScoreFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [processingId, setProcessingId] = useState(null);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  const fetchListings = useCallback(() => {
    setLoading(true);
    getFraudReviewListings()
      .then((res) => setListings(res.data || []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const filteredListings = useMemo(() => {
    let result = [...listings];

    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (item) =>
          (item.property_title && item.property_title.toLowerCase().includes(query)) ||
          (item.seller_name && item.seller_name.toLowerCase().includes(query))
      );
    }

    if (scoreFilter) {
      const [min, max] = scoreFilter.split('-').map(Number);
      result = result.filter(
        (item) => item.fraud_score >= min && item.fraud_score <= max
      );
    }

    return result;
  }, [listings, search, scoreFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / PAGE_SIZE));
  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredListings.slice(start, start + PAGE_SIZE);
  }, [filteredListings, currentPage]);

  const handleView = (id) => console.log('View', id);

  const handleApprove = async (id) => {
    setActionMessage({ type: '', text: '' });
    setProcessingId(id);
    try {
      await approveListing(id);
      setActionMessage({ type: 'success', text: 'Listing approved.' });
      fetchListings();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to approve.';
      setActionMessage({ type: 'error', text: msg });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    setActionMessage({ type: '', text: '' });
    setProcessingId(id);
    try {
      await rejectListing(id);
      setActionMessage({ type: 'success', text: 'Listing rejected.' });
      fetchListings();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reject.';
      setActionMessage({ type: 'error', text: msg });
    } finally {
      setProcessingId(null);
    }
  };

  const handleLimitedVisibility = async (id) => {
    setActionMessage({ type: '', text: '' });
    setProcessingId(id);
    try {
      await setLimitedVisibilityListing(id);
      setActionMessage({
        type: 'success',
        text: 'Limited visibility set. Please check if something is wrong.',
      });
      fetchListings();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to set limited visibility.';
      setActionMessage({ type: 'error', text: msg });
    } finally {
      setProcessingId(null);
    }
  };

  const from = (currentPage - 1) * PAGE_SIZE + 1;
  const to = Math.min(currentPage * PAGE_SIZE, filteredListings.length);

  return (
    <div className="fraud-review-page">
      <div className="fraud-review-page__inner">
        <header className="fraud-review-header">
          <h1 className="fraud-review-header__title">Fraud Review List</h1>
          <p className="fraud-review-header__subtitle">
            Listings requiring soft review (fraud_status: soft_review) – Pakistan Property Admin
          </p>
        </header>

        {actionMessage.text && (
          <div
            className={`fraud-review-message fraud-review-message--${actionMessage.type}`}
            role="alert"
          >
            {actionMessage.text}
          </div>
        )}
        <div className="fraud-toolbar">
          <div className="fraud-toolbar__search">
            <input
              type="search"
              className="form-control"
              placeholder="Search by title or seller..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Search by title or seller"
            />
          </div>
          <div className="fraud-toolbar__filter">
            <select
              className="form-select"
              value={scoreFilter}
              onChange={(e) => {
                setScoreFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by fraud score range"
            >
              {FRAUD_SCORE_FILTERS.map((opt) => (
                <option key={opt.value || 'all'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="fraud-content-card">
          {loading ? (
            <div className="fraud-table-empty">
              <p>Loading listings...</p>
            </div>
          ) : (
            <>
              <FraudTable
                listings={paginatedListings}
                onView={handleView}
                onApprove={handleApprove}
                onReject={handleReject}
                onLimitedVisibility={handleLimitedVisibility}
                processingId={processingId}
              />
              <div className="fraud-pagination-wrap">
                <p className="fraud-pagination-info">
                  Showing {filteredListings.length === 0 ? 0 : from}–{to} of{' '}
                  {filteredListings.length} listings
                </p>
                <nav className="fraud-pagination" aria-label="Fraud list pagination">
                  <ul className="pagination mb-0">
                    <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
                      <button
                        type="button"
                        className="page-link"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        aria-label="Previous page"
                      >
                        Previous
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <li
                          key={page}
                          className={`page-item ${currentPage === page ? 'active' : ''}`}
                        >
                          <button
                            type="button"
                            className="page-link"
                            onClick={() => setCurrentPage(page)}
                            aria-label={`Page ${page}`}
                            aria-current={currentPage === page ? 'page' : undefined}
                          >
                            {page}
                          </button>
                        </li>
                      )
                    )}
                    <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                      <button
                        type="button"
                        className="page-link"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage >= totalPages}
                        aria-label="Next page"
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FraudReviewList;
