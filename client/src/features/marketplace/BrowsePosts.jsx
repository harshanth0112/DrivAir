import React, { useState, useEffect } from 'react';
import api from '../../lib/api.js';
import {
  Compass,
  RotateCw,
  MapPin,
  Building2,
  Search,
  X
} from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function BrowsePosts() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contract-posts?status=open');
      setPosts(res.data.data.posts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPost) return;
    setSubmitting(true);
    try {
      const amountPaise = Math.round(Number(bidAmount) * 100);
      await api.post(`/contract-posts/${selectedPost._id}/bids`, {
        proposedAmountPaise: amountPaise,
        pricePeriod: selectedPost.budget?.pricePeriod || 'monthly',
        proposalMessage: bidMessage,
      });
      alert('Your bid proposal has been submitted to the company!');
      setSelectedPost(null);
      setBidAmount('');
      setBidMessage('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit bid');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPosts = posts.filter((p) => {
    const titleMatch = p.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = p.serviceCategory?.toLowerCase().includes(searchTerm.toLowerCase());
    const cityMatch = p.location?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    return titleMatch || categoryMatch || cityMatch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <Card variant="surface" className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-canvas)]">
              <Compass size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Open Contract Opportunities</h2>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Browse and bid on tenders published by corporate shippers and logistics operators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-3 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Filter by city, route, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3.5 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-full text-xs text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] w-52 sm:w-64 transition-all"
            />
          </div>
          <Button
            onClick={fetchPosts}
            disabled={loading}
            variant="secondary"
            className="text-xs"
          >
            <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>
        </div>
      </Card>

      {/* Posts Cards Grid */}
      {loading ? (
        <Card variant="surface" className="py-16 text-center text-[var(--color-text-muted)] flex flex-col items-center justify-center space-y-2">
          <RotateCw className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
          <p className="text-xs font-semibold">Scanning available marketplace tenders...</p>
        </Card>
      ) : filteredPosts.length === 0 ? (
        <Card variant="surface" className="p-12 text-center">
          <Compass className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-2" />
          <h4 className="text-sm font-bold text-white">No Open Tenders Found</h4>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {searchTerm ? 'Try adjusting your search criteria.' : 'Check back shortly for new contract posts.'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPosts.map((post) => (
            <Card
              key={post._id}
              variant="surface"
              className="p-6 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <Badge variant="open" className="text-[10px]">
                    {post.serviceCategory}
                  </Badge>
                  <div className="text-right">
                    <p className="text-lg font-black text-[var(--color-primary)] flex items-center justify-end">
                      ₹{((post.budget?.maxAmountPaise || 0) / 100).toLocaleString()}
                    </p>
                    <span className="text-[10px] text-[var(--color-text-muted)] uppercase font-semibold">
                      Budget / {post.budget?.pricePeriod || 'month'}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white leading-snug">{post.title}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 mt-0.5">
                    <Building2 size={12} /> {post.companyId?.companyName || 'Verified Company'}
                  </p>
                </div>

                <p className="text-xs text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed">
                  {post.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-secondary)] flex items-center gap-1">
                  <MapPin size={13} className="text-[var(--color-primary)]" />
                  {post.location?.city || 'Pan-India'}, {post.location?.state || ''}
                </span>
                <Button
                  onClick={() => setSelectedPost(post)}
                  variant="primary"
                  className="text-xs py-2 px-4"
                >
                  Submit Proposal
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Place Bid Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card variant="surface" className="max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[var(--color-border-subtle)]">
            <div className="flex items-start justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <div>
                <Badge variant="open" className="text-[10px] mb-1">
                  Bidding on Tender
                </Badge>
                <h3 className="text-base font-bold text-white mt-1">{selectedPost.title}</h3>
                <p className="text-xs text-[var(--color-text-secondary)]">{selectedPost.companyId?.companyName}</p>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="p-1 rounded-full text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBidSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                  Proposed Rate (in INR ₹ / {selectedPost.budget?.pricePeriod || 'month'})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-[var(--color-text-muted)] font-bold text-sm">₹</span>
                  <input
                    type="number"
                    placeholder="e.g. 45000"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    required
                    className="w-full pl-8 pr-3.5 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                </div>
                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                  Company budget limit: ₹{((selectedPost.budget?.maxAmountPaise || 0) / 100).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                  Proposal Cover Letter / Terms
                </label>
                <textarea
                  rows={4}
                  placeholder="Detail your availability, fleet readiness, commercial terms, or previous route experience..."
                  value={bidMessage}
                  onChange={(e) => setBidMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  onClick={() => setSelectedPost(null)}
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
                  {submitting ? 'Submitting...' : 'Confirm & Submit Bid'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
