import React, { useState, useEffect, useCallback } from 'react';
import { getListings } from '../../api/listingsApi';
import FraudStatsCards from './FraudStatsCards';
import FraudFilterBar from './FraudFilterBar';
import FraudListingTable from './FraudListingTable';
import FraudDetailModal from './FraudDetailModal';

function computeStats(list) {
  const stats = {
    total: list.length,
    approved: 0,
    pending_ai_review: 0,
    check_something_wrong: 0,
    rejected: 0,
  };
  list.forEach((item) => {
    const s = item.ai_status || 'pending_ai_review';
    if (s === 'limited_visibility') {
      stats.check_something_wrong++;
    } else if (s === 'blocked') {
      stats.rejected++;
    } else if (stats[s] !== undefined) {
      stats[s]++;
    } else {
      stats.pending_ai_review++;
    }
  });
  return stats;
}

function FraudDashboard() {
  const [listings, setListings] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedListing, setSelectedListing] = useState(null);

  const fetchData = useCallback(async () => {
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedStatus) {
      setListings(
        allListings.filter((item) => {
          const status = item.ai_status || 'pending_ai_review';
          if (selectedStatus === 'check_something_wrong') {
            return status === 'check_something_wrong' || status === 'limited_visibility';
          }
          if (selectedStatus === 'rejected') {
            return status === 'rejected' || status === 'blocked';
          }
          return status === selectedStatus;
        })
      );
    } else {
      setListings(allListings);
    }
  }, [allListings, selectedStatus]);

  const handleFilterChange = (value) => {
    setSelectedStatus(value);
  };

  const handleView = (listing) => {
    setSelectedListing(listing);
  };

  const stats = computeStats(allListings);

  if (error) {
    return (
      <div className="fraud-dashboard fraud-dashboard--error" role="alert">
        <p className="fraud-dashboard__error">{error}</p>
      </div>
    );
  }

  return (
    <div className="fraud-dashboard">
      <FraudStatsCards counts={stats} />
      <FraudFilterBar
        value={selectedStatus}
        onChange={handleFilterChange}
        disabled={loading}
      />
      {loading ? (
        <div className="fraud-dashboard__loading">
          <p>Loading listings...</p>
        </div>
      ) : (
        <FraudListingTable listings={listings} onView={handleView} />
      )}
      {selectedListing && (
        <FraudDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
}

export default FraudDashboard;
