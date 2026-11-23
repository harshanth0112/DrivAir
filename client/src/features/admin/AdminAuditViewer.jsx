import React, { useState, useEffect } from 'react';
import api from '../../lib/api.js';
import {
  Users,
  Activity,
  RotateCw,
  Lock,
  Unlock
} from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function AdminAuditViewer() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [uRes, lRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/audit-logs'),
      ]);
      setUsers(uRes.data.data.users || []);
      setLogs(lRes.data.data.auditLogs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (user, newStatus) => {
    try {
      await api.patch(`/admin/users/${user._id}/status`, { status: newStatus });
      alert(`User status successfully changed to ${newStatus}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      {/* User Governance Table */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-canvas)]">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">
                User Governance & Access Enforcement
              </h3>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mt-1">
              Audit registered users, manage platform privileges, and suspend fraudulent accounts.
            </p>
          </div>

          <Button
            onClick={loadData}
            disabled={loading}
            variant="secondary"
            className="self-start sm:self-auto text-xs"
          >
            <RotateCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--color-control)] border-b border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">User Profile</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-white/5 transition">
                  <td className="py-3 px-4">
                    <p className="font-bold text-white">{u.fullName || 'Anonymous'}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">{u.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-md text-[11px] border border-[var(--color-primary)]/20">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={u.accountStatus === 'active' ? 'active' : 'rejected'}>
                      {u.accountStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {u.accountStatus === 'active' ? (
                      <Button
                        onClick={() => handleToggleStatus(u, 'suspended')}
                        variant="danger"
                        className="text-xs py-1 px-3"
                      >
                        <Lock size={12} />
                        <span>Suspend</span>
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleToggleStatus(u, 'active')}
                        variant="primary"
                        className="text-xs py-1 px-3"
                      >
                        <Unlock size={12} />
                        <span>Reactivate</span>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Security Audit Logs */}
      <Card variant="surface" className="p-6 sm:p-8 space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-canvas)]">
              <Activity size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">System Security Audit Log</h3>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Immutable tracking record of administrative operations and critical contract lifecycle events.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--color-control)] border-b border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 rounded-l-xl">Action Type</th>
                <th className="py-3 px-4">Initiating Actor</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border-subtle)]">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-[var(--color-text-muted)]">
                    No security audit logs recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l._id} className="hover:bg-white/5 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[var(--color-primary)]">
                      {l.action}
                    </td>
                    <td className="py-3 px-4 text-white font-medium">
                      {l.actorId?.fullName || l.actorId?.email || 'Platform System'}
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text-secondary)] capitalize">
                      {l.targetType}
                    </td>
                    <td className="py-3 px-4 text-right text-[var(--color-text-muted)] font-mono text-[11px]">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
