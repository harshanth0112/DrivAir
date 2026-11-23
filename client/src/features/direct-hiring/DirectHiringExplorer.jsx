import React, { useState, useEffect } from 'react';
import api from '../../lib/api.js';
import {
  Users,
  Send,
  Truck,
  Car,
  ShieldCheck,
  MapPin,
  Clock,
  RotateCw,
  X
} from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function DirectHiringExplorer() {
  const [providers, setProviders] = useState([]);
  const [role, setRole] = useState('driver');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [title, setTitle] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/direct-hiring/providers/search?role=${role}`);
      setProviders(res.data.data.providers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [role]);

  const handleSendOffer = async (e) => {
    e.preventDefault();
    if (!selectedProvider) return;
    setSubmitting(true);
    try {
      const offeredAmountPaise = Math.round(Number(offerPrice) * 100);
      await api.post('/direct-hiring/offers', {
        providerId: selectedProvider.user._id,
        providerType: role,
        title,
        description,
        offeredAmountPaise,
        pricePeriod: 'monthly',
      });
      alert('Direct hiring contract offer dispatched to provider!');
      setSelectedProvider(null);
      setTitle('');
      setOfferPrice('');
      setDescription('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send offer');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Role Filter Header */}
      <Card variant="surface" className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-canvas)]">
              <Users size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Direct Contractor Discovery</h2>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Search verified drivers and fleet operators for exclusive one-on-one direct contracts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-[var(--color-control)] p-1 rounded-full text-xs font-semibold">
            <button
              onClick={() => setRole('driver')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition cursor-pointer ${
                role === 'driver'
                  ? 'bg-[var(--color-primary)] text-[var(--color-canvas)] font-bold shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-white'
              }`}
            >
              <Truck size={14} />
              <span>Drivers</span>
            </button>
            <button
              onClick={() => setRole('vehicleOwner')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full transition cursor-pointer ${
                role === 'vehicleOwner'
                  ? 'bg-[var(--color-primary)] text-[var(--color-canvas)] font-bold shadow-sm'
                  : 'text-[var(--color-text-secondary)] hover:text-white'
              }`}
            >
              <Car size={14} />
              <span>Fleet Owners</span>
            </button>
          </div>

          <Button
            onClick={fetchProviders}
            disabled={loading}
            variant="secondary"
            className="p-2.5"
          >
            <RotateCw size={15} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </Card>

      {/* Providers Cards Grid */}
      {loading ? (
        <Card variant="surface" className="py-16 text-center text-[var(--color-text-muted)] flex flex-col items-center justify-center space-y-2">
          <RotateCw className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
          <p className="text-xs font-semibold">Locating verified {role} candidates...</p>
        </Card>
      ) : providers.length === 0 ? (
        <Card variant="surface" className="p-12 text-center">
          <Users className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-2" />
          <h4 className="text-sm font-bold text-white">No {role}s Registered</h4>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Providers will appear here once registered and verified on the platform.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {providers.map((p) => {
            const userObj = p.user || {};
            const prof = p.profile || {};
            return (
              <Card
                key={userObj._id}
                variant="surface"
                className="p-6 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)] text-[var(--color-canvas)] flex items-center justify-center font-black text-base shadow-sm">
                      {userObj.fullName ? userObj.fullName[0].toUpperCase() : 'P'}
                    </div>
                    <Badge variant="verified" className="text-[10px]">
                      Verified
                    </Badge>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-white leading-snug">
                      {userObj.fullName || 'Professional Provider'}
                    </h3>
                    <p className="text-xs text-[var(--color-text-secondary)] capitalize">{userObj.role}</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-[var(--color-text-secondary)] pt-1">
                    {prof.experienceYears !== undefined && (
                      <p className="flex items-center gap-2">
                        <Clock size={13} className="text-[var(--color-text-muted)]" />
                        <span>Experience: <strong className="text-white">{prof.experienceYears} Years</strong></span>
                      </p>
                    )}
                    {prof.city && (
                      <p className="flex items-center gap-2">
                        <MapPin size={13} className="text-[var(--color-text-muted)]" />
                        <span>Base: {prof.city}</span>
                      </p>
                    )}
                    {prof.availabilityStatus && (
                      <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 text-[var(--color-primary)]">
                        Status: {prof.availabilityStatus}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => setSelectedProvider(p)}
                  variant="primary"
                  className="w-full justify-center text-xs"
                >
                  <Send size={13} />
                  <span>Send Direct Offer</span>
                </Button>
              </Card>
            );
          })}
        </div>
      )}

      {/* Offer Modal */}
      {selectedProvider && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card variant="surface" className="max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[var(--color-border-subtle)]">
            <div className="flex items-start justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <div>
                <Badge variant="open" className="text-[10px] mb-1">
                  Direct Hire Contract Offer
                </Badge>
                <h3 className="text-base font-bold text-white mt-1">
                  Offer to {selectedProvider.user?.fullName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProvider(null)}
                className="p-1 rounded-full text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                  Contract Title / Role
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dedicated Inter-City Freight Logistics"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                  Offered Monthly Compensation (₹ INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[var(--color-text-muted)] font-bold text-sm">₹</span>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    required
                    className="w-full pl-8 pr-3.5 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                  Contract Scope & Key Conditions
                </label>
                <textarea
                  rows={4}
                  placeholder="Specify working schedule, trip details, vehicle maintenance responsibilities, and contract duration..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setSelectedProvider(null)}
                  variant="secondary"
                  className="flex-1 justify-center"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  variant="primary"
                  className="flex-1 justify-center"
                >
                  {submitting ? 'Sending Offer...' : 'Send Contract Offer'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
