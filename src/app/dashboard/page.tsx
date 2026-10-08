"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Store, Activity, History, Lock, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function DashboardOverview() {
  const { currentUser, orgs, outlets, ledger, revenue, calls, audit, getWalletBalance } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>;
  if (!currentUser) return <div className="flex h-screen items-center justify-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>;

  const isOps = currentUser.role === 'ops';
  const org = orgs.find(o => o.id === currentUser.orgId);
  const isOut = !!currentUser.outletId;

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
  };

  const renderOpsOverview = () => {
    const totalRevenue = revenue.reduce((acc, r) => acc + r.amount, 0);
    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
    const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

    return (
      <div className="space-y-6">
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={item}>
            <Card className="hover:-translate-y-1 hover:shadow-soft transition-all duration-300">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-muted text-xs font-medium uppercase tracking-wider">Organizations</CardTitle>
                <Building2 className="w-4 h-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{orgs.length}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="hover:-translate-y-1 hover:shadow-soft transition-all duration-300">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-muted text-xs font-medium uppercase tracking-wider">Outlets</CardTitle>
                <Store className="w-4 h-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{outlets.length}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="hover:-translate-y-1 hover:shadow-soft transition-all duration-300">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-muted text-xs font-medium uppercase tracking-wider">Slogani Revenue</CardTitle>
                <Activity className="w-4 h-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums text-brand-dark">{formatNaira(totalRevenue)}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="hover:-translate-y-1 hover:shadow-soft transition-all duration-300">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-muted text-xs font-medium uppercase tracking-wider">Audit Events</CardTitle>
                <History className="w-4 h-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tabular-nums">{audit.length}</div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <Card className="shadow-soft border-line">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Revenue Over Time
              <Tooltip>
                <TooltipTrigger><HelpCircle className="w-4 h-4 text-muted" /></TooltipTrigger>
                <TooltipContent>Total credits purchased across all organizations.</TooltipContent>
              </Tooltip>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueChart data={revenue.map(r => ({ date: r.createdAt, amount: r.amount }))} />
          </CardContent>
        </Card>

        <TenantMap />
      </div>
    );
  };

  const renderTenantOverview = () => {
    if (!org) return null;
    
    const walletKey = org.type === 'institution' ? org.id : (currentUser.outletId || org.id);
    const balance = getWalletBalance(walletKey);
    const scopedCalls = calls.filter(c => isOut ? c.outletId === currentUser.outletId : c.orgId === org.id);
    const myOutlets = outlets.filter(o => o.orgId === org.id);

    let walletLabel = 'Wallet balance';
    let walletTooltip = '';
    if (currentUser.role === 'outlet_staff') {
      walletLabel = `Shared wallet · ${org.name}`;
      walletTooltip = 'Institution outlets draw from a single shared parent wallet.';
    }
    else if (currentUser.role === 'outlet_owner') {
      walletLabel = 'Outlet wallet (funded by Agency)';
      walletTooltip = 'You have your own wallet. You buy credits from your parent Agency at their markup rate.';
    }
    else if (currentUser.role === 'agency_admin') {
      walletLabel = 'Agency wallet (funded by Slogani)';
      walletTooltip = 'You buy credits from Slogani and your outlets buy from you.';
    }
    else {
      walletLabel = 'Institution wallet (shared by all outlets)';
      walletTooltip = 'You fund this wallet. All your outlets draw from it simultaneously.';
    }

    const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
    const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">{org.name}</h2>
          <p className="text-muted text-sm">{org.type === 'institution' ? 'Institution' : 'Agency'} {isOut ? `· ${outlets.find(o=>o.id === currentUser.outletId)?.name}` : ''}</p>
        </div>
        
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={item}>
            <Card className="hover:-translate-y-1 hover:shadow-soft transition-all duration-300 border-brand/30 bg-brand-tint/30">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-brand-dark/80 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  {walletLabel}
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="w-3.5 h-3.5 opacity-70" /></TooltipTrigger>
                    <TooltipContent>{walletTooltip}</TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tabular-nums text-brand-dark">{formatNaira(balance)}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="hover:-translate-y-1 hover:shadow-soft transition-all duration-300">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-muted text-xs font-medium uppercase tracking-wider">Verifications</CardTitle>
                <Activity className="w-4 h-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tabular-nums">{scopedCalls.length}</div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="hover:-translate-y-1 hover:shadow-soft transition-all duration-300">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-muted text-xs font-medium uppercase tracking-wider">{isOut ? 'Your outlet' : 'Total outlets'}</CardTitle>
                <Store className="w-4 h-4 text-muted" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold mt-1.5 truncate">
                  {isOut ? outlets.find(o=>o.id === currentUser.outletId)?.name : myOutlets.length}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={item}>
            <Card className="hover:-translate-y-1 hover:shadow-soft transition-all duration-300">
              <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-muted text-xs font-medium uppercase tracking-wider flex items-center gap-1.5">
                  Tenant type
                  <Tooltip>
                    <TooltipTrigger><HelpCircle className="w-3.5 h-3.5" /></TooltipTrigger>
                    <TooltipContent>Your billing model (Institution vs Agency)</TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <Badge variant={org.type === 'agency' ? 'info' : 'default'} className="uppercase text-[11px] tracking-wider px-2.5 py-1">
                  {org.type}
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {!isOut && (
          <Card className="shadow-soft border-line">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Usage Analytics
                <Badge variant="secondary" className="ml-2 font-normal">Last 7 days</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart data={scopedCalls.map(c => ({ date: c.createdAt, amount: c.amount }))} />
            </CardContent>
          </Card>
        )}

        <TenantMap />
      </div>
    );
  };

  return isOps ? renderOpsOverview() : renderTenantOverview();
}

function TenantMap() {
  const { currentUser, orgs, outlets } = useStore();
  const isOps = currentUser?.role === 'ops';

  return (
    <Card className="mt-6 border-line shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Tenant Map
          <Tooltip>
            <TooltipTrigger><HelpCircle className="w-4 h-4 text-muted" /></TooltipTrigger>
            <TooltipContent>A visualization of physical database schema boundaries and RLS.</TooltipContent>
          </Tooltip>
        </CardTitle>
        <p className="text-sm text-muted mt-1">
          {isOps 
            ? 'Ops operates the control plane only — tenant schemas are not readable by the Ops role.'
            : 'You can only see your own Organization’s schema. Other schemas reject your database role.'}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={cn("border rounded-[12px] p-4 text-sm transition-colors", isOps ? "border-brand bg-brand-tint" : "border-line bg-surface")}>
            <div className="font-semibold mb-1 flex items-center justify-between">
              Control plane
              {isOps && <Badge className="text-[9px] px-1.5 py-0.5 bg-brand-dark/20 text-brand-dark border-0">ACTIVE ROLE</Badge>}
            </div>
            <div className="text-xs text-muted">Org registry · Identity · AuditLog · SloganiRevenueLedger</div>
          </div>
          
          {orgs.map(org => {
            const isMine = org.id === currentUser?.orgId;
            const myOutlets = outlets.filter(o => o.orgId === org.id);
            return (
              <div key={org.id} className={cn(
                "border rounded-[12px] p-4 text-sm transition-all duration-300", 
                isMine ? "border-brand bg-brand-tint/40 shadow-sm" : "border-line bg-bg opacity-60 hover:opacity-80"
              )}>
                <div className="flex items-center gap-2 font-semibold mb-1">
                  {!isMine && <Lock className="w-3.5 h-3.5 text-muted" />}
                  {org.name}
                  {isMine && !isOps && <Badge className="ml-auto text-[9px] px-1.5 py-0.5 bg-brand-dark/20 text-brand-dark border-0">ACTIVE SCHEMA</Badge>}
                </div>
                <div className="mb-3">
                  <Badge variant={org.type === 'agency' ? 'info' : 'default'} className="text-[9px] px-1.5 py-0.5 uppercase tracking-wider font-semibold">
                    {org.type}
                  </Badge>
                </div>
                <div className="text-xs text-muted mb-4 p-2 bg-surface rounded-[8px] border border-line/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="opacity-70">schema</span>
                    <code className="font-mono">{org.schema}</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-70">role</span>
                    <code className="font-mono">{org.role}</code>
                  </div>
                </div>
                {myOutlets.length > 0 && (
                  <div className="border-t border-line border-dashed pt-3 space-y-1.5">
                    {myOutlets.map(o => (
                      <div key={o.id} className="text-xs text-muted flex items-center">
                        <span className="text-[10px] mr-1.5 text-muted/50">↳</span>
                        {o.name}
                        {o.id === currentUser?.outletId && <span className="ml-auto text-brand-dark font-medium text-[10px] bg-brand-tint px-1.5 py-0.5 rounded">YOU</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
