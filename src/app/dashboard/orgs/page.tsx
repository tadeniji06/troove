"use client";

import React, { useState, useEffect } from "react";
import { useStore, OrgType } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2 } from "lucide-react";

export default function OrganizationsPage() {
  const { currentUser, orgs, outlets, createOrg } = useStore();
  const [mounted, setMounted] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgType, setNewOrgType] = useState<OrgType>("institution");
  const [provResult, setProvResult] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="flex h-96 items-center justify-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>;
  if (currentUser?.role !== 'ops') return <div className="flex h-96 items-center justify-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>;

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;
    
    createOrg(newOrgName.trim(), newOrgType);
    
    const s = newOrgName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 20);
    setProvResult(
      `<span class="text-[#6EE7B7]">CREATE SCHEMA</span> org_${s};\n` +
      `<span class="text-[#6EE7B7]">CREATE ROLE</span> rl_${s} LOGIN NOSUPERUSER NOBYPASSRLS;\n` +
      `<span class="text-[#6EE7B7]">GRANT</span> USAGE ON SCHEMA org_${s} TO rl_${s};   -- DML only; DDL owner is separate\n` +
      `<span class="text-[#6EE7B7]">ALTER TABLE</span> org_${s}.wallet_ledger_entry FORCE ROW LEVEL SECURITY;\n` +
      `-- secret: secretsmanager://truvoid/org/${s}/db-credentials\n` +
      `-- registry row added to control plane (${newOrgType})`
    );
    setNewOrgName("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Organizations</h1>
        <p className="text-muted">Manage the platform registry and provisioning.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="w-5 h-5" /> Organization registry</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Schema</TableHead>
                <TableHead>DB role</TableHead>
                <TableHead>Outlets</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orgs.map(g => (
                <TableRow key={g.id}>
                  <TableCell className="font-medium">{g.name}</TableCell>
                  <TableCell>
                    <Badge variant={g.type === 'agency' ? 'info' : 'default'} className="uppercase text-[10px] tracking-wider px-2 py-0.5">
                      {g.type}
                    </Badge>
                  </TableCell>
                  <TableCell><code className="bg-bg px-1.5 py-0.5 rounded text-xs border border-line">{g.schema}</code></TableCell>
                  <TableCell><code className="bg-bg px-1.5 py-0.5 rounded text-xs border border-line">{g.role}</code></TableCell>
                  <TableCell className="tabular-nums">{outlets.filter(x => x.orgId === g.id).length}</TableCell>
                  <TableCell><Badge variant="outline" className="font-normal text-brand border-brand/20 bg-brand/5 px-2 py-0.5">{g.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Provision a new tenant</CardTitle>
          <CardDescription>Ops can create Institutions and Agencies.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col sm:flex-row gap-4 items-center" onSubmit={handleCreateOrg}>
            <Input 
              placeholder="Organization name" 
              className="sm:max-w-[240px]"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
            />
            <select 
              className="h-10 w-full sm:w-auto rounded-[10px] border border-line bg-surface px-3 py-2 text-sm focus:ring-2 focus:ring-brand-tint"
              value={newOrgType}
              onChange={(e) => setNewOrgType(e.target.value as OrgType)}
            >
              <option value="institution">Institution</option>
              <option value="agency">Agency</option>
            </select>
            <Button type="submit" disabled={!newOrgName.trim()} className="w-full sm:w-auto">Provision</Button>
          </form>

          {provResult && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-2">
              <div className="bg-[#0B0D12] text-[#d7dde8] rounded-[10px] p-4 font-mono text-xs overflow-x-auto shadow-inner">
                <pre className="whitespace-pre leading-relaxed" dangerouslySetInnerHTML={{ __html: provResult }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
