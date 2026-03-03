import React, { useState, useEffect, useCallback } from 'react';
import ListingCard from './ListingCard';
import { getListings } from '../../api/listingsApi';

const PER_PAGE = 15;

/**
 * ListingList: load AI listings and paginate on frontend.
 */
function ListingList() {
  const [allListings, setAllListings] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getListings();
      const list = Array.isArray(result?.data) ? result.data : [];
      setAllListings(list);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to load listings.';
      setError(message);
      setAllListings([]);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const total = allListings.length;
  const lastPage = Math.max(1, Math.ceil((total || 0) / PER_PAGE));

  useEffect(() => {
    const start = (currentPage - 1) * PER_PAGE;
    setListings(allListings.slice(start, start + PER_PAGE));
  }, [allListings, currentPage]);

  useEffect(() => {
    if (currentPage > lastPage) {
      setCurrentPage(lastPage);
    }
  }, [currentPage, lastPage]);

  if (error) {
    return (
      <div className="listing-list listing-list--error" role="alert">
        <p className="listing-list__error-msg">{error}</p>
      </div>
    );
  }

  return (
    <div className="listing-list">
      <div className="listing-list__grid">
        {loading ? (
          <p className="listing-list__empty">Loading...</p>
        ) : listings.length === 0 ? (
          <p className="listing-list__empty">No listings found.</p>
        ) : (
          listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))
        )}
      </div>

      {total > 0 && (
        <>
          <nav className="listing-list__pagination" aria-label="Listings pagination">
            <button
              type="button"
              className="listing-list__page-btn"
              disabled={currentPage <= 1 || loading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="listing-list__page-info">
              Page {currentPage} of {lastPage}
              {total > 0 && (
                <span className="listing-list__total"> ({total} total)</span>
              )}
            </span>
            <button
              type="button"
              className="listing-list__page-btn"
              disabled={currentPage >= lastPage || loading}
              onClick={() => setCurrentPage((p) => Math.min(lastPage, p + 1))}
            >
              Next
            </button>
          </nav>
        </>
      )}
    </div>
  );
}

export default ListingList;
