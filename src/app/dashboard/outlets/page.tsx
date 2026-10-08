"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Building2, Store } from "lucide-react";

export default function OutletsAndTeamPage() {
  const { currentUser, orgs, outlets, users, getWalletBalance, createOutlet } = useStore();
  const [mounted, setMounted] = useState(false);
  const [newOutletName, setNewOutletName] = useState("");
  const [newStaffName, setNewStaffName] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="flex h-96 items-center justify-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>;
  if (!currentUser || currentUser.role === 'ops') return <div className="flex h-96 items-center justify-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>;

  const org = orgs.find(o => o.id === currentUser.orgId);
  const isOut = !!currentUser.outletId;

  if (!org) return null;

  const myUsers = users.filter(u => isOut ? u.outletId === currentUser.outletId : u.orgId === org.id);

  const handleCreateOutlet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOutletName.trim()) return;
    createOutlet(newOutletName.trim(), org.id);
    setNewOutletName("");
  };

  const renderTeamTable = () => (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Team</CardTitle>
        <CardDescription>Identity lives in the central control plane.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Outlet</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {myUsers.map(u => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-normal capitalize px-2 py-0.5">
                    {u.role.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted">
                  {u.outletId ? outlets.find(o => o.id === u.outletId)?.name : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {currentUser.role !== 'outlet_staff' && (
          <form className="flex items-center gap-3 mt-6 pt-6 border-t border-line" onSubmit={(e) => e.preventDefault()}>
            <Input 
              placeholder="Staff name" 
              className="max-w-[240px]" 
              value={newStaffName}
              onChange={(e) => setNewStaffName(e.target.value)}
            />
            <Button variant="outline" disabled={!newStaffName.trim()}>Add staff user</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );

  if (isOut) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Team</h1>
          <p className="text-muted">Manage users in your outlet.</p>
        </div>
        {renderTeamTable()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Outlets & Team</h1>
        <p className="text-muted">Manage your organization's structure and users.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Store className="w-5 h-5" /> Outlets under {org.name}</CardTitle>
          <CardDescription>
            Outlets live as rows inside <code className="bg-bg px-1 py-0.5 rounded text-xs">{org.schema}</code>, isolated by row-level security.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Outlet</TableHead>
                <TableHead>Wallet type</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {outlets.filter(o => o.orgId === org.id).map(o => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">{o.name}</TableCell>
                  <TableCell className="text-muted text-sm">
                    {org.type === 'institution' ? 'Shared with parent' : 'Own wallet'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(
                      getWalletBalance(org.type === 'institution' ? org.id : o.id)
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <form className="flex items-center gap-3 mt-6 pt-6 border-t border-line" onSubmit={handleCreateOutlet}>
            <Input 
              placeholder="New outlet name" 
              className="max-w-[240px]" 
              value={newOutletName}
              onChange={(e) => setNewOutletName(e.target.value)}
            />
            <Button type="submit" disabled={!newOutletName.trim()}>Create outlet</Button>
          </form>
        </CardContent>
      </Card>

      {renderTeamTable()}
    </div>
  );
}
