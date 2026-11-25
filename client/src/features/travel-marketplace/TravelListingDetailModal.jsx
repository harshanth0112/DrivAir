import React from 'react';
import {
  X,
  MapPin,
  Calendar,
  Users,
  Package,
  ShieldCheck,
  CheckCircle,
  Truck,
  Car,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function TravelListingDetailModal({ listing, onClose, onHire, onContact }) {
  if (!listing) return null;

  const v = listing.vehicleId || {};
  const badges = v.badges || {};
  const provider = listing.providerId || {};

  const formatPrice = (paise, model) => {
    const rupees = (paise / 100).toLocaleString('en-IN');
    const unitMap = {
      perKm: '/ km',
      perDay: '/ day',
      perSeat: '/ seat',
      flatRate: 'flat',
      monthlyRate: '/ mo',
    };
    return `₹${rupees} ${unitMap[model] || ''}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="relative h-64 bg-slate-900 shrink-0">
          <img
            src={listing.listingImages?.[0] || v.photos?.[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=1200'}
            alt={listing.title}
            className="w-full h-full object-cover opacity-80"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-all cursor-pointer"
          >
            <X size={20} />
          </button>

          <div className="absolute bottom-4 left-4 right-4 text-white flex items-end justify-between">
            <div>
              <span className="px-3 py-1 rounded-full bg-blue-600 text-xs font-bold uppercase tracking-wider">
                {listing.serviceCategory}
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-2 leading-tight">
                {listing.title}
              </h2>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-300">Offered Rate</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                {formatPrice(listing.pricing?.amountPaise || 0, listing.pricing?.model)}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Route Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                A
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Origin</div>
                <div className="text-sm font-bold text-slate-900">{listing.origin?.city}</div>
                {listing.origin?.addressText && (
                  <div className="text-xs text-slate-500">{listing.origin.addressText}</div>
                )}
              </div>
            </div>

            <ArrowRight size={20} className="text-slate-300 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                B
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">Destination</div>
                <div className="text-sm font-bold text-slate-900">{listing.destination?.city}</div>
                {listing.destination?.addressText && (
                  <div className="text-xs text-slate-500">{listing.destination.addressText}</div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Service Description</h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              {listing.description || 'No additional service notes provided by operator.'}
            </p>
          </div>

          {/* Vehicle Specifications */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Vehicle Details & Verification</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Registration</div>
                <div className="text-xs font-extrabold text-slate-800 mt-0.5">
                  {v.maskedVehicleNumber || 'TN-**-****'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Category</div>
                <div className="text-xs font-bold text-slate-800 capitalize mt-0.5">
                  {v.category || v.vehicleType || 'Transport'}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Passenger Seats</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  <Users size={12} /> {listing.availableSeats || v.seatingCapacity || 1} Seats
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Cargo Payload</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  <Package size={12} /> {listing.cargoCapacityKg || v.cargoCapacityKg || 0} Kg
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Badges */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <ShieldCheck size={16} /> Verified Document Compliance Records
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-white font-medium text-slate-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle size={12} className="text-emerald-600" /> Registration Certificate (RC)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white font-medium text-slate-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle size={12} className="text-emerald-600" /> Commercial Carrier Permit
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white font-medium text-slate-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle size={12} className="text-emerald-600" /> Commercial Motor Insurance
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white font-medium text-slate-700 border border-emerald-200 flex items-center gap-1">
                <CheckCircle size={12} className="text-emerald-600" /> Fitness Certificate
              </span>
            </div>
          </div>

          {/* Provider Profile Summary */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-base">
                {provider.fullName?.[0] || 'P'}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">{provider.fullName || 'Verified Provider'}</div>
                <div className="text-xs text-slate-500 capitalize">{provider.role} Partner</div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onContact && onContact(listing)}
              className="text-xs font-semibold gap-1.5"
            >
              Message Provider
            </Button>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <Button variant="ghost" onClick={onClose} className="text-xs font-semibold">
            Close
          </Button>
          <Button
            variant="primary"
            onClick={() => onHire && onHire(listing)}
            className="text-xs font-bold px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Hire Vehicle / Submit Offer
          </Button>
        </div>
      </div>
    </div>
  );
}
