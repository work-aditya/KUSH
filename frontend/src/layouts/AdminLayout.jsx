import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ToastContainer } from '../components/common/Toast';
import {
  LayoutDashboard,
  CreditCard,
  FileText,
  ShoppingBag,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  Ticket,
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Pricing Plans', path: '/admin/pricing', icon: CreditCard },
    { name: 'Coupons & Discounts', path: '/admin/coupons', icon: Ticket },
    { name: 'CMS Pages', path: '/admin/pages', icon: FileText },
    { name: 'Orders & Payments', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Users Directory', path: '/admin/users', icon: Users },
    { name: 'Contact Inquiries', path: '/admin/messages', icon: MessageSquare },
    { name: 'Site & Footer Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-[#080B11] text-brand-text">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-brand-card border-r border-brand-border flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-20 flex items-center justify-between px-6 border-b border-brand-border">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-bold text-white tracking-tight text-base">
                CoachKush <span className="text-brand-accent text-xs uppercase px-1.5 py-0.5 rounded bg-brand-accent/15 border border-brand-accent/30 font-semibold">Admin</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-brand-muted hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-accent text-black font-semibold shadow-lg shadow-brand-accent/20'
                      : 'text-brand-muted hover:text-white hover:bg-brand-surface'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User / Logout Footer */}
        <div className="p-4 border-t border-brand-border space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-brand-muted hover:text-white hover:bg-brand-surface transition-colors"
          >
            <span>View Live Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <div className="flex items-center justify-between px-3.5 py-2 bg-brand-surface rounded-xl border border-brand-border">
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-brand-muted truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-20 border-b border-brand-border px-6 flex items-center justify-between bg-brand-bg/50 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg bg-brand-card border border-brand-border text-brand-muted hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block">
            <p className="text-xs text-brand-muted">Administrative Portal</p>
            <h2 className="text-sm font-semibold text-white">Management Console</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              API Connected
            </span>
          </div>
        </header>

        <main className="p-6 lg:p-8 overflow-y-auto flex-1">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
