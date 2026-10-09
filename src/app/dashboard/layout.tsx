"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore, Role } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Menu, LayoutDashboard, ShieldCheck, Wallet, Users, FileText, Lock, ChevronDown, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser, users, setCurrentUser } = useStore();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isOut = !!currentUser?.outletId;
  const isOps = currentUser?.role === 'ops';

  const navItems = isOps 
    ? [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/orgs", label: "Organizations", icon: Users },
        { href: "/dashboard/wallet", label: "Revenue ledger", icon: Wallet },
        { href: "/dashboard/audit", label: "Audit log", icon: FileText },
        { href: "/dashboard/security", label: "Isolation lab", icon: Lock },
      ]
    : [
        { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/verify", label: "Verify", icon: ShieldCheck },
        { href: "/dashboard/wallet", label: "Wallet & ledger", icon: Wallet },
        { href: "/dashboard/outlets", label: isOut ? "Team" : "Outlets & team", icon: Users },
        { href: "/dashboard/audit", label: "Audit log", icon: FileText },
        { href: "/dashboard/security", label: "Isolation lab", icon: Lock },
      ];

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-[232px] bg-surface border-r border-line transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center gap-2 p-4 pb-6 font-bold text-[18px]">
          <div className="w-[30px] h-[30px] rounded-[9px] bg-brand flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>
          </div>
          TruvoID
        </div>
        
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
                <div className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-[9px] text-[14px] font-medium transition-colors",
                  isActive ? "bg-brand-tint text-brand-dark font-semibold" : "text-muted hover:bg-bg hover:text-ink"
                )}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 mt-auto border-t border-line text-[11px] text-muted">
          TruvoID is an independent verification platform. It is not NIMC or a government body.
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-[60px] bg-surface border-b border-line flex items-center justify-between px-4 lg:px-8 z-30">
          <div className="flex items-center">
            <button className="md:hidden mr-4" onClick={() => setIsMobileOpen(!isMobileOpen)}>
              <Menu className="w-5 h-5 text-ink" />
            </button>
            <h1 className="text-lg font-semibold text-ink truncate hidden sm:block">
              {navItems.find(i => i.href === pathname)?.label || 'Dashboard'}
            </h1>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-bg transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-brand-tint text-brand-dark flex items-center justify-center font-bold text-xs">
                {currentUser?.name.charAt(0)}
              </div>
              <div className="text-sm font-medium text-ink hidden sm:block">{currentUser?.name}</div>
              <ChevronDown className="w-4 h-4 text-muted" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-[240px] bg-surface border border-line rounded-[14px] shadow-soft py-2 z-50">
                <div className="px-4 py-2 border-b border-line mb-2">
                  <div className="text-xs font-semibold text-muted mb-1 uppercase tracking-wider">Demo: switch persona</div>
                  <div className="text-sm font-medium">{currentUser?.name}</div>
                  <div className="text-xs text-muted truncate">{currentUser?.role.replace('_', ' ')}</div>
                </div>
                {users.map(u => (
                  <button 
                    key={u.id}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm hover:bg-bg transition-colors flex items-center justify-between",
                      currentUser?.id === u.id && "bg-brand-tint/50 text-brand-dark font-medium"
                    )}
                    onClick={() => {
                      setCurrentUser(u.id);
                      setIsMenuOpen(false);
                    }}
                  >
                    <span className="truncate">{u.name} <span className="text-xs text-muted ml-1">({u.role})</span></span>
                    {currentUser?.id === u.id && <div className="w-2 h-2 rounded-full bg-brand" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-6xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-ink/20 z-30 md:hidden" 
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </div>
  );
}
