import React, { useState, useEffect } from 'react';
import api from '../../lib/api.js';
import {
  X,
  Plus,
  Truck,
  MapPin,
  Calendar,
  Users,
  Package,
  DollarSign,
  Clock,
  Sparkles
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';

export default function CreateTravelListingModal({ onClose, onSuccess }) {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [serviceCategory, setServiceCategory] = useState('oneWay');
  const [originCity, setOriginCity] = useState('');
  const [originAddress, setOriginAddress] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [availableSeats, setAvailableSeats] = useState('');
  const [cargoCapacityKg, setCargoCapacityKg] = useState('');
  const [pricingModel, setPricingModel] = useState('perDay');
  const [rateRupees, setRateRupees] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await api.get('/vehicles/mine');
        const list = res.data.data.vehicles || [];
        setVehicles(list);
        if (list.length > 0) {
          setVehicleId(list[0]._id);
          setAvailableSeats(list[0].seatingCapacity || 1);
          setCargoCapacityKg(list[0].cargoCapacityKg || 0);
        }
      } catch (err) {
        console.error('Error fetching provider vehicles:', err);
      }
    };
    fetchVehicles();
  }, []);

  const handleVehicleChange = (vId) => {
    setVehicleId(vId);
    const chosen = vehicles.find((v) => v._id === vId);
    if (chosen) {
      if (chosen.seatingCapacity) setAvailableSeats(chosen.seatingCapacity);
      if (chosen.cargoCapacityKg) setCargoCapacityKg(chosen.cargoCapacityKg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleId || !title || !originCity || !destinationCity || !rateRupees) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const amountPaise = Math.round(Number(rateRupees) * 100);

      await api.post('/travel-listings', {
        vehicleId,
        title,
        description,
        serviceCategory,
        origin: {
          city: originCity,
          addressText: originAddress,
        },
        destination: {
          city: destinationCity,
          addressText: destinationAddress,
        },
        availableSeats: Number(availableSeats) || 1,
        cargoCapacityKg: Number(cargoCapacityKg) || 0,
        pricing: {
          model: pricingModel,
          amountPaise,
          isNegotiable,
        },
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create travel listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
              Marketplace Publishing
            </span>
            <h3 className="text-lg font-black mt-0.5">Post Vehicle or Travel Route</h3>
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

          {/* Vehicle Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Fleet Vehicle *
            </label>
            {vehicles.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                You haven't registered any vehicles yet. Please add a vehicle in the Vehicle Fleet manager before posting.
              </div>
            ) : (
              <select
                value={vehicleId}
                onChange={(e) => handleVehicleChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.vehicleNumber} ({v.category || v.vehicleType} - {v.manufacturer} {v.model})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Listing Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Daily Chennai - Bangalore Cargo / Tour"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Service Category *
              </label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="oneWay">One-Way Trip</option>
                <option value="roundTrip">Round Trip</option>
                <option value="multiDay">Multi-Day Travel</option>
                <option value="localRental">Local Vehicle Rental</option>
                <option value="staffTransport">Staff Transportation</option>
                <option value="goodsTransport">Goods & Freight</option>
                <option value="contractWeeklyMonthly">Monthly Vehicle Contract</option>
                <option value="longTermFleet">Long-Term Fleet</option>
              </select>
            </div>
          </div>

          {/* Origin & Destination */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Origin City *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Chennai"
                value={originCity}
                onChange={(e) => setOriginCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Destination City *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bangalore"
                value={destinationCity}
                onChange={(e) => setDestinationCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Capacities */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Passenger Seats
              </label>
              <input
                type="number"
                min="0"
                value={availableSeats}
                onChange={(e) => setAvailableSeats(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cargo Capacity (Kg)
              </label>
              <input
                type="number"
                min="0"
                value={cargoCapacityKg}
                onChange={(e) => setCargoCapacityKg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Pricing Model & Rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pricing Model *
              </label>
              <select
                value={pricingModel}
                onChange={(e) => setPricingModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="perKm">Per Kilometer (₹ / km)</option>
                <option value="perDay">Per Day (₹ / day)</option>
                <option value="perSeat">Per Seat (₹ / seat)</option>
                <option value="flatRate">Flat Rate (₹ fixed)</option>
                <option value="monthlyRate">Monthly Contract (₹ / mo)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estimated Rate (₹) *
              </label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g. 5000"
                value={rateRupees}
                onChange={(e) => setRateRupees(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description & Route Notes
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide amenities, AC specs, route waypoints, driver experience details..."
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="ghost" type="button" onClick={onClose} className="text-xs font-semibold">
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading || vehicles.length === 0}
              className="text-xs font-bold px-6 bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {loading ? 'Publishing...' : 'Publish Listing'} <Plus size={14} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
