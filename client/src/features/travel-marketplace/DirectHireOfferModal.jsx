import React, { useState } from 'react';
import api from '../../lib/api.js';
import {
  X,
  Send,
  Calendar,
  DollarSign,
  Users,
  Package,
  MapPin,
  Clock,
  FileText
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';

export default function DirectHireOfferModal({ listing, onClose, onSuccess }) {
  if (!listing) return null;

  const v = listing.vehicleId || {};
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [passengersCount, setPassengersCount] = useState(listing.availableSeats || 1);
  const [cargoWeightKg, setCargoWeightKg] = useState(listing.cargoCapacityKg || 0);
  const [offerRupees, setOfferRupees] = useState(
    listing.pricing?.amountPaise ? Math.round(listing.pricing.amountPaise / 100) : ''
  );
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !offerRupees) {
      setError('Please provide start date, end date, and proposed amount.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const offeredAmountPaise = Math.round(Number(offerRupees) * 100);

      await api.post('/direct-hiring/offers', {
        providerId: listing.providerId?._id || listing.providerId,
        providerType: listing.providerType || 'vehicleOwner',
        vehicleId: v._id,
        travelListingId: listing._id,
        title: `Hire Request: ${listing.title}`,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location: {
          city: listing.origin?.city,
          addressText: `${listing.origin?.city} to ${listing.destination?.city}`,
        },
        contractType: 'custom',
        pricePeriod: listing.pricing?.model === 'monthlyRate' ? 'monthly' : 'total',
        passengersCount: Number(passengersCount) || 1,
        cargoWeightKg: Number(cargoWeightKg) || 0,
        offeredAmountPaise,
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit direct hiring offer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
              Direct B2B Agreement
            </span>
            <h3 className="text-lg font-black mt-0.5">Submit Hiring Offer</h3>
            <p className="text-xs text-slate-300 line-clamp-1">{listing.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Capacity Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Passengers
              </label>
              <input
                type="number"
                min="1"
                value={passengersCount}
                onChange={(e) => setPassengersCount(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cargo (Kg)
              </label>
              <input
                type="number"
                min="0"
                value={cargoWeightKg}
                onChange={(e) => setCargoWeightKg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Proposed Budget */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Proposed Total Amount (INR ₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                required
                min="100"
                value={offerRupees}
                onChange={(e) => setOfferRupees(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 15000"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Listing base rate: ₹{(listing.pricing?.amountPaise / 100).toLocaleString('en-IN')} ({listing.pricing?.model})
            </p>
          </div>

          {/* Message / Requirements */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Special Requirements & Notes
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Pickup from factory warehouse at 6 AM, driver lodging included..."
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Terms Note */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-blue-700 leading-relaxed">
            Upon provider acceptance, DRIVAIR automatically executes an atomic availability lock and creates a canonical binding contract.
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose} className="text-xs font-semibold">
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="text-xs font-bold px-6 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {loading ? 'Transmitting...' : 'Send Contract Offer'} <Send size={14} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
