import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { io } from 'socket.io-client';
import api from '../../lib/api.js';
import {
  Play,
  Square,
  AlertCircle,
  CheckCircle2,
  Radio,
  Wifi,
  WifiOff
} from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function DriverTripTracker() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [speed, setSpeed] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const watchIdRef = useRef(null);

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
      reconnectionDelay: 1000,
    });

    s.on('connect', () => {
      setConnected(true);
    });

    s.on('disconnect', () => {
      setConnected(false);
    });

    s.on('trip_started', (data) => {
      setActiveTrip(data);
    });

    s.on('trip_ended', () => {
      setIsTracking(false);
      setActiveTrip(null);
      setCurrentCoords(null);
      setSpeed(0);
    });

    s.on('tracking_error', (err) => {
      setError(err.message || 'Tracking error encountered');
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Fetch driver contracts and active trip
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contractsRes, tripsRes] = await Promise.all([
          api.get('/contracts/mine'),
          api.get('/trips/active'),
        ]);

        const activeContracts = (contractsRes.data.data.contracts || []).filter(
          (c) => c.status === 'active'
        );
        setContracts(activeContracts);

        // Check if there's an ongoing active trip in MongoDB
        const currentTrips = tripsRes.data.data.trips || [];
        if (currentTrips.length > 0) {
          const trip = currentTrips[0];
          setActiveTrip(trip);
          setIsTracking(true);
          const matchedContract = activeContracts.find(
            (c) => c._id === (trip.contractId?._id || trip.contractId)
          );
          if (matchedContract) {
            setSelectedContract(matchedContract);
          }
        } else if (activeContracts.length > 0 && !selectedContract) {
          setSelectedContract(activeContracts[0]);
        }
      } catch (err) {
        console.error('Failed to load trips or contracts:', err);
      }
    };

    fetchData();
  }, []);

  // Watch position when isTracking is true
  useEffect(() => {
    if (!isTracking) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation API is not supported by your mobile browser.');
      setIsTracking(false);
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed: spd, accuracy: acc, heading } = pos.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });
        setAccuracy(Math.round(acc || 0));
        const currentSpeed = spd ? Math.round(spd * 3.6) : 0;
        setSpeed(currentSpeed);
        setLastUpdate(new Date());

        // 1. Broadcast via Socket.IO
        if (socket && selectedContract) {
          socket.emit('update_location', {
            tripId: activeTrip?._id || activeTrip?.tripId,
            contractId: selectedContract._id,
            latitude,
            longitude,
            speed: currentSpeed,
            accuracy: Math.round(acc || 0),
            heading: heading || 0,
          });
        }

        // 2. Fallback REST persistence if socket disconnects
        if (!connected && activeTrip) {
          api.post('/tracking/location', {
            tripId: activeTrip._id || activeTrip.tripId,
            latitude,
            longitude,
            speed: currentSpeed,
            accuracy: Math.round(acc || 0),
            heading: heading || 0,
          }).catch(() => {});
        }
      },
      (geoErr) => {
        setError(`Location access error: ${geoErr.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000,
      }
    );

    watchIdRef.current = id;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isTracking, socket, selectedContract, activeTrip, connected]);

  const handleStartTrip = async () => {
    if (!selectedContract) {
      setError('Please select an active contract to start tracking.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 1. Secure REST start trip with verification
      const res = await api.post('/trips/start', {
        contractId: selectedContract._id,
      });

      const trip = res.data.data.trip;
      setActiveTrip(trip);
      setIsTracking(true);

      // 2. Notify socket room
      if (socket) {
        socket.emit('start_trip', {
          contractId: selectedContract._id,
          tripId: trip._id,
          vehicleNumber: selectedContract.title,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start trip on server.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndTrip = async () => {
    if (!activeTrip && !selectedContract) return;
    setLoading(true);
    setError('');

    try {
      const tripId = activeTrip?._id || activeTrip?.tripId;
      if (tripId) {
        await api.post(`/trips/${tripId}/end`, {
          endLocation: currentCoords ? { latitude: currentCoords.lat, longitude: currentCoords.lng } : undefined,
        });
      }

      if (socket && selectedContract) {
        socket.emit('end_trip', {
          tripId,
          contractId: selectedContract._id,
        });
      }

      setIsTracking(false);
      setActiveTrip(null);
      setCurrentCoords(null);
      setSpeed(0);
    } catch (err) {
      setError(err.response?.data?.message || 'Error completing trip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="surface" className="p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-xl ${
                isTracking
                  ? 'bg-[var(--color-primary)] text-[var(--color-canvas)] animate-pulse'
                  : 'bg-[var(--color-control)] text-[var(--color-primary)]'
              }`}
            >
              <Radio size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Driver GPS Trip Transmitter
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Encrypted mobile telemetry shared exclusively with your contracted company.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {connected ? (
            <Badge variant="active" className="text-xs">
              <Wifi size={12} className="inline mr-1" /> Live Socket
            </Badge>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-[var(--color-text-muted)] border border-[var(--color-border-subtle)] text-xs font-semibold">
              <WifiOff size={12} /> REST Mode
            </span>
          )}

          {isTracking && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-primary)] text-[var(--color-canvas)] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[var(--color-canvas)] animate-ping" />
              Active
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-950/60 border border-red-800/80 text-red-300 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-red-400" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Contract Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
            Assigned Active Contract
          </label>
          <select
            disabled={isTracking}
            value={selectedContract?._id || ''}
            onChange={(e) => {
              const c = contracts.find((x) => x._id === e.target.value);
              setSelectedContract(c || null);
            }}
            className="w-full px-3.5 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-50 font-medium"
          >
            {contracts.length === 0 ? (
              <option value="" className="bg-[#171717]">No active contracts available to track</option>
            ) : (
              contracts.map((c) => (
                <option key={c._id} value={c._id} className="bg-[#171717]">
                  {c.contractNumber} · {c.title}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Start / End Controls */}
        <div className="flex items-end gap-3">
          {!isTracking ? (
            <Button
              onClick={handleStartTrip}
              disabled={loading || !selectedContract}
              variant="primary"
              className="flex-1 justify-center text-xs sm:text-sm"
            >
              <Play size={16} />
              <span>{loading ? 'Initializing Trip...' : 'Start Trip & Broadcast GPS'}</span>
            </Button>
          ) : (
            <Button
              onClick={handleEndTrip}
              disabled={loading}
              variant="danger"
              className="flex-1 justify-center text-xs sm:text-sm"
            >
              <Square size={16} />
              <span>{loading ? 'Finalizing Trip...' : 'End Active Trip'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Live Driver Telemetry Dashboard */}
      {isTracking && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <Card variant="elevated" className="p-4">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Coordinates</span>
              <p className="text-sm font-mono font-bold text-white mt-1">
                {currentCoords
                  ? `${currentCoords.lat.toFixed(4)}, ${currentCoords.lng.toFixed(4)}`
                  : 'Acquiring...'}
              </p>
            </Card>

            <Card variant="elevated" className="p-4">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Current Speed</span>
              <p className="text-base font-mono font-black text-[var(--color-primary)] mt-1">
                {speed} <span className="text-xs font-normal text-[var(--color-text-secondary)]">km/h</span>
              </p>
            </Card>

            <Card variant="elevated" className="p-4">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">GPS Accuracy</span>
              <p className="text-sm font-mono font-bold text-white mt-1">
                ±{accuracy} <span className="text-xs font-normal text-[var(--color-text-secondary)]">meters</span>
              </p>
            </Card>

            <Card variant="elevated" className="p-4">
              <span className="text-[10px] uppercase font-bold text-[var(--color-text-muted)]">Last Telemetry Ping</span>
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mt-1.5">
                {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Streaming...'}
              </p>
            </Card>
          </div>

          <Card variant="subtle" className="p-3 text-xs text-[var(--color-primary)] flex items-center gap-2 border border-[var(--color-primary)]/20">
            <CheckCircle2 size={16} className="text-[var(--color-primary)] shrink-0" />
            <span>
              Live GPS broadcast active. Location permission granted for trip {activeTrip?.tripId || activeTrip?._id || ''}.
            </span>
          </Card>
        </div>
      )}
    </Card>
  );
}
