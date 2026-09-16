import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from './Button';
import { Menu, X, Shield, User, LogOut, ChevronDown, Dumbbell, MessageCircle } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Kush', path: '/about' },
    { name: 'Pricing & Plans', path: '/pricing' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-brand-border bg-brand-bg/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-brand-card border border-brand-border flex items-center justify-center p-1.5 group-hover:border-brand-accent/50 transition-colors">
            <img src="/assets/logo/logo.svg" alt="CoachKush Logo" className="w-full h-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-brand-accent transition-colors">
              COACH<span className="text-brand-accent">KUSH</span>
            </span>
            <span className="text-[10px] tracking-widest uppercase text-brand-muted -mt-1 font-semibold">
              Live Virtual Coaching
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-brand-accent ${
                  isActive ? 'text-brand-accent font-semibold' : 'text-brand-muted'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* Admin link visible exclusively when role is verified admin */}
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider bg-brand-accent/15 text-brand-accent border border-brand-accent/30 px-3 py-1.5 rounded-lg hover:bg-brand-accent/25 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Auth / Action CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://wa.me/917042858524"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/30 text-xs font-semibold transition-all duration-200"
            title="Chat directly on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
            <span>WhatsApp</span>
          </a>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-brand-card border border-brand-border hover:border-brand-borderLight text-sm font-medium text-white transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent font-bold text-xs">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="max-w-[120px] truncate">{user?.name}</span>
                <ChevronDown className="w-4 h-4 text-brand-muted" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-brand-card border border-brand-border rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-brand-border">
                    <p className="text-xs text-brand-muted">Signed in as</p>
                    <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-accent hover:bg-brand-surface transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-brand-surface transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="primary" size="sm">
                  Start Coaching
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <a
            href="https://wa.me/917042858524"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30 text-xs font-semibold"
            title="Chat directly on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-current" />
          </a>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-brand-muted hover:text-white rounded-lg bg-brand-card border border-brand-border"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-b border-brand-border bg-brand-card/95 backdrop-blur-xl px-4 pt-4 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 px-3 text-base font-medium rounded-lg text-brand-muted hover:text-white hover:bg-brand-surface"
            >
              {link.name}
            </Link>
          ))}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 py-2.5 px-3 text-base font-semibold text-brand-accent bg-brand-accent/10 rounded-lg"
            >
              <Shield className="w-5 h-5" />
              Admin Portal
            </Link>
          )}

          <a
            href="https://wa.me/917042858524"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 py-2.5 px-3 text-sm font-semibold rounded-lg bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/25 transition-colors"
          >
            <MessageCircle className="w-4 h-4 fill-current" />
            Chat on WhatsApp (+91 70428 58524)
          </a>

          <div className="pt-4 border-t border-brand-border flex flex-col gap-2.5">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2">
                  <p className="text-xs text-brand-muted">Signed in as</p>
                  <p className="text-sm font-semibold text-white truncate">{user?.name} ({user?.email})</p>
                </div>
                <Button variant="danger" size="md" onClick={handleLogout} className="w-full">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" size="md" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/pricing" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Start
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
