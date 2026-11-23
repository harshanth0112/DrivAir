import React, { useState, useEffect } from 'react';
import api from '../../lib/api.js';
import {
  Truck,
  Plus,
  X
} from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function VehicleManager() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('truck');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const loadVehicles = async () => {
    try {
      const res = await api.get('/vehicles/mine');
      setVehicles(res.data.data.vehicles || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/vehicles', {
        vehicleNumber,
        vehicleType,
        capacity: { value: Number(capacity) || 1, unit: 'tons' },
      });
      setVehicleNumber('');
      setCapacity('');
      setShowAddForm(false);
      loadVehicles();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <Card variant="surface" className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-canvas)]">
              <Truck size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Commercial Fleet Register</h2>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Register and manage heavy commercial vehicles, tempos, and buses available for contract lease.
          </p>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant={showAddForm ? 'secondary' : 'primary'}
          className="self-start sm:self-auto text-xs"
        >
          {showAddForm ? <X size={15} /> : <Plus size={15} />}
          <span>{showAddForm ? 'Cancel' : 'Register Vehicle'}</span>
        </Button>
      </Card>

      {/* Add Vehicle Form */}
      {showAddForm && (
        <Card variant="surface" className="p-6 border border-[var(--color-primary)]/40 space-y-4">
          <h3 className="text-sm font-bold text-white">Add New Commercial Vehicle</h3>
          <form onSubmit={handleAddVehicle} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                Registration Plate Number
              </label>
              <input
                type="text"
                placeholder="e.g. MH-04-AB-1234"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-xs sm:text-sm text-white uppercase font-mono focus:outline-none focus:border-[var(--color-primary)] transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                Vehicle Category
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
              >
                <option value="truck" className="bg-[#171717]">Truck / Heavy Commercial (HCV)</option>
                <option value="tempo" className="bg-[#171717]">Tempo / Light Commercial (LCV)</option>
                <option value="bus" className="bg-[#171717]">Bus / Corporate Transit</option>
                <option value="taxi" className="bg-[#171717]">Commercial Sedan / Taxi</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                Payload Capacity (Tons / Passengers)
              </label>
              <input
                type="number"
                placeholder="e.g. 10"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-all"
              />
            </div>

            <div className="sm:col-span-3 pt-2">
              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                className="text-xs"
              >
                {loading ? 'Registering...' : 'Save & Register Vehicle'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {vehicles.length === 0 ? (
          <Card variant="surface" className="sm:col-span-3 p-12 text-center">
            <Truck className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">No Vehicles Registered</h4>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Add your fleet units to match with shippers requiring transportation assets.
            </p>
          </Card>
        ) : (
          vehicles.map((v) => (
            <Card
              key={v._id}
              variant="surface"
              className="p-6 space-y-3 hover:border-white/20 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl bg-[var(--color-control)] text-white">
                  <Truck size={22} />
                </div>
                <Badge variant="verified">
                  Active
                </Badge>
              </div>

              <div>
                <span className="font-mono text-sm font-black text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-lg border border-[var(--color-primary)]/30">
                  {v.vehicleNumber}
                </span>
                <p className="text-xs font-bold text-white capitalize mt-2">
                  {v.vehicleType}
                </p>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  Capacity: {v.capacity?.value || 1} {v.capacity?.unit || 'tons'}
                </p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
