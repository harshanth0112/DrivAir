import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  Truck,
  Building2,
  Car,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
  User,
  Phone,
  Compass,
  FileCheck2,
  MessageSquare
} from 'lucide-react';
import { auth } from '../../lib/firebase.js';
import { useAuth } from './AuthContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';

export default function LoginPage() {
  const { loginWithToken } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [role, setRole] = useState('driver');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setInfo('');

    try {
      let userCredential;

      if (mode === 'register') {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const idToken = await userCredential.user.getIdToken();
      await loginWithToken(idToken, role, {
        fullName: fullName || '',
        phone: phone || '',
      });
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': 'An account with this email already exists. Please sign in.',
        'auth/user-not-found': 'No account found with this email. Please register first.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/weak-password': 'Password must be at least 6 characters.',
        'auth/invalid-credential': 'Invalid email or password. Please check and try again.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      };
      setError(messages[err.code] || err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setInfo('Password reset instructions sent! Please check your inbox.');
      setMode('login');
    } catch (err) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  const roleCards = [
    {
      id: 'driver',
      label: 'Professional Driver',
      desc: 'Get hired for verified commercial contracts',
      icon: Truck,
      badge: 'Job Seeker',
    },
    {
      id: 'company',
      label: 'Company / Employer',
      desc: 'Post requirements, hire verified fleet & crew',
      icon: Building2,
      badge: 'Enterprise',
    },
    {
      id: 'vehicleOwner',
      label: 'Vehicle / Fleet Owner',
      desc: 'Register vehicles & lease for high-yield routes',
      icon: Car,
      badge: 'Asset Partner',
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-text-high)] flex flex-col justify-center relative overflow-hidden font-sans">
      {/* Background Soft Yellow Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50rem] h-[50rem] bg-[var(--color-primary)] opacity-5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50rem] h-[50rem] bg-[var(--color-primary)] opacity-5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative w-full max-w-6xl mx-auto px-4 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Brand Value Showcase */}
        <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-surface)] border border-[var(--color-border-subtle)] text-[var(--color-primary)] text-xs font-semibold">
            <ShieldCheck size={16} />
            <span>Enterprise B2B Transport Protocol</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Contract logistics, <br />
              <span className="text-[var(--color-primary)]">
                simplified & verified.
              </span>
            </h1>
            <p className="text-[var(--color-text-secondary)] text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
              DRIVAIR connects verified corporate enterprises with certified commercial drivers and fleet owners through legally binding digital contracts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <Card variant="surface" className="p-4 rounded-[20px] text-left">
              <Compass className="text-[var(--color-primary)] mb-2" size={24} />
              <h4 className="font-bold text-white text-sm">Direct Match</h4>
              <p className="text-[var(--color-text-muted)] text-xs mt-1">Direct hire offers & open tender marketplace</p>
            </Card>
            <Card variant="surface" className="p-4 rounded-[20px] text-left">
              <FileCheck2 className="text-emerald-400 mb-2" size={24} />
              <h4 className="font-bold text-white text-sm">Legal Contracts</h4>
              <p className="text-[var(--color-text-muted)] text-xs mt-1">Canonical agreements with automated numbering</p>
            </Card>
            <Card variant="surface" className="p-4 rounded-[20px] text-left">
              <MessageSquare className="text-[var(--color-primary)] mb-2" size={24} />
              <h4 className="font-bold text-white text-sm">Real-time Chat</h4>
              <p className="text-[var(--color-text-muted)] text-xs mt-1">Socket.IO secured negotiation channels</p>
            </Card>
          </div>
        </div>

        {/* Right Side: Auth Container */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <Card variant="surface" className="p-6 sm:p-8 space-y-6 shadow-2xl border border-[var(--color-border-subtle)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <div>
                <span className="text-2xl font-black tracking-tight text-[var(--color-primary)]">DRIVAIR</span>
                <p className="text-xs text-[var(--color-text-secondary)] font-medium mt-0.5">
                  {mode === 'login' && 'Sign in to access your portal'}
                  {mode === 'register' && 'Create your professional account'}
                  {mode === 'forgot' && 'Reset your secure password'}
                </p>
              </div>
              <div className="flex bg-[var(--color-control)] p-1 rounded-full text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setError(''); setInfo(''); }}
                  className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-[var(--color-primary)] text-[var(--color-canvas)] font-bold shadow-sm'
                      : 'text-[var(--color-text-secondary)] hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('register'); setError(''); setInfo(''); }}
                  className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-[var(--color-primary)] text-[var(--color-canvas)] font-bold shadow-sm'
                      : 'text-[var(--color-text-secondary)] hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-2xl text-xs text-red-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {info && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-2xl text-xs text-emerald-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="font-medium">{info}</span>
              </div>
            )}

            <form onSubmit={mode === 'forgot' ? handleForgotPassword : handleAuth} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Select Your Role
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {roleCards.map((rc) => {
                      const Icon = rc.icon;
                      const isSelected = role === rc.id;
                      return (
                        <div
                          key={rc.id}
                          onClick={() => setRole(rc.id)}
                          className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-center justify-between ${
                            isSelected
                              ? 'border-[var(--color-primary)] bg-[var(--color-elevated)] shadow-sm'
                              : 'border-[var(--color-border-subtle)] hover:border-white/20 bg-[var(--color-control)]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${isSelected ? 'bg-[var(--color-primary)] text-[var(--color-canvas)]' : 'bg-white/5 text-[var(--color-text-secondary)]'}`}>
                              <Icon size={18} />
                            </div>
                            <div>
                              <p className={`text-xs font-bold ${isSelected ? 'text-[var(--color-primary)]' : 'text-white'}`}>
                                {rc.label}
                              </p>
                              <p className="text-[11px] text-[var(--color-text-muted)] leading-tight">{rc.desc}</p>
                            </div>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isSelected ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]' : 'bg-white/5 text-[var(--color-text-muted)]'}`}>
                            {rc.badge}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {mode === 'register' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-3.5 text-[var(--color-text-muted)]" />
                      <input
                        type="text"
                        placeholder="Rajesh Kumar"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-xs sm:text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-3.5 text-[var(--color-text-muted)]" />
                      <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-xs sm:text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-3.5 text-[var(--color-text-muted)]" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-xs sm:text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setError(''); setInfo(''); }}
                        className="text-[11px] text-[var(--color-primary)] hover:underline font-semibold transition cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-3.5 text-[var(--color-text-muted)]" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-9 pr-3 py-2.5 bg-[var(--color-control)] border border-[var(--color-border-subtle)] rounded-xl text-xs sm:text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-all"
                    />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                variant="primary"
                className="w-full justify-center mt-2"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>
                      {mode === 'register' && 'Complete Registration'}
                      {mode === 'login' && 'Sign In to Portal'}
                      {mode === 'forgot' && 'Send Reset Link'}
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </form>

            <div className="pt-2 text-center text-xs text-[var(--color-text-muted)] border-t border-[var(--color-border-subtle)]">
              Protected by DRIVAIR Verification Framework & Firebase Auth
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
