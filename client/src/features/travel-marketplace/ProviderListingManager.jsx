import React, { useState, useEffect } from 'react';
import api from '../../lib/api.js';
import {
  Compass,
  Plus,
  MapPin,
  Users,
  Package,
  Calendar,
  Clock,
  Trash2,
  Edit3,
  ShieldCheck,
  CheckCircle,
  Truck
} from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import CreateTravelListingModal from './CreateTravelListingModal.jsx';

export default function ProviderListingManager() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchMyListings = async () => {
    setLoading(true);
    try {
      const userRes = await api.get('/auth/me').catch(() => null);
      const uid = userRes?.data?.data?.user?._id;
      const res = await api.get(`/travel-listings${uid ? `?providerId=${uid}` : ''}`);
      setListings(res.data.data.listings || []);
    } catch (err) {
      console.error('Error fetching provider listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to archive this travel listing?')) return;
    try {
      await api.delete(`/travel-listings/${id}`);
      fetchMyListings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to archive listing');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="surface" className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Compass size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">My Travel & Fleet Listings</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish available vehicles and routes to receive direct hiring contracts from companies and vendors.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowCreateModal(true)}
          className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> Create Travel Listing
        </Button>
      </Card>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : listings.length === 0 ? (
        <Card variant="surface" className="p-12 text-center rounded-3xl border border-dashed border-slate-300">
          <Truck className="mx-auto text-slate-300 mb-3" size={48} />
          <h3 className="text-lg font-bold text-slate-800">No Active Travel Listings</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
            You haven't posted any routes or vehicles yet. Click below to publish your first listing.
          </p>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="text-xs font-bold bg-blue-600 text-white"
          >
            Create First Listing
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => {
            const v = item.vehicleId || {};
            return (
              <Card key={item._id} variant="surface" className="p-5 rounded-3xl border border-slate-200 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                      {item.serviceCategory}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{item.title}</h3>
                  </div>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                    title="Archive Listing"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between text-xs font-semibold text-slate-700 border border-slate-100">
                  <span>{item.origin?.city}</span>
                  <span className="text-slate-400">→</span>
                  <span>{item.destination?.city}</span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="text-slate-500">
                    {v.category || v.vehicleType || 'Vehicle'} • {item.availableSeats || 1} Seats
                  </div>
                  <div className="font-extrabold text-blue-600">
                    ₹{(item.pricing?.amountPaise / 100).toLocaleString('en-IN')}
                    <span className="text-[10px] text-slate-400 font-normal"> ({item.pricing?.model})</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateTravelListingModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchMyListings();
          }}
        />
      )}
    </div>
  );
}
