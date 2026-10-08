"use client";

import React, { useState, useEffect } from "react";
import { useStore, BASE_RATES, AGENCY_MARKUP } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type VerifyType = 'NIN' | 'BVN' | 'Phone→NIN';

export default function VerifyPage() {
  const { currentUser, orgs, outlets, calls, runVerification } = useStore();
  const [mounted, setMounted] = useState(false);
  
  const [type, setType] = useState<VerifyType>('NIN');
  const [num, setNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="flex h-96 items-center justify-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>;
  if (!currentUser) return <div className="flex h-96 items-center justify-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>;

  if (currentUser.role === 'agency_admin') {
    return (
      <Card className="border-warn bg-warn-tint/30">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <AlertCircle className="w-12 h-12 text-warn mb-4" />
          <h2 className="text-xl font-bold mb-2 text-warn">Agencies don't run verifications directly</h2>
          <p className="text-muted max-w-md">
            Agencies delegate verifications to their Outlets. Switch to <strong>Outlet Owner</strong> to run a lookup.
          </p>
        </CardContent>
      </Card>
    );
  }

  const org = orgs.find(o => o.id === currentUser.orgId);
  const isOut = !!currentUser.outletId;
  const ratesText = (Object.keys(BASE_RATES) as VerifyType[]).map(t => {
    const rate = org?.type === 'agency' ? Math.round(BASE_RATES[t] * AGENCY_MARKUP) : BASE_RATES[t];
    return `${t}: ₦${rate}`;
  }).join(' · ');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{11}$/.test(num)) return;
    
    setLoading(true);
    setResult(null);
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 600));
    
    const res = runVerification(num, type);
    setResult(res);
    setLoading(false);
  };

  const scopedCalls = calls.filter(c => isOut ? c.outletId === currentUser.outletId : c.orgId === currentUser.orgId).slice(0, 8);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Run a verification</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-4 mb-4">
            <select 
              className="h-10 rounded-[10px] border border-line bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-tint focus:border-brand"
              value={type}
              onChange={(e) => setType(e.target.value as VerifyType)}
            >
              {Object.keys(BASE_RATES).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <Input 
              type="text" 
              inputMode="numeric" 
              maxLength={11} 
              placeholder="11-digit number" 
              className="sm:max-w-[240px] font-mono"
              value={num}
              onChange={(e) => setNum(e.target.value.replace(/\D/g, ''))}
            />
            <Button type="submit" disabled={num.length !== 11 || loading} className="w-full sm:w-auto">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Verify
            </Button>
          </form>
          
          <div className="text-sm text-muted">
            <p>Rate for {org?.type === 'agency' ? 'Agency outlets (incl. markup)' : 'this Institution'}: <span className="font-medium text-ink">{ratesText}</span></p>
            <p className="mt-1">Tip: numbers ending in 0 simulate "not found" (auto-refund). Spend more than your balance to see the rollback.</p>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          {!result.ok ? (
            <Card className="border-danger bg-danger-tint/30">
              <CardContent className="pt-6 text-danger font-medium flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                {result.msg}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  {result.nf ? (
                    <Badge variant="destructive" className="flex items-center gap-1.5 px-3 py-1 text-sm">
                      <XCircle className="w-4 h-4" /> Not found — refunded
                    </Badge>
                  ) : (
                    <Badge variant="default" className="flex items-center gap-1.5 px-3 py-1 text-sm">
                      <CheckCircle2 className="w-4 h-4" /> Verified
                    </Badge>
                  )}
                  <span className="text-sm text-muted font-mono">{result.call.id} · {result.call.type}</span>
                </div>

                {!result.nf && result.result ? (
                  <div className="grid sm:grid-cols-3 gap-6 mb-8 p-6 bg-bg rounded-[12px] border border-line">
                    <div>
                      <div className="text-xs font-medium text-muted mb-1">Full name</div>
                      <div className="font-semibold text-ink">{result.result.name}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted mb-1">Date of birth</div>
                      <div className="font-semibold text-ink tabular-nums">{result.result.dob}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted mb-1">Phone</div>
                      <div className="font-semibold text-ink tabular-nums">{result.result.phone}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted mb-6">No record matched this number.</p>
                )}

                <div className="bg-[#0B0D12] text-[#d7dde8] rounded-[10px] p-4 font-mono text-sm overflow-x-auto shadow-inner">
                  <pre className="whitespace-pre">
                    <span className="text-[#6EE7B7]">BEGIN;</span>{"\n"}
                    <span className="text-muted-foreground">  -- step 1: atomic debit</span>{"\n"}
                    {"  "}INSERT wallet_ledger_entry  debit ₦{result.rate}  → {result.call.ledgerId}{"\n"}
                    <span className="text-muted-foreground">  -- step 2: record the call securely</span>{"\n"}
                    {"  "}INSERT verification_call    {result.call.id}  subject_ref={result.call.subjectRef}{"\n"}
                    {result.nf && (
                      <>
                        <span className="text-muted-foreground">  -- step 3: auto-refund because not found</span>{"\n"}
                        {"  "}INSERT wallet_ledger_entry  refund ₦{result.rate}{"\n"}
                      </>
                    )}
                    <span className="text-[#6EE7B7]">COMMIT;</span>
                  </pre>
                </div>
                <div className="text-xs text-muted mt-3">
                  Only status + minimized result are kept; the raw NIMC payload is not stored.
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent calls</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Call</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Outlet</TableHead>
                <TableHead>By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Charged</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scopedCalls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted py-6">Nothing yet.</TableCell>
                </TableRow>
              ) : (
                scopedCalls.map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.id}</TableCell>
                    <TableCell>{c.type}</TableCell>
                    <TableCell>{outlets.find(o => o.id === c.outletId)?.name || '—'}</TableCell>
                    <TableCell>{c.by}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === 'verified' ? 'default' : 'destructive'} className={cn("px-2 py-0.5", c.status === 'verified' ? "bg-brand/10 text-brand-dark" : "bg-danger/10 text-danger")}>
                        {c.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">₦{c.amount}</TableCell>
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
