import React, { useState, useEffect } from 'react';
import api from '../../lib/api.js';
import {
  Inbox,
  RotateCw,
  Building2,
  Clock
} from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function ReceivedOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const loadOffers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/direct-hiring/offers/received');
      setOffers(res.data.data.offers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleAction = async (id, action) => {
    if (processingId) return;
    const isAccept = action === 'accept';
    if (!confirm(`Are you sure you want to ${action} this contract offer?${isAccept ? ' An official binding contract will be formed immediately.' : ''}`)) return;
    setProcessingId(id);
    try {
      if (isAccept) {
        await api.post(`/direct-hiring/offers/${id}/accept`);
        alert('Direct contract offer accepted! Official contract generated.');
      } else {
        await api.post(`/direct-hiring/offers/${id}/reject`);
        alert('Offer declined.');
      }
      loadOffers();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} offer`);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Card variant="surface" className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-canvas)]">
              <Inbox size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">
              Direct Contract Hiring Requests
            </h3>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Exclusive job offers sent directly to you by verified corporate shippers.
          </p>
        </div>

        <Button
          onClick={loadOffers}
          disabled={loading}
          variant="secondary"
          className="self-start sm:self-auto text-xs"
        >
          <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center text-[var(--color-text-muted)] space-y-2">
          <RotateCw className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
          <p className="text-xs font-semibold">Checking your direct offer inbox...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-[var(--color-border-subtle)] rounded-2xl p-6">
          <div className="w-12 h-12 rounded-full bg-white/5 text-[var(--color-text-muted)] flex items-center justify-center mx-auto mb-3">
            <Inbox size={24} />
          </div>
          <h4 className="text-sm font-bold text-white">No Direct Offers Received Yet</h4>
          <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto mt-1">
            Make sure your profile and verification documents are up to date so companies can find and offer you contracts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {offers.map((offer) => (
            <Card
              key={offer._id}
              variant="elevated"
              className="p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--color-border-subtle)]">
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-white">{offer.title}</h4>
                  <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5">
                    <Building2 size={13} className="text-[var(--color-text-muted)]" />
                    <span>Company: <strong className="text-white">{offer.companyId?.companyName || 'Verified Corporate'}</strong></span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={offer.status === 'accepted' ? 'active' : offer.status === 'rejected' ? 'rejected' : 'pending'}>
                    <Clock size={11} className="inline mr-1" />
                    {offer.status}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-[var(--color-text-secondary)] bg-[var(--color-control)] p-3 rounded-xl italic leading-relaxed">
                "{offer.description}"
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Offered Compensation</span>
                  <p className="font-black text-[var(--color-primary)] text-base">
                    ₹{((offer.offeredAmountPaise || 0) / 100).toLocaleString()}{' '}
                    <span className="text-xs font-normal text-[var(--color-text-secondary)]">/ {offer.pricePeriod}</span>
                  </p>
                </div>

                {offer.status === 'pending' && (
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleAction(offer._id, 'accept')}
                      disabled={processingId === offer._id}
                      variant="primary"
                      className="text-xs"
                    >
                      {processingId === offer._id ? 'Processing...' : 'Accept & Bind Contract'}
                    </Button>
                    <Button
                      onClick={() => handleAction(offer._id, 'reject')}
                      disabled={processingId === offer._id}
                      variant="danger"
                      className="text-xs"
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
}
