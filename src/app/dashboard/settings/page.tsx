"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted">Manage your profile and organization preferences.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-1">
          <Button variant="secondary" className="w-full justify-start font-medium">Profile</Button>
          <Button variant="ghost" className="w-full justify-start">Organization</Button>
          <Button variant="ghost" className="w-full justify-start">Notifications</Button>
          <Button variant="ghost" className="w-full justify-start text-danger hover:text-danger hover:bg-danger-tint">Danger Zone</Button>
        </div>

        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">Placeholder for profile settings.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
