"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function AuditLogPage() {
  const { currentUser, audit, orgs } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="flex h-96 items-center justify-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>;
  if (!currentUser) return <div className="flex h-96 items-center justify-center"><div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div></div>;

  const isOps = currentUser.role === 'ops';
  
  const myAudit = isOps ? audit : audit.filter(a => a.orgId === currentUser.orgId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>AuditLog</CardTitle>
            <CardDescription className="font-mono text-xs mt-1">(central, immutable)</CardDescription>
            <p className="text-sm text-muted mt-2">
              {isOps ? 'Spans the whole tenant tree for NDPC/DPCO compliance export.' : 'You see events for your Organization only.'}
            </p>
          </div>
          {isOps && (
            <Button variant="outline" onClick={() => alert('Compliance export queued → encrypted S3 bucket.')}>
              Export for compliance
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Organization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myAudit.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted py-6">No records found.</TableCell>
                </TableRow>
              ) : (
                myAudit.slice(0, 30).map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="text-xs text-muted">
                      {new Date(e.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </TableCell>
                    <TableCell className="font-medium">{e.actor}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal text-[11px] px-2 py-0.5 font-mono">
                        {e.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted text-sm">{e.entity}</TableCell>
                    <TableCell className="text-sm">
                      {orgs.find(o => o.id === e.orgId)?.name || e.orgId}
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
