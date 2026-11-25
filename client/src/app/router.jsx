import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext.jsx';
import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../features/auth/LoginPage.jsx';
import PortalLayout from '../components/layout/PortalLayout.jsx';
import DocumentManager from '../features/documents/DocumentManager.jsx';
import VehicleManager from '../features/vehicles/VehicleManager.jsx';
import AdminVerificationQueue from '../features/admin/AdminVerificationQueue.jsx';
import AdminAuditViewer from '../features/admin/AdminAuditViewer.jsx';
import BrowsePosts from '../features/marketplace/BrowsePosts.jsx';
import MyBids from '../features/marketplace/MyBids.jsx';
import CompanyPostManager from '../features/marketplace/CompanyPostManager.jsx';
import DirectHiringExplorer from '../features/direct-hiring/DirectHiringExplorer.jsx';
import ReceivedOffers from '../features/direct-hiring/ReceivedOffers.jsx';
import ChatMessenger from '../features/chat/ChatMessenger.jsx';
import ContractList from '../features/contracts/ContractList.jsx';
import CompanyLiveMap from '../features/tracking/CompanyLiveMap.jsx';
import DriverTripTracker from '../features/tracking/DriverTripTracker.jsx';
import TravelMarketplace from '../features/travel-marketplace/TravelMarketplace.jsx';
import ProviderListingManager from '../features/travel-marketplace/ProviderListingManager.jsx';
import {
  FileText,
  MessageSquare,
  Users,
  Briefcase,
  FileCheck2,
  Inbox,
  Compass,
  Truck,
  ShieldCheck,
  Activity,
  MapPin,
  Radio,
  Building2,
  Car
} from 'lucide-react';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold tracking-wide text-slate-300">
          Initializing DRIVAIR Session...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}/dashboard`} replace />;
  }

  return children;
};

// Company Portal with Tab Navigation including Live GPS Map
function CompanyDashboard() {
  const [activeTab, setActiveTab] = useState('tracking');

  const tabs = [
    { id: 'marketplace', label: 'Travel & Vehicle Market', icon: Compass },
    { id: 'tracking', label: 'Live GPS Radar', icon: Radio },
    { id: 'contracts', label: 'Active Contracts', icon: FileText },
    { id: 'hiring', label: 'Direct Hiring', icon: Users },
    { id: 'posts', label: 'Tenders & Bids', icon: Briefcase },
    { id: 'chat', label: 'Messages', icon: MessageSquare },
    { id: 'compliance', label: 'Documents', icon: FileCheck2 },
  ];

  return (
    <PortalLayout
      title="Company Operations Command"
      allowedRole="Company"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-6">
        {activeTab === 'marketplace' && <TravelMarketplace onOpenChat={() => setActiveTab('chat')} />}
        {activeTab === 'tracking' && <CompanyLiveMap />}
        {activeTab === 'contracts' && <ContractList />}
        {activeTab === 'hiring' && <DirectHiringExplorer />}
        {activeTab === 'posts' && <CompanyPostManager />}
        {activeTab === 'chat' && <ChatMessenger />}
        {activeTab === 'compliance' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Company Compliance Verification</h3>
            <p className="text-xs text-slate-500 mb-6">
              Upload GST registration, business licenses, and company incorporation certificates for admin approval.
            </p>
            <DocumentManager ownerType="company" />
          </div>
        )}
      </div>
    </PortalLayout>
  );
}

// Driver Portal with Tab Navigation including Driver GPS Trip Tracker
function DriverDashboard() {
  const [activeTab, setActiveTab] = useState('trip');

  const tabs = [
    { id: 'trip', label: 'Live Trip GPS', icon: Radio },
    { id: 'travels', label: 'My Travel Listings', icon: Compass },
    { id: 'marketplace', label: 'Browse Contracts', icon: Briefcase },
    { id: 'mybids', label: 'My Bids', icon: FileText },
    { id: 'offers', label: 'Direct Offers', icon: Inbox },
    { id: 'contracts', label: 'My Contracts', icon: FileCheck2 },
    { id: 'chat', label: 'Messages', icon: MessageSquare },
    { id: 'compliance', label: 'Credentials', icon: ShieldCheck },
  ];

  return (
    <PortalLayout
      title="Driver Partner Portal"
      allowedRole="Driver"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-6">
        {activeTab === 'trip' && <DriverTripTracker />}
        {activeTab === 'travels' && <ProviderListingManager />}
        {activeTab === 'marketplace' && <BrowsePosts />}
        {activeTab === 'mybids' && <MyBids />}
        {activeTab === 'offers' && <ReceivedOffers />}
        {activeTab === 'contracts' && <ContractList />}
        {activeTab === 'chat' && <ChatMessenger />}
        {activeTab === 'compliance' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Driver Verification Records</h3>
            <p className="text-xs text-slate-500 mb-6">
              Upload your driving license, police verification, and badges to receive verified job contracts.
            </p>
            <DocumentManager ownerType="driver" />
          </div>
        )}
      </div>
    </PortalLayout>
  );
}

// Vehicle Owner Portal with Tab Navigation
function VehicleOwnerDashboard() {
  const [activeTab, setActiveTab] = useState('fleet');

  const tabs = [
    { id: 'fleet', label: 'Vehicle Fleet', icon: Truck },
    { id: 'travels', label: 'My Travel Listings', icon: Compass },
    { id: 'marketplace', label: 'Tenders & Posts', icon: Briefcase },
    { id: 'mybids', label: 'My Bids', icon: FileText },
    { id: 'offers', label: 'Direct Requests', icon: Inbox },
    { id: 'contracts', label: 'Contracts', icon: FileCheck2 },
    { id: 'chat', label: 'Messages', icon: MessageSquare },
    { id: 'compliance', label: 'Permits & Docs', icon: ShieldCheck },
  ];

  return (
    <PortalLayout
      title="Fleet & Vehicle Owner Console"
      allowedRole="Vehicle Owner"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-6">
        {activeTab === 'fleet' && <VehicleManager />}
        {activeTab === 'travels' && <ProviderListingManager />}
        {activeTab === 'marketplace' && <BrowsePosts />}
        {activeTab === 'mybids' && <MyBids />}
        {activeTab === 'offers' && <ReceivedOffers />}
        {activeTab === 'contracts' && <ContractList />}
        {activeTab === 'chat' && <ChatMessenger />}
        {activeTab === 'compliance' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Fleet Identity & Permitting</h3>
            <p className="text-xs text-slate-500 mb-6">
              Upload commercial carrier permits, vehicle registration certificates (RC), and national permits.
            </p>
            <DocumentManager ownerType="vehicleOwner" />
          </div>
        )}
      </div>
    </PortalLayout>
  );
}

// Admin Console with Tab Navigation
function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('verification');

  const tabs = [
    { id: 'verification', label: 'Verification Queue', icon: ShieldCheck },
    { id: 'governance', label: 'User Governance & Logs', icon: Activity },
    { id: 'chat', label: 'Audit Messenger', icon: MessageSquare },
  ];

  return (
    <PortalLayout
      title="Admin Governance Center"
      allowedRole="Admin"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="space-y-6">
        {activeTab === 'verification' && <AdminVerificationQueue />}
        {activeTab === 'governance' && <AdminAuditViewer />}
        {activeTab === 'chat' && <ChatMessenger />}
      </div>
    </PortalLayout>
  );
}

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Homepage with 9 sections per spec */}
        <Route path="/" element={<HomePage />} />

        {/* Auth Route */}
        <Route
          path="/login"
          element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <LoginPage />}
        />

        {/* Company Portal */}
        <Route
          path="/company/dashboard"
          element={
            <ProtectedRoute allowedRoles={['company']}>
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />

        {/* Driver Portal */}
        <Route
          path="/driver/dashboard"
          element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverDashboard />
            </ProtectedRoute>
          }
        />

        {/* Vehicle Owner Portal */}
        <Route
          path="/vehicleOwner/dashboard"
          element={
            <ProtectedRoute allowedRoles={['vehicleOwner']}>
              <VehicleOwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Portal */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Root Fallback */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
