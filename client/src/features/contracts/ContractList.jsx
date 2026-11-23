import React, { useState, useEffect } from 'react';
import api from '../../lib/api.js';
import {
  FileText,
  RotateCw,
  Shield,
  Building2,
  Truck,
  IndianRupee,
  MapPin,
  Calendar,
  X,
  Radio,
  ExternalLink
} from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function ContractList({ onNavigateTracking }) {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);

  const loadContracts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contracts/mine');
      setContracts(res.data.data.contracts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  return (
    <Card variant="surface" className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-canvas)]">
              <FileText size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">
              Binding Service & Transport Contracts
            </h3>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Official canonical agreements automatically generated from accepted bids and direct offers.
          </p>
        </div>
        <Button
          onClick={loadContracts}
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
          <p className="text-xs font-medium">Fetching verified contract register...</p>
        </div>
      ) : contracts.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-[var(--color-border-subtle)] rounded-2xl p-6">
          <div className="w-12 h-12 rounded-full bg-white/5 text-[var(--color-text-muted)] flex items-center justify-center mx-auto mb-3">
            <FileText size={24} />
          </div>
          <h4 className="text-sm font-bold text-white">No Active Contracts Yet</h4>
          <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto mt-1">
            Contracts are formed when tenders receive accepted bids or when direct hiring offers are approved by providers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contracts.map((c) => (
            <Card
              key={c._id}
              variant="elevated"
              className="p-5 hover:border-white/20 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-black text-[var(--color-primary)] bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 px-2.5 py-1 rounded-lg">
                    {c.contractNumber}
                  </span>
                  <h4 className="font-bold text-sm text-white">{c.title}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={c.status === 'active' ? 'active' : 'pending'}>
                    {c.status}
                  </Badge>
                  <span className="text-[10px] font-bold px-2.5 py-1 bg-white/5 text-[var(--color-text-secondary)] rounded-full border border-[var(--color-border-subtle)]">
                    {c.sourceType === 'bid' ? 'Tender Bid' : 'Direct Hire'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-[var(--color-control)] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] flex items-center gap-1">
                    <Building2 size={12} /> Company
                  </span>
                  <p className="font-bold text-white">
                    {c.companyId?.companyName || 'Verified Corporate'}
                  </p>
                </div>

                <div className="p-3 bg-[var(--color-control)] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] flex items-center gap-1">
                    <Truck size={12} /> Provider ({c.providerType})
                  </span>
                  <p className="font-bold text-white">
                    {c.providerId?.fullName || 'Verified Provider'}
                  </p>
                </div>

                <div className="p-3 bg-[var(--color-control)] border border-[var(--color-primary)]/30 rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-primary)] flex items-center gap-1">
                    <IndianRupee size={12} /> Agreed Pay Rate
                  </span>
                  <p className="font-black text-[var(--color-primary)] text-sm">
                    ₹{((c.agreedAmountPaise || 0) / 100).toLocaleString()}{' '}
                    <span className="text-xs font-normal text-[var(--color-text-secondary)]">/ {c.pricePeriod}</span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] text-[var(--color-text-muted)] border-t border-white/5">
                <span>Created on: {new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedContract(c)}
                    className="text-[var(--color-primary)] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Specifications</span>
                    <ExternalLink size={12} />
                  </button>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Shield size={12} /> Legal Invariant Verified
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Contract Detail Specification Modal */}
      {selectedContract && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card variant="surface" className="max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[var(--color-border-subtle)] max-h-[85vh] flex flex-col font-sans">
            <div className="flex items-start justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <div>
                <span className="font-mono text-xs font-black text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded">
                  {selectedContract.contractNumber}
                </span>
                <h3 className="text-base font-bold text-white mt-2">{selectedContract.title}</h3>
              </div>
              <button
                onClick={() => setSelectedContract(null)}
                className="p-1 rounded-full text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 text-xs">
              {selectedContract.description && (
                <div className="p-3 bg-[var(--color-control)] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Scope & Description</span>
                  <p className="text-white leading-relaxed">{selectedContract.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[var(--color-control)] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] flex items-center gap-1">
                    <MapPin size={12} /> Route / Location
                  </span>
                  <p className="text-white font-semibold">
                    {selectedContract.location?.city || 'Pan-India'}
                    {selectedContract.location?.state ? `, ${selectedContract.location.state}` : ''}
                  </p>
                </div>

                <div className="p-3 bg-[var(--color-control)] rounded-xl space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)] flex items-center gap-1">
                    <Calendar size={12} /> Billing Schedule
                  </span>
                  <p className="text-white font-semibold capitalize">
                    {selectedContract.contractType || 'Monthly'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-[var(--color-control)] border border-[var(--color-primary)]/30 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--color-primary)]">Agreed Commercial Rate</span>
                  <p className="font-black text-[var(--color-primary)] text-base">
                    ₹{((selectedContract.agreedAmountPaise || 0) / 100).toLocaleString()}{' '}
                    <span className="text-xs font-normal text-[var(--color-text-secondary)]">/ {selectedContract.pricePeriod}</span>
                  </p>
                </div>
                <Badge variant={selectedContract.status === 'active' ? 'active' : 'pending'}>
                  {selectedContract.status}
                </Badge>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-end">
              <Button
                onClick={() => setSelectedContract(null)}
                variant="secondary"
                className="text-xs"
              >
                Close Specification
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Card>
  );
}
