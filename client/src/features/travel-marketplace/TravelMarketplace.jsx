import React, { useState, useEffect } from 'react';
import api from '../../lib/api.js';
import {
  Compass,
  MapPin,
  Calendar,
  Users,
  Package,
  DollarSign,
  ShieldCheck,
  Search,
  RotateCw,
  Truck,
  Car,
  Filter,
  CheckCircle,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import TravelListingDetailModal from './TravelListingDetailModal.jsx';
import DirectHireOfferModal from './DirectHireOfferModal.jsx';

export default function TravelMarketplace({ onOpenChat }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [originCity, setOriginCity] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [vehicleCategory, setVehicleCategory] = useState('');
  const [pricingModel, setPricingModel] = useState('');
  
  // Modals state
  const [selectedListing, setSelectedListing] = useState(null);
  const [hireListing, setHireListing] = useState(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (originCity) params.append('originCity', originCity);
      if (destinationCity) params.append('destinationCity', destinationCity);
      if (serviceCategory) params.append('serviceCategory', serviceCategory);
      if (pricingModel) params.append('pricingModel', pricingModel);

      const res = await api.get(`/travel-listings?${params.toString()}`);
      setListings(res.data.data.listings || []);
    } catch (err) {
      console.error('Error fetching travel listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [serviceCategory, pricingModel]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchListings();
  };

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
    <div className="space-y-6">
      {/* Header Banner */}
      <Card variant="surface" className="p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl shadow-lg border-0">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-3">
            <Sparkles size={14} /> Direct B2B Vehicle & Travel Marketplace
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Discover Verified Vehicles & Travel Routes
          </h2>
          <p className="mt-2 text-sm sm:text-base text-blue-100/80 leading-relaxed">
            Hire commercial carriers, passenger buses, SUVs, and dedicated fleet routes directly from verified vehicle owners and transport operators. No broker markups.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-6 grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-md">
          <div className="sm:col-span-4 relative">
            <MapPin className="absolute left-3.5 top-3.5 text-blue-300" size={18} />
            <input
              type="text"
              placeholder="Origin City (e.g. Chennai)"
              value={originCity}
              onChange={(e) => setOriginCity(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/10 text-white placeholder-blue-200/60 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="sm:col-span-4 relative">
            <MapPin className="absolute left-3.5 top-3.5 text-blue-300" size={18} />
            <input
              type="text"
              placeholder="Destination (e.g. Bangalore)"
              value={destinationCity}
              onChange={(e) => setDestinationCity(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white/10 text-white placeholder-blue-200/60 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="sm:col-span-4 flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Search size={16} /> Search Routes
            </button>
            <button
              type="button"
              onClick={() => {
                setOriginCity('');
                setDestinationCity('');
                setServiceCategory('');
                setPricingModel('');
                fetchListings();
              }}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all cursor-pointer"
              title="Reset Search"
            >
              <RotateCw size={16} />
            </button>
          </div>
        </form>
      </Card>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: '', label: 'All Services' },
          { id: 'oneWay', label: 'One-Way Trips' },
          { id: 'roundTrip', label: 'Round Trips' },
          { id: 'localRental', label: 'Local Rentals' },
          { id: 'staffTransport', label: 'Staff Transport' },
          { id: 'goodsTransport', label: 'Goods & Freight' },
          { id: 'contractWeeklyMonthly', label: 'Monthly Fleet' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setServiceCategory(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              serviceCategory === tab.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <Card variant="surface" className="p-12 text-center rounded-3xl border border-dashed border-slate-300">
          <Truck className="mx-auto text-slate-300 mb-3" size={48} />
          <h3 className="text-lg font-bold text-slate-800">No Travel Listings Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or clear filters to view all available transport vehicles.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {listings.map((item) => {
            const v = item.vehicleId || {};
            const badges = v.badges || {};
            const coverImage = item.listingImages?.[0] || v.photos?.[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800';

            return (
              <Card
                key={item._id}
                variant="surface"
                className="overflow-hidden rounded-3xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Image & Price Header */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={coverImage}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    
                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-blue-600/90 text-white text-[11px] font-bold backdrop-blur-md uppercase tracking-wider">
                        {item.serviceCategory}
                      </span>
                      {badges.overallVerified && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-600/90 text-white text-[11px] font-bold backdrop-blur-md flex items-center gap-1">
                          <ShieldCheck size={12} /> Verified Fleet
                        </span>
                      )}
                    </div>

                    {/* Bottom overlay in image */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                      <div>
                        <div className="text-xs text-slate-200 font-medium">Registration Masked</div>
                        <div className="text-sm font-extrabold tracking-wide text-white">
                          {v.maskedVehicleNumber || 'TN-**-****'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-white leading-tight">
                          {formatPrice(item.pricing?.amountPaise || 0, item.pricing?.model)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                        {item.description || 'Verified commercial vehicle available for direct contract.'}
                      </p>
                    </div>

                    {/* Route Display */}
                    <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between border border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                        <span className="text-xs font-bold text-slate-800">{item.origin?.city}</span>
                      </div>
                      <ArrowRight size={14} className="text-slate-400" />
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">{item.destination?.city}</span>
                      </div>
                    </div>

                    {/* Specs Pills */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Category</div>
                        <div className="text-xs font-bold text-slate-700 capitalize mt-0.5">
                          {v.category || v.vehicleType || 'Transport'}
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Capacity</div>
                        <div className="text-xs font-bold text-slate-700 mt-0.5 flex items-center justify-center gap-1">
                          <Users size={12} /> {item.availableSeats || v.seatingCapacity || 1}
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-semibold uppercase">Climate</div>
                        <div className="text-xs font-bold text-slate-700 mt-0.5">
                          {v.isAirConditioned ? 'AC' : 'Non-AC'}
                        </div>
                      </div>
                    </div>

                    {/* Verified Badges */}
                    <div className="pt-1 flex flex-wrap gap-1.5 text-[10px]">
                      {badges.rcVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                          <CheckCircle size={10} /> RC Verified
                        </span>
                      )}
                      {badges.permitVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                          <CheckCircle size={10} /> Permit Verified
                        </span>
                      )}
                      {badges.insuranceVerified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                          <CheckCircle size={10} /> Insurance Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedListing(item)}
                    className="w-full justify-center text-xs font-bold"
                  >
                    View Details
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setHireListing(item)}
                    className="w-full justify-center text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Hire Vehicle
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {selectedListing && (
        <TravelListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onHire={(item) => {
            setSelectedListing(null);
            setHireListing(item);
          }}
          onContact={(item) => {
            setSelectedListing(null);
            if (onOpenChat) onOpenChat(item);
          }}
        />
      )}

      {hireListing && (
        <DirectHireOfferModal
          listing={hireListing}
          onClose={() => setHireListing(null)}
          onSuccess={() => {
            setHireListing(null);
            alert('Your hiring offer has been submitted to the provider!');
          }}
        />
      )}
    </div>
  );
}
