import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Truck,
  Building2,
  Car,
  Search,
  MapPin,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Users,
  Briefcase,
  Compass,
  ArrowRight,
  Clock,
  Radio,
  FileCheck2,
  ChevronRight,
  Sparkles,
  Lock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import Card from '../components/ui/Card.jsx';

/**
 * DRIVAIR Public Landing Page (readme1.md Section 6)
 * - Hyper-Saturated Fluid Design Direction
 * - Cyber Yellow (#FDE047) liquid hero surface with Deep Onyx text
 * - Asymmetrical liquid bottom edge (rounded-b-[60px] to rounded-b-[100px])
 * - Floating glass marketplace preview card
 * - Dark void problem/feature sections with charcoal (#171717) cards
 */
export default function HomePage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [vehicleType, setVehicleType] = useState('all');
  const [contractDuration, setContractDuration] = useState('monthly');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  const serviceCategories = [
    { title: 'Staff Transportation', desc: 'Daily corporate shuttle routes & shift staff transit', icon: Users, count: '140+ Fleets' },
    { title: 'Corporate Travel', desc: 'Executive sedans & luxury vans for client delegation', icon: Briefcase, count: '85+ Available' },
    { title: 'Goods Transportation', desc: 'Commercial trucks, tempos, and intra-city cargo logistics', icon: Truck, count: '320+ Trucks' },
    { title: 'Industrial Transport', desc: 'Heavy material movement & manufacturing plant freight', icon: Building2, count: '90+ Carriers' },
    { title: 'School & College Transit', desc: 'Verified yellow-plate buses with strict safety compliance', icon: ShieldCheck, count: '110+ Buses' },
    { title: 'Healthcare Transport', desc: 'Dedicated non-emergency medical & hospital mobility', icon: Clock, count: '45+ Available' },
    { title: 'Event & Tourism', desc: 'Maxi cabs, tempo travelers & tourist buses on lease', icon: Compass, count: '75+ Available' },
  ];

  const featuredVehicles = [
    {
      category: 'Heavy Freight',
      name: 'Tata Signa 2823.K Multi-Axle',
      capacity: '25 Ton Payload',
      location: 'Mumbai & Pune Corridor',
      price: '₹95,000 / mo',
      image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80',
    },
    {
      category: 'Corporate Transit',
      name: 'Force Urbania 17-Seater Maxi Cab',
      capacity: '17 Passenger Luxury',
      location: 'Bengaluru IT Corridors',
      price: '₹75,000 / mo',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
    },
    {
      category: 'Intra-City Logistics',
      name: 'Mahindra Bolero Maxi Truck Plus',
      capacity: '1.7 Ton Light Cargo',
      location: 'Delhi NCR & Gurgaon',
      price: '₹38,000 / mo',
      image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=600&q=80',
    },
    {
      category: 'Staff Bus',
      name: 'Ashok Leyland Falcon 42-Seater',
      capacity: '42 Seater AC Transit',
      location: 'Chennai Industrial Zone',
      price: '₹1,20,000 / mo',
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col font-sans selection:bg-[#FDE047] selection:text-[#0A0A0A]">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-white/10 h-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#FDE047] text-[#0A0A0A] flex items-center justify-center font-black text-xl shadow-md shadow-yellow-500/10">
              D
            </div>
            <span className="text-2xl font-black tracking-tight text-white">DRIVAIR</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-7 text-xs font-bold uppercase tracking-wider text-[#B8B8B8]">
            <a href="#marketplace" className="hover:text-white transition">Find Fleets</a>
            <a href="#services" className="hover:text-white transition">Categories</a>
            <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
            <a href="#why-drivair" className="hover:text-white transition">Protocol</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-bold text-[#B8B8B8] hover:text-white px-3 py-2 rounded-full transition"
            >
              Sign In
            </Link>
            <Button variant="primary" size="sm" onClick={() => navigate('/login')}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hyper-Saturated Fluid Hero Section (Cyber Yellow Canvas) */}
      <section className="relative bg-[#FDE047] text-[#0A0A0A] pt-16 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8 rounded-b-[60px] sm:rounded-b-[100px] shadow-2xl overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A0A0A] text-[#FDE047] text-xs font-black uppercase tracking-wider">
              <Sparkles size={13} />
              <span>Zero Brokerage · Canonical B2B Contracts</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]">
              Move business forward. <br />
              <span className="underline decoration-[#0A0A0A]/30">Hire direct.</span>
            </h1>

            <p className="text-base sm:text-xl font-medium text-[#0A0A0A]/85 max-w-xl leading-relaxed">
              Find trusted drivers and vehicle owners, compare contract bids, and establish legally binding transportation agreements with live GPS radar tracking.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="dark"
                size="lg"
                onClick={() => navigate('/login')}
                className="bg-[#0A0A0A] text-white hover:bg-[#202020]"
              >
                Get Started Direct
              </Button>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center font-bold px-6 py-3 rounded-full border-2 border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#FDE047] transition text-sm min-h-[44px]"
              >
                Explore How It Works
              </a>
            </div>
          </div>

          {/* Right Hero Floating Glass Preview Card (readme1.md 6) */}
          <div className="lg:col-span-5">
            <div className="rounded-[32px] border border-black/15 bg-black/10 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/10">
                <span className="font-mono text-xs font-black bg-[#0A0A0A] text-[#FDE047] px-2.5 py-1 rounded-md">
                  CNT-8821-4920
                </span>
                <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-emerald-600 text-white rounded-full">
                  Live Contract
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#0A0A0A]/70">Contracted Route</span>
                <h4 className="text-lg font-black text-[#0A0A0A]">
                  Dedicated Intra-City Freight Fleet
                </h4>
                <p className="text-xs text-[#0A0A0A]/75 mt-0.5">
                  Shipper: Tata Consumer Logistics · Mumbai Corridor
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-black/5 rounded-2xl border border-black/10">
                  <span className="text-[10px] font-bold text-[#0A0A0A]/60 block uppercase">Agreed Rate</span>
                  <p className="text-base font-black text-[#0A0A0A] tabular-nums">
                    ₹65,000 <span className="text-xs font-normal">/ mo</span>
                  </p>
                </div>
                <div className="p-3 bg-black/5 rounded-2xl border border-black/10">
                  <span className="text-[10px] font-bold text-[#0A0A0A]/60 block uppercase">GPS Stream</span>
                  <p className="text-xs font-black text-emerald-800 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-700 animate-ping" />
                    Radar Active
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#0A0A0A] text-white flex items-center justify-between text-xs">
                <span className="font-bold text-[#FDE047]">Zero Broker Markup</span>
                <span className="text-white/70">Verified Transport Provider</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Dark Void Section — Search & Filter Bar */}
      <section className="relative -mt-10 sm:-mt-14 max-w-5xl mx-auto px-4 w-full z-20">
        <div className="p-5 sm:p-6 rounded-[28px] bg-[#171717] border border-white/15 shadow-2xl">
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#858585] uppercase tracking-wider mb-1">
                Operating City
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3.5 top-3 text-[#858585]" />
                <input
                  type="text"
                  placeholder="Mumbai, Delhi, Bengaluru"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 border border-white/10 rounded-2xl text-xs sm:text-sm bg-[#262626] text-white focus:outline-none focus:ring-2 focus:ring-[#FDE047]/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#858585] uppercase tracking-wider mb-1">
                Vehicle Category
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3 py-2.5 border border-white/10 rounded-2xl text-xs sm:text-sm bg-[#262626] text-white focus:outline-none focus:ring-2 focus:ring-[#FDE047]/30"
              >
                <option value="all">All Fleets</option>
                <option value="truck">Commercial Truck (HCV)</option>
                <option value="tempo">Tempo / Light Cargo (LCV)</option>
                <option value="maxicab">Maxi Cab / Luxury Van</option>
                <option value="bus">Staff / Passenger Bus</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#858585] uppercase tracking-wider mb-1">
                Duration
              </label>
              <select
                value={contractDuration}
                onChange={(e) => setContractDuration(e.target.value)}
                className="w-full px-3 py-2.5 border border-white/10 rounded-2xl text-xs sm:text-sm bg-[#262626] text-white focus:outline-none focus:ring-2 focus:ring-[#FDE047]/30"
              >
                <option value="weekly">Weekly Contract (7–14 Days)</option>
                <option value="monthly">Monthly Contract (Recurring)</option>
                <option value="yearly">Yearly Dedicated SLA</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="primary" type="submit" className="w-full">
                Find Transport
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* 4. Three Clear Workflow Cards (readme1.md 6) */}
      <section id="how-it-works" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge status="brand" label="Operational Framework" />
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How DRIVAIR Works
          </h2>
          <p className="text-xs sm:text-sm text-[#B8B8B8]">
            Direct B2B connectivity without commissions, broker delays, or unverified promises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="surface" className="space-y-4 hover:border-[#FDE047]/30 transition">
            <span className="font-mono text-3xl font-black text-[#FDE047] block">01</span>
            <h3 className="text-lg font-bold text-white">Post a Contract</h3>
            <p className="text-xs text-[#B8B8B8] leading-relaxed">
              Companies specify route schedules, cargo requirements, and budget limits to publish tenders directly to verified providers.
            </p>
          </Card>

          <Card variant="surface" className="space-y-4 hover:border-[#FDE047]/30 transition">
            <span className="font-mono text-3xl font-black text-[#FDE047] block">02</span>
            <h3 className="text-lg font-bold text-white">Compare Real Bids</h3>
            <p className="text-xs text-[#B8B8B8] leading-relaxed">
              Evaluate verified driver credentials, fleet age, and offered rates side-by-side with zero broker markups.
            </p>
          </Card>

          <Card variant="surface" className="space-y-4 hover:border-[#FDE047]/30 transition">
            <span className="font-mono text-3xl font-black text-[#FDE047] block">03</span>
            <h3 className="text-lg font-bold text-white">Hire Directly & Track</h3>
            <p className="text-xs text-[#B8B8B8] leading-relaxed">
              Accept proposals to generate canonical binding contracts with automated numbering and live GPS telemetry.
            </p>
          </Card>
        </div>
      </section>

      {/* 5. Service Categories Grid */}
      <section id="services" className="py-16 bg-[#171717] border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <Badge status="brand" label="Commercial Mobility" />
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                B2B Transport Categories
              </h2>
            </div>
            <Link to="/login" className="text-xs font-bold text-[#FDE047] flex items-center gap-1 hover:underline">
              <span>View All Fleets</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {serviceCategories.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  onClick={() => navigate('/login')}
                  className="p-5 rounded-[24px] bg-[#202020] border border-white/10 hover:border-[#FDE047]/40 transition hover:scale-[1.01] cursor-pointer space-y-3"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FDE047] text-[#0A0A0A] flex items-center justify-center font-bold">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{c.title}</h4>
                    <p className="text-xs text-[#B8B8B8] mt-1 leading-relaxed">{c.desc}</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#FDE047] bg-[#FDE047]/10 px-2 py-0.5 rounded-full inline-block">
                    {c.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Featured Fleets Showcase */}
      <section id="marketplace" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <Badge status="verified" label="Verified Carriers" />
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
              Featured Active Fleet Units
            </h2>
          </div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>
            Explore Marketplace
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredVehicles.map((v, idx) => (
            <Card key={idx} variant="surface" className="flex flex-col justify-between p-0 overflow-hidden hover:border-white/20 transition">
              <div>
                <div className="h-44 w-full relative overflow-hidden bg-[#202020]">
                  <img src={v.image} alt={v.name} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                  <span className="absolute top-3 left-3 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#0A0A0A]/90 text-white border border-white/10">
                    {v.category}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                    <ShieldCheck size={14} />
                    <span>Verified RC & Driver</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">{v.name}</h4>
                  <div className="text-xs text-[#B8B8B8] space-y-0.5 pt-1">
                    <p>{v.capacity}</p>
                    <p className="flex items-center gap-1"><MapPin size={12} /> {v.location}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-white/10 mt-2 space-y-3">
                <div className="pt-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-[#858585] uppercase font-bold">Contract Rate</span>
                    <p className="text-sm font-black text-[#FDE047] tabular-nums">{v.price}</p>
                  </div>
                  <Badge status="active" label="Available" />
                </div>

                <Button variant="primary" size="sm" onClick={() => navigate('/login')} className="w-full">
                  Request Contract
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 7. Why Drivair (Void Section) */}
      <section id="why-drivair" className="py-20 bg-[#171717] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
          <div className="max-w-2xl mx-auto space-y-2">
            <Badge status="brand" label="The Direct Protocol" />
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Why Corporate Shippers Choose DRIVAIR
            </h2>
            <p className="text-xs sm:text-sm text-[#B8B8B8]">
              Eliminating broker margins while elevating transparency, compliance, and real-time accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card variant="elevated" className="space-y-3 text-left">
              <span className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 size={20} />
              </span>
              <h4 className="font-bold text-base text-white">Zero Broker Markup</h4>
              <p className="text-xs text-[#B8B8B8] leading-relaxed">
                Save 15–25% on commission markups while transport drivers and vehicle owners receive 100% of agreed trip payments.
              </p>
            </Card>

            <Card variant="elevated" className="space-y-3 text-left">
              <span className="w-10 h-10 rounded-2xl bg-[#FDE047]/15 text-[#FDE047] flex items-center justify-center font-bold">
                <FileCheck2 size={20} />
              </span>
              <h4 className="font-bold text-base text-white">Canonical Digital Contracts</h4>
              <p className="text-xs text-[#B8B8B8] leading-relaxed">
                Automated contract numbers, rate preservation in integer paise, and legally auditable contractual terms.
              </p>
            </Card>

            <Card variant="elevated" className="space-y-3 text-left">
              <span className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center font-bold">
                <Radio size={20} />
              </span>
              <h4 className="font-bold text-base text-white">Encrypted GPS Radar</h4>
              <p className="text-xs text-[#B8B8B8] leading-relaxed">
                Real-time Leaflet + OpenStreetMap vehicle location telemetry streamed with driver consent strictly during active trips.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* 8. Final Yellow Call-to-Action Section (readme1.md 6) */}
      <section className="py-20 bg-[#FDE047] text-[#0A0A0A] text-center px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Ready to Connect with the Right Transport Provider?
          </h2>
          <p className="text-sm sm:text-base font-medium text-[#0A0A0A]/85 max-w-xl mx-auto">
            Join enterprise logistics managers and verified fleet owners operating without intermediaries.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              variant="dark"
              size="lg"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-[#0A0A0A] text-white hover:bg-[#202020]"
            >
              Get Started as Company
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto border-2 border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#FDE047]"
            >
              Join as Driver or Fleet Owner
            </Button>
          </div>
        </div>
      </section>

      {/* 9. Dark Footer */}
      <footer className="bg-[#0A0A0A] text-[#858585] text-xs py-14 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FDE047] text-[#0A0A0A] font-black flex items-center justify-center text-sm">
                D
              </div>
              <span className="text-lg font-black text-white">DRIVAIR</span>
            </div>
            <p className="leading-relaxed text-[#B8B8B8]">
              Hyper-Saturated Fluid B2B transport marketplace connecting shippers directly with verified drivers and fleet owners.
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Platform Services</h5>
            <ul className="space-y-1.5">
              <li><a href="#services" className="hover:text-white transition">Staff Transportation</a></li>
              <li><a href="#services" className="hover:text-white transition">Inter-City Freight Delivery</a></li>
              <li><a href="#services" className="hover:text-white transition">Corporate Luxury Van Rental</a></li>
              <li><a href="#services" className="hover:text-white transition">Yearly Dedicated Fleets</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Partner Portals</h5>
            <ul className="space-y-1.5">
              <li><Link to="/login" className="hover:text-white transition">Driver Onboarding Portal</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Fleet Owner Registration</Link></li>
              <li><a href="#why-drivair" className="hover:text-white transition">Verification Guidelines</a></li>
              <li><a href="#why-drivair" className="hover:text-white transition">GPS Telemetry Privacy</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px]">Legal & Support</h5>
            <ul className="space-y-1.5">
              <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">contact@drivair.com</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-white/10 text-center text-[11px] text-[#858585]">
          © 2026 DRIVAIR Technologies Inc. Hyper-Saturated Fluid Architecture. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
