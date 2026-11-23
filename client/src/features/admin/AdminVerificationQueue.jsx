import React, { useState, useEffect } from 'react';
import api from '../../lib/api.js';
import {
  ShieldCheck,
  RotateCw,
  ExternalLink,
  Check,
  X
} from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function AdminVerificationQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await api.get('/documents/admin/queue?status=pending');
      setQueue(res.data.data.documents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleDecision = async (id, status, reason = '') => {
    try {
      await api.patch(`/documents/admin/${id}/verify`, {
        status,
        rejectionReason: reason,
      });
      loadQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Verification update failed');
    }
  };

  return (
    <Card variant="surface" className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-canvas)]">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">
              Compliance Document Verification Queue
            </h3>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Review and adjudicate identity documents, licenses, and permits submitted by market participants.
          </p>
        </div>

        <Button
          onClick={loadQueue}
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
          <p className="text-xs font-semibold">Loading pending documents queue...</p>
        </div>
      ) : queue.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-[var(--color-border-subtle)] rounded-2xl p-6">
          <div className="w-12 h-12 rounded-full bg-white/5 text-[var(--color-primary)] flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={24} />
          </div>
          <h4 className="text-sm font-bold text-white">Verification Queue Clear</h4>
          <p className="text-xs text-[var(--color-text-muted)] max-w-md mx-auto mt-1">
            All submitted compliance and identity records have been adjudicated.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--color-control)] border-b border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Applicant</th>
                <th className="py-3 px-4">Document Category</th>
                <th className="py-3 px-4">Identification No.</th>
                <th className="py-3 px-4">Proof Link</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Adjudication</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {queue.map((doc) => (
                <tr key={doc._id} className="hover:bg-white/5 transition">
                  <td className="py-3 px-4">
                    <p className="font-bold text-white">{doc.ownerId?.fullName || doc.ownerId?.email || 'User'}</p>
                    <span className="text-[10px] text-[var(--color-primary)] font-semibold uppercase">{doc.ownerType}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[var(--color-text-secondary)] capitalize">
                    {doc.documentType.replace(/([A-Z])/g, ' $1')}
                  </td>
                  <td className="py-3 px-4 font-mono text-[var(--color-text-muted)]">
                    {doc.documentNumber || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <a
                      href={doc.secureUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[var(--color-primary)] hover:underline font-semibold text-xs"
                    >
                      <span>Inspect</span>
                      <ExternalLink size={12} />
                    </a>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <Button
                      onClick={() => handleDecision(doc._id, 'verified')}
                      variant="primary"
                      className="text-xs py-1.5 px-3"
                    >
                      <Check size={12} />
                      <span>Approve</span>
                    </Button>
                    <Button
                      onClick={() => {
                        const reason = prompt('Specify rejection reason:');
                        if (reason) handleDecision(doc._id, 'rejected', reason);
                      }}
                      variant="danger"
                      className="text-xs py-1.5 px-3"
                    >
                      <X size={12} />
                      <span>Reject</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
