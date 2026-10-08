"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpRight, ArrowDownLeft, RefreshCcw, Wallet as WalletIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WalletPage() {
  const { currentUser, orgs, outlets, ledger, revenue, getWalletBalance, buyCredit } = useStore();
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="flex h-96 items-center justify-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>;
  if (!currentUser) return <div className="flex h-96 items-center justify-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>;

  const isOps = currentUser.role === 'ops';
  const org = orgs.find(o => o.id === currentUser.orgId);
  const isOut = !!currentUser.outletId;

  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount);
  };

  const renderOpsLedger = () => {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>SloganiRevenueLedger</CardTitle>
            <CardDescription>Central, control-plane table. Every credit sale and Agency→Outlet resale is recorded here.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Organization (buyer)</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenue.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted py-6">No records found.</TableCell>
                  </TableRow>
                ) : (
                  revenue.map(r => {
                    const rOrg = orgs.find(o => o.id === r.orgId);
                    return (
                      <TableRow key={r.id}>
                        <TableCell className="font-mono text-xs">{r.id}</TableCell>
                        <TableCell className="font-medium">{rOrg?.name || r.orgId}</TableCell>
                        <TableCell>
                          <Badge variant={r.kind.includes('resale') ? 'info' : 'default'} className="font-normal text-[11px] px-2 py-0.5">
                            {r.kind}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium text-brand-dark">{formatNaira(r.amount)}</TableCell>
                        <TableCell className="text-muted text-xs">{r.reference}</TableCell>
                        <TableCell className="text-xs text-muted">
                          {new Date(r.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (isOps) return renderOpsLedger();
  if (!org) return null;

  const walletKey = org.type === 'institution' ? org.id : (currentUser.outletId || org.id);
  const balance = getWalletBalance(walletKey);

  let walletLabel = 'Wallet balance';
  if (currentUser.role === 'outlet_staff') walletLabel = `Shared wallet · ${org.name}`;
  else if (currentUser.role === 'outlet_owner') walletLabel = 'Outlet wallet (funded by PayGate)';
  else if (currentUser.role === 'agency_admin') walletLabel = 'Agency wallet (funded by Slogani)';
  else walletLabel = 'Institution wallet (shared by all outlets)';

  let myLedger = ledger.filter(e => isOut ? e.outletId === currentUser.outletId : e.orgId === org.id);
  if (filter !== 'all') {
    myLedger = myLedger.filter(e => e.type === filter);
  }

  const handleTopup = (amount: number) => {
    try {
      buyCredit(amount);
      // Success toast logic can go here
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 border-brand/20 shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-muted text-sm font-medium">{walletLabel}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tabular-nums text-ink">{formatNaira(balance)}</div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle>Top up wallet</CardTitle>
          </CardHeader>
          <CardContent>
            {currentUser.role === 'outlet_staff' ? (
              <div className="p-4 rounded-[10px] bg-warn-tint text-warn text-sm">
                Centralized billing: Lagoon Hotels' admin tops up the shared wallet. Outlets can't buy credit directly.
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <span className="text-sm text-muted shrink-0">
                  Buy credit from <strong>{isOut ? org.name : 'Slogani'}</strong>:
                </span>
                <div className="flex flex-wrap gap-3">
                  {[5000, 10000, 50000].map(a => (
                    <Button key={a} variant="outline" onClick={() => handleTopup(a)} className="font-tabular-nums">
                      + {formatNaira(a)}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {currentUser.role === 'agency_admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Outlet wallets</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Outlet</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outlets.filter(o => o.orgId === org.id).map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.name}</TableCell>
                    <TableCell className="text-right tabular-nums font-medium">{formatNaira(getWalletBalance(o.id))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>WalletLedgerEntry</CardTitle>
            <CardDescription>
              Append-only {isOut ? '· your outlet\'s rows' : '· all rows in your schema'}
            </CardDescription>
          </div>
          <select 
            className="h-9 rounded-[8px] border border-line bg-surface px-3 py-1 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-tint"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All transactions</option>
            <option value="credit">Credits</option>
            <option value="debit">Debits</option>
            <option value="refund">Refunds</option>
          </select>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Outlet</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Balance after</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myLedger.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted py-6">No records found.</TableCell>
                </TableRow>
              ) : (
                myLedger.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs">{e.id}</TableCell>
                    <TableCell>{outlets.find(o => o.id === e.outletId)?.name || '—'}</TableCell>
                    <TableCell>
                      <Badge variant={e.type === 'credit' ? 'default' : (e.type === 'debit' ? 'warning' : 'secondary')} className="flex w-fit items-center gap-1 font-normal text-[11px] px-2 py-0.5">
                        {e.type === 'credit' && <ArrowDownLeft className="w-3 h-3" />}
                        {e.type === 'debit' && <ArrowUpRight className="w-3 h-3" />}
                        {e.type === 'refund' && <RefreshCcw className="w-3 h-3" />}
                        {e.type.charAt(0).toUpperCase() + e.type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn("text-right tabular-nums font-medium", e.type === 'credit' ? "text-brand-dark" : (e.type === 'debit' ? "text-ink" : "text-muted"))}>
                      {e.type === 'debit' ? '-' : '+'}{formatNaira(e.amount)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-muted">{formatNaira(e.balanceAfter)}</TableCell>
                    <TableCell className="text-muted text-xs truncate max-w-[150px]" title={e.reference}>{e.reference}</TableCell>
                    <TableCell className="text-xs text-muted">
                      {new Date(e.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
