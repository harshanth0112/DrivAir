import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import api from '../../lib/api.js';
import {
  RotateCw,
  Compass,
  Radio,
  Clock,
  ShieldCheck
} from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

const createVehicleIcon = () => {
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="background-color: #FDE047; width: 38px; height: 38px; border-radius: 9999px; border: 3px solid #0A0A0A; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: #0A0A0A;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
          <path d="M15 18H9"/>
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
          <circle cx="17" cy="18" r="2"/>
          <circle cx="7" cy="18" r="2"/>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20],
  });
};

function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function CompanyLiveMap() {
  const [activeTrips, setActiveTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [vehicleLocation, setVehicleLocation] = useState(null);
  const [tripHistory, setTripHistory] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastPingTime, setLastPingTime] = useState(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const token = localStorage.getItem('drivair_token');
    if (!token) return;

    const socketUrl =
      import.meta.env.VITE_SOCKET_URL ||
      import.meta.env.VITE_API_URL?.replace('/api/v1', '') ||
      'http://localhost:5000';

    const s = io(socketUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
    });

    s.on('location_updated', (data) => {
      setVehicleLocation(data);
      setLastPingTime(new Date());
    });

    s.on('vehicle_location', (data) => {
      setVehicleLocation(data);
      setLastPingTime(new Date());
    });

    s.on('trip_ended', () => {
      setVehicleLocation(null);
      loadActiveTrips();
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Fetch active company trips from backend MongoDB
  const loadActiveTrips = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trips/active');
      const trips = res.data.data.trips || [];
      setActiveTrips(trips);

      if (trips.length > 0) {
        if (!selectedTrip || !trips.some((t) => t._id === selectedTrip._id)) {
          setSelectedTrip(trips[0]);
        }
      } else {
        setSelectedTrip(null);
        setVehicleLocation(null);
      }
    } catch (err) {
      console.error('Failed to load company active trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveTrips();
  }, []);

  // When selectedTrip changes, join socket room and fetch latest location
  useEffect(() => {
    if (!selectedTrip) return;

    if (socket) {
      socket.emit('join_trip', {
        tripId: selectedTrip._id,
        contractId: selectedTrip.contractId?._id || selectedTrip.contractId,
      });
    }

    // REST poll for initial position
    api
      .get(`/tracking/${selectedTrip._id}/latest`)
      .then((res) => {
        const last = res.data.data.lastKnownLocation;
        if (last && last.latitude) {
          setVehicleLocation({
            lat: last.latitude,
            lng: last.longitude,
            speed: last.speed || 0,
            accuracy: last.accuracy || 0,
            updatedAt: last.recordedAt,
          });
          setLastPingTime(new Date(last.recordedAt));
        }
      })
      .catch(() => {});

    // Fetch history coordinates for trail
    api
      .get(`/tracking/${selectedTrip._id}/history`)
      .then((res) => {
        const historyCoords = (res.data.data.history || []).map((h) => [
          h.latitude,
          h.longitude,
        ]);
        setTripHistory(historyCoords);
      })
      .catch(() => {});
  }, [selectedTrip, socket]);

  const defaultCenter = [20.5937, 78.9629];
  const mapCenter =
    vehicleLocation && vehicleLocation.lat
      ? [vehicleLocation.lat, vehicleLocation.lng]
      : defaultCenter;

  const isStale = lastPingTime && Date.now() - new Date(lastPingTime).getTime() > 45000;

  return (
    <Card variant="surface" className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-canvas)]">
              <Compass size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Company Real-Time Vehicle Radar
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Strict RBAC protected GPS tracking. Live telemetry streamed directly from authorized drivers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedTrip?._id || ''}
            onChange={(e) => {
              const t = activeTrips.find((x) => x._id === e.target.value);
              setSelectedTrip(t || null);
              setVehicleLocation(null);
            }}
            className="px-3.5 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-xs text-white focus:outline-none focus:border-[var(--color-primary)] font-medium"
          >
            {activeTrips.length === 0 ? (
              <option value="" className="bg-[#171717]">No vehicles currently in transit</option>
            ) : (
              activeTrips.map((t) => (
                <option key={t._id} value={t._id} className="bg-[#171717]">
                  {t.contractId?.contractNumber || 'Contract'} · {t.driverId?.fullName || 'Assigned Driver'}
                </option>
              ))
            )}
          </select>

          <Button
            onClick={loadActiveTrips}
            disabled={loading}
            variant="secondary"
            className="p-2.5 text-xs"
          >
            <RotateCw size={15} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Map & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Map View */}
        <div className="lg:col-span-8 h-[480px] w-full rounded-2xl overflow-hidden border border-[var(--color-border-subtle)] relative shadow-inner">
          <MapContainer
            center={mapCenter}
            zoom={vehicleLocation ? 14 : 5}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {vehicleLocation && vehicleLocation.lat && (
              <>
                <ChangeMapView center={[vehicleLocation.lat, vehicleLocation.lng]} />
                <Marker
                  position={[vehicleLocation.lat, vehicleLocation.lng]}
                  icon={createVehicleIcon()}
                >
                  <Popup>
                    <div className="p-1 space-y-1 text-xs">
                      <p className="font-bold text-slate-900">
                        {selectedTrip?.contractId?.title || 'Contract Vehicle'}
                      </p>
                      <p className="text-slate-600">
                        Driver: {selectedTrip?.driverId?.fullName || 'Verified Driver'}
                      </p>
                      <p className="font-semibold text-amber-600">
                        Speed: {vehicleLocation.speed || 0} km/h
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

            {/* Breadcrumb Trail */}
            {tripHistory.length > 1 && (
              <Polyline positions={tripHistory} color="#FDE047" weight={4} opacity={0.8} />
            )}
          </MapContainer>

          {/* Stale or Waiting Banner */}
          {!vehicleLocation && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-none flex items-center justify-center p-4">
              <Card variant="surface" className="p-5 text-center space-y-1 max-w-sm border border-[var(--color-border-subtle)]">
                <Radio size={24} className="text-[var(--color-primary)] mx-auto animate-pulse" />
                <h5 className="font-bold text-sm text-white">
                  {selectedTrip ? 'Waiting for Driver Ping' : 'No Active Trips in Progress'}
                </h5>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {selectedTrip
                    ? 'The driver has not yet started streaming GPS coordinates for this contract.'
                    : 'When assigned drivers start a trip from their mobile console, coordinates appear here live.'}
                </p>
              </Card>
            </div>
          )}

          {isStale && vehicleLocation && (
            <div className="absolute top-4 right-4 bg-amber-500 text-black text-[10px] font-bold px-3 py-1 rounded-full shadow-md z-20 flex items-center gap-1.5">
              <Clock size={12} />
              <span>Stale Location (Driver Offline)</span>
            </div>
          )}
        </div>

        {/* Right Telemetry Sidebar */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <Card variant="elevated" className="p-4 space-y-3">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                Selected Contract Trip
              </span>
              {selectedTrip ? (
                <div className="space-y-1.5 text-xs">
                  <p className="font-bold text-white text-sm">
                    {selectedTrip.contractId?.title || 'Contract Agreement'}
                  </p>
                  <span className="font-mono text-[11px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded border border-[var(--color-primary)]/30">
                    {selectedTrip.contractId?.contractNumber || 'CNT-RECORD'}
                  </span>
                  <div className="text-[var(--color-text-secondary)] space-y-0.5 pt-1">
                    <p>Driver: <strong className="text-white">{selectedTrip.driverId?.fullName || 'Assigned Driver'}</strong></p>
                    <p>Phone: <strong className="text-white">{selectedTrip.driverId?.phone || 'Confidential'}</strong></p>
                    <p>Started: {new Date(selectedTrip.startedAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[var(--color-text-muted)]">No active trip selected.</p>
              )}
            </Card>

            <Card variant="elevated" className="p-4 space-y-3">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">
                Live Sensor Readouts
              </span>
              {vehicleLocation ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-text-secondary)]">Trip Status:</span>
                    <Badge variant="active" className="text-[10px]">
                      Live En-Route
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-text-secondary)]">Ground Speed:</span>
                    <span className="font-black text-[var(--color-primary)] text-sm">
                      {vehicleLocation.speed || 0} km/h
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-text-secondary)]">Coordinates:</span>
                    <span className="font-mono text-white text-[11px]">
                      {vehicleLocation.lat.toFixed(4)}, {vehicleLocation.lng.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-[var(--color-border-subtle)]">
                    <span className="text-[var(--color-text-secondary)]">Last Broadcast:</span>
                    <span className="text-[var(--color-text-muted)] text-[11px]">
                      {lastPingTime ? lastPingTime.toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-[var(--color-text-muted)]">
                  <Clock size={20} className="mx-auto mb-1 text-[var(--color-text-muted)]" />
                  No GPS coordinates received yet.
                </div>
              )}
            </Card>
          </div>

          <Card variant="subtle" className="p-3.5 text-xs text-[var(--color-text-secondary)] flex items-center gap-2 border border-[var(--color-primary)]/20">
            <ShieldCheck size={18} className="text-[var(--color-primary)] shrink-0" />
            <span>
              End-to-end encrypted telemetry broadcasted with driver consent under contract SLA.
            </span>
          </Card>
        </div>
      </div>
    </Card>
  );
}
