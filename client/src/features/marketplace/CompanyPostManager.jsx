import React, { useState, useEffect } from 'react';
import api from '../../lib/api.js';
import {
  Briefcase,
  Plus,
  Eye,
  RotateCw,
  X
} from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function CompanyPostManager() {
  const [posts, setPosts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Transport');
  const [maxBudget, setMaxBudget] = useState('');
  const [selectedPostBids, setSelectedPostBids] = useState(null);
  const [bids, setBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [acceptingBidId, setAcceptingBidId] = useState(null);
  const [closingPostId, setClosingPostId] = useState(null);

  const loadMyPosts = async () => {
    try {
      const res = await api.get('/contract-posts/mine');
      setPosts(res.data.data.posts || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadMyPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const maxAmountPaise = Math.round(Number(maxBudget) * 100);
      const res = await api.post('/contract-posts', {
        title,
        description,
        serviceCategory: category,
        budget: {
          maxAmountPaise,
          pricePeriod: 'monthly',
        },
      });
      // Publish automatically for easy MVP flow
      await api.post(`/contract-posts/${res.data.data.post._id}/publish`);
      setShowCreate(false);
      setTitle('');
      setDescription('');
      setMaxBudget('');
      loadMyPosts();
    } catch (err) {
      const msg = err.response?.data?.details
        ? err.response.data.details.map((d) => `${d.field}: ${d.message}`).join(', ')
        : err.response?.data?.message || 'Failed to create post';
      alert(msg);
    }
  };

  const handleViewBids = async (post) => {
    setSelectedPostBids(post);
    setLoadingBids(true);
    try {
      const res = await api.get(`/contract-posts/${post._id}/bids`);
      setBids(res.data.data.bids || []);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch bids');
    } finally {
      setLoadingBids(false);
    }
  };

  const handleClosePost = async (postId) => {
    if (closingPostId) return;
    if (!confirm('Are you sure you want to close this tender post? No further bids will be accepted.')) return;
    setClosingPostId(postId);
    try {
      await api.post(`/contract-posts/${postId}/close`);
      alert('Tender post successfully closed.');
      loadMyPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close tender');
    } finally {
      setClosingPostId(null);
    }
  };

  const handleAcceptBid = async (bidId) => {
    if (acceptingBidId) return;
    if (!confirm('Are you sure you want to accept this bid? This will atomically generate a binding contract.')) return;
    setAcceptingBidId(bidId);
    try {
      await api.post(`/bids/${bidId}/accept`);
      alert('Bid accepted! Legal contract created.');
      handleViewBids(selectedPostBids);
      loadMyPosts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error accepting bid');
    } finally {
      setAcceptingBidId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <Card variant="surface" className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-canvas)]">
              <Briefcase size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Your Company Tender Requirements</h2>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Create corporate transport tenders, evaluate incoming contractor bids, and award binding contracts.
          </p>
        </div>

        <Button
          onClick={() => setShowCreate(!showCreate)}
          variant={showCreate ? 'secondary' : 'primary'}
          className="self-start sm:self-auto text-xs"
        >
          {showCreate ? <X size={15} /> : <Plus size={15} />}
          <span>{showCreate ? 'Close Form' : 'Publish New Tender'}</span>
        </Button>
      </Card>

      {/* Tender Creation Form */}
      {showCreate && (
        <Card variant="surface" className="p-6 sm:p-8 border border-[var(--color-primary)]/40 space-y-4">
          <h3 className="text-base font-bold text-white">Publish New Commercial Requirement</h3>
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                  Contract Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dedicated Driver & Fleet for FMCG Distribution"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                  Service Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
                >
                  <option value="Transport" className="bg-[#171717]">Freight & Transport</option>
                  <option value="DriverOnly" className="bg-[#171717]">Dedicated Driver Only</option>
                  <option value="FleetLeasing" className="bg-[#171717]">Fleet Leasing & Logistics</option>
                  <option value="Passenger" className="bg-[#171717]">Corporate Passenger Transit</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                Max Monthly Budget (in ₹ INR)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-[var(--color-text-muted)] font-bold text-sm">₹</span>
                <input
                  type="number"
                  placeholder="e.g. 60000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                  required
                  className="w-full pl-8 pr-3.5 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                Specification & Route Details
              </label>
              <textarea
                rows={3}
                placeholder="Mention working hours, expected routes, vehicle specifications, tonnage requirements..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="px-6"
            >
              Publish Tender Immediately
            </Button>
          </form>
        </Card>
      )}

      {/* Posts List */}
      <div className="grid grid-cols-1 gap-4">
        {posts.length === 0 ? (
          <Card variant="surface" className="p-12 text-center">
            <Briefcase className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">No Requirements Published</h4>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Click "+ Publish New Tender" above to broadcast contracts to our verified network.
            </p>
          </Card>
        ) : (
          posts.map((post) => (
            <Card
              key={post._id}
              variant="surface"
              className="p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--color-border-subtle)]">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="open" className="text-[10px]">
                      {post.serviceCategory}
                    </Badge>
                    <h3 className="font-bold text-base text-white">{post.title}</h3>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)] mt-1">
                    Published: {new Date(post.createdAt).toLocaleDateString()} · Status: <span className="font-semibold capitalize text-[var(--color-primary)]">{post.status}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-black text-sm text-[var(--color-primary)]">
                      ₹{((post.budget?.maxAmountPaise || 0) / 100).toLocaleString()}
                    </p>
                    <span className="text-[10px] text-[var(--color-text-muted)]">Budget Limit</span>
                  </div>

                  <Button
                    onClick={() => handleViewBids(post)}
                    variant="secondary"
                    className="text-xs"
                  >
                    <Eye size={14} />
                    <span>View Bids ({post.bidsCount || 0})</span>
                  </Button>

                  {['open', 'partiallyAwarded'].includes(post.status) && (
                    <Button
                      onClick={() => handleClosePost(post._id)}
                      disabled={closingPostId === post._id}
                      variant="danger"
                      className="text-xs"
                    >
                      {closingPostId === post._id ? 'Closing...' : 'Close Tender'}
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">{post.description}</p>
            </Card>
          ))
        )}
      </div>

      {/* Bids Modal */}
      {selectedPostBids && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card variant="surface" className="max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-[var(--color-border-subtle)] max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <div>
                <Badge variant="open" className="text-[10px] mb-1">
                  Submitted Bids Review
                </Badge>
                <h3 className="text-base font-bold text-white mt-1">{selectedPostBids.title}</h3>
              </div>
              <button
                onClick={() => setSelectedPostBids(null)}
                className="p-1 rounded-full text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {loadingBids ? (
                <div className="py-12 text-center text-[var(--color-text-muted)] text-xs flex items-center justify-center gap-2">
                  <RotateCw size={14} className="animate-spin text-[var(--color-primary)]" />
                  <span>Loading candidate bids...</span>
                </div>
              ) : bids.length === 0 ? (
                <p className="py-12 text-center text-[var(--color-text-muted)] text-xs">
                  No bids submitted yet for this tender post.
                </p>
              ) : (
                bids.map((b) => (
                  <Card
                    key={b._id}
                    variant="subtle"
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {b.providerId?.fullName || 'Verified Provider'}
                        </span>
                        <Badge variant="verified" className="text-[10px]">
                          {b.providerType}
                        </Badge>
                        <Badge variant={b.status === 'accepted' ? 'active' : 'pending'} className="text-[10px]">
                          {b.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-[var(--color-text-secondary)] italic">"{b.proposalMessage}"</p>
                      <p className="text-xs font-black text-[var(--color-primary)] pt-1">
                        Offered Rate: ₹{((b.proposedAmountPaise || 0) / 100).toLocaleString()} / {b.pricePeriod}
                      </p>
                    </div>

                    {(b.status === 'pending' || b.status === 'submitted' || b.status === 'shortlisted') && (
                      <Button
                        onClick={() => handleAcceptBid(b._id)}
                        disabled={acceptingBidId === b._id}
                        variant="primary"
                        className="text-xs self-start sm:self-auto shrink-0"
                      >
                        {acceptingBidId === b._id ? (
                          <>
                            <RotateCw size={12} className="animate-spin" />
                            <span>Forming Contract...</span>
                          </>
                        ) : (
                          'Accept & Form Contract'
                        )}
                      </Button>
                    )}
                  </Card>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
