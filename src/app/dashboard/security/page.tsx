"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SecurityIsolationPage() {
  const { currentUser, orgs, outlets, ledger } = useStore();
  const [mounted, setMounted] = useState(false);
  
  const [targetTenant, setTargetTenant] = useState<string>('');
  const [crossTenantResult, setCrossTenantResult] = useState<string | null>(null);
  const [poolResult, setPoolResult] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (orgs.length > 0) {
      const others = orgs.filter(o => o.id !== currentUser?.orgId);
      if (others.length > 0) setTargetTenant(others[0].id);
    }
  }, [orgs, currentUser]);

  if (!mounted) return <div className="flex h-96 items-center justify-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>;
  if (!currentUser) return <div className="flex h-96 items-center justify-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>;

  const isOps = currentUser.role === 'ops';
  const org = orgs.find(o => o.id === currentUser.orgId);
  const others = orgs.filter(o => o.id !== currentUser.orgId);
  const isOut = !!currentUser.outletId;

  const dbRole = isOps ? 'rl_controlplane_ops' : org?.role || '';
  const schema = isOps ? 'control_plane' : org?.schema || '';
  const guc = isOps 
    ? '(none — control-plane only)' 
    : isOut ? `SET LOCAL app.outlet_id = '${currentUser.outletId}';` : `SET LOCAL app.org_id = '${org?.id}';`;

  const handleCrossTenantRead = () => {
    const target = orgs.find(o => o.id === targetTenant);
    if (!target) return;
    
    const roleToUse = isOps ? 'rl_controlplane_ops' : (org?.role || '');
    
    setCrossTenantResult(
      `-- as ${roleToUse}\n` +
      `SELECT * FROM ${target.schema}.wallet_ledger_entry;\n` +
      `<span class="text-danger">ERROR:  permission denied for schema ${target.schema}</span>\n` +
      `-- refused by Postgres itself, not by application code (SQLSTATE 42501)`
    );
  };

  const handlePoolTest = (mode: 'SET' | 'LOCAL') => {
    const ob = outlets.find(x => x.orgId === (org?.id || 'paygate')) || outlets[0];
    const n = ledger.filter(e => e.outletId === ob.id).length;
    const L = mode === 'LOCAL';
    
    setPoolResult(
      `Pooled connection #1\n` +
      `Request A  BEGIN; <span class="text-brand">${L ? 'SET LOCAL' : 'SET'}</span> app.outlet_id='${ob.id}'; SELECT …; COMMIT;\n` +
      `Request B  (no identity) reuses connection #1\n` +
      (L 
        ? `           current_setting('app.outlet_id') = NULL   <span class="text-brand">(reset at COMMIT)</span>\n           <span class="text-brand">Request B sees 0 rows ✓</span>` 
        : `           current_setting('app.outlet_id') = '${ob.id}'   <span class="text-danger">← LEAKED</span>\n           <span class="text-danger">Request B sees ${n} rows belonging to ${ob.name} ✗</span>`
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Isolation Lab</h1>
        <p className="text-muted">Explore how TruvoID securely isolates tenant data at the database level.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand" />
              1 · Per-Organization database role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-[#0B0D12] text-[#d7dde8] rounded-[10px] p-4 font-mono text-xs overflow-x-auto mb-4">
              <pre className="whitespace-pre">
                connected as  <span className="text-[#6EE7B7]">{dbRole}</span>{"\n"}
                schema        {schema}{"\n"}
                session       {guc}
              </pre>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <select 
                className="flex h-10 w-full rounded-[10px] border border-line bg-surface px-3 py-2 text-sm focus:ring-2 focus:ring-brand-tint"
                value={targetTenant}
                onChange={(e) => setTargetTenant(e.target.value)}
              >
                {others.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              <Button variant="destructive" onClick={handleCrossTenantRead} className="shrink-0 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Attempt cross-tenant read
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand" />
              2 · Row-level security inside a schema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-[#0B0D12] text-[#d7dde8] rounded-[10px] p-4 font-mono text-[11px] overflow-x-auto mb-4">
              <pre className="whitespace-pre leading-relaxed">
                ALTER TABLE wallet_ledger_entry FORCE ROW LEVEL SECURITY;{"\n"}
                CREATE POLICY scope ON wallet_ledger_entry USING ({"\n"}
                {"    "}organization_id = current_setting('app.org_id'){"\n"}
                {" "}OR outlet_id       = current_setting('app.outlet_id'){"\n"}
                );   <span className="text-muted-foreground">-- OR of two conditions: Agency Admin sees all outlets</span>
              </pre>
            </div>
            
            {!isOps && (
              <p className="text-sm text-muted">
                With this identity you can read <strong>{ledger.filter(e => isOut ? e.outletId === currentUser.outletId : e.orgId === org?.id).length}</strong> of <strong>{ledger.filter(e => e.orgId === org?.id).length}</strong> ledger rows in <code className="bg-bg px-1 rounded">{org?.schema}</code>.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {crossTenantResult && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <div className="bg-[#0B0D12] text-[#d7dde8] rounded-[10px] p-4 font-mono text-sm overflow-x-auto shadow-inner border border-danger/20">
            <pre className="whitespace-pre leading-relaxed" dangerouslySetInnerHTML={{ __html: crossTenantResult }} />
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand" />
            3 · Connection-pool trap: SET vs SET LOCAL
          </CardTitle>
          <CardDescription>
            Request A scopes itself to an Outlet. Request B (unrelated, no identity) then reuses the same pooled connection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button variant="destructive" onClick={() => handlePoolTest('SET')}>Plain SET (buggy)</Button>
            <Button variant="default" onClick={() => handlePoolTest('LOCAL')}>SET LOCAL (correct)</Button>
          </div>
        </CardContent>
      </Card>

      {poolResult && (
        <div className="animate-in fade-in slide-in-from-top-2">
          <div className="bg-[#0B0D12] text-[#d7dde8] rounded-[10px] p-4 font-mono text-sm overflow-x-auto shadow-inner">
            <pre className="whitespace-pre leading-relaxed" dangerouslySetInnerHTML={{ __html: poolResult }} />
          </div>
        </div>
      )}

    </div>
  );
}
