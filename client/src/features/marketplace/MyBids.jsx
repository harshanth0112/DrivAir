import React, { useState, useEffect } from 'react';
import api from '../../lib/api.js';
import {
  Briefcase,
  RotateCw,
  Clock,
  IndianRupee,
  Building2,
  XCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function MyBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState(null);

  const fetchMyBids = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bids/mine');
      setBids(res.data.data.bids || []);
    } catch (err) {
      console.error('Failed to load my bids:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBids();
  }, []);

  const handleWithdrawBid = async (bidId) => {
    if (withdrawingId) return;
    if (!confirm('Are you sure you want to withdraw this bid proposal?')) return;
    setWithdrawingId(bidId);
    try {
      await api.patch(`/bids/${bidId}/withdraw`);
      alert('Your bid proposal was successfully withdrawn.');
      fetchMyBids();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to withdraw bid');
    } finally {
      setWithdrawingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <Badge variant="active">Accepted & Awarded</Badge>;
      case 'shortlisted':
        return <Badge variant="verified">Shortlisted</Badge>;
      case 'withdrawn':
        return <Badge variant="cancelled">Withdrawn</Badge>;
      case 'rejected':
        return <Badge variant="rejected">Rejected</Badge>;
      default:
        return <Badge variant="pending">Under Review</Badge>;
    }
  };

  return (
    <Card variant="surface" className="p-6 sm:p-8 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-canvas)]">
              <Briefcase size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Your Submitted Tender Bids</h3>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Track the approval status of your commercial transport proposals and manage active bids.
          </p>
        </div>

        <Button
          onClick={fetchMyBids}
          disabled={loading}
          variant="secondary"
          className="self-start sm:self-auto text-xs"
        >
          <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Content list */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-[var(--color-text-muted)] space-y-2">
          <RotateCw className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
          <p className="text-xs font-medium">Fetching submitted bids...</p>
        </div>
      ) : bids.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-[var(--color-border-subtle)] rounded-2xl p-6">
          <div className="w-12 h-12 rounded-full bg-white/5 text-[var(--color-text-muted)] flex items-center justify-center mx-auto mb-3">
            <Briefcase size={24} />
          </div>
          <h4 className="text-sm font-bold text-white">No Bids Submitted Yet</h4>
          <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto mt-1">
            Browse available commercial contract opportunities in the Marketplace tab to submit your proposals.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bids.map((b) => (
            <Card
              key={b._id}
              variant="elevated"
              className="p-5 hover:border-white/20 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--color-border-subtle)]">
                <div>
                  <h4 className="font-bold text-sm text-white">
                    {b.contractPostId?.title || 'Commercial Contract Tender'}
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                    <Building2 size={12} />
                    {b.contractPostId?.companyId?.companyName || 'Corporate Logistics Partner'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(b.status)}
                </div>
              </div>

              {b.proposalMessage && (
                <div className="p-3 bg-[var(--color-control)] rounded-xl text-xs text-[var(--color-text-secondary)] italic">
                  "{b.proposalMessage}"
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                    Your Proposed Rate
                  </span>
                  <p className="font-black text-[var(--color-primary)] text-base">
                    ₹{((b.proposedAmountPaise || 0) / 100).toLocaleString()}{' '}
                    <span className="text-xs font-normal text-[var(--color-text-secondary)]">
                      / {b.pricePeriod}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1">
                    <Clock size={12} />
                    Submitted: {new Date(b.createdAt).toLocaleDateString()}
                  </span>

                  {['pending', 'shortlisted'].includes(b.status) && (
                    <Button
                      onClick={() => handleWithdrawBid(b._id)}
                      disabled={withdrawingId === b._id}
                      variant="danger"
                      className="text-xs"
                    >
                      {withdrawingId === b._id ? (
                        <>
                          <RotateCw size={12} className="animate-spin" />
                          <span>Withdrawing...</span>
                        </>
                      ) : (
                        'Withdraw Bid'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}
