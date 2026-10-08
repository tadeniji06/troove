import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-tint flex-col justify-between p-12">
        <div className="flex items-center gap-2 font-bold text-lg text-brand-dark">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>
          </div>
          TruvoID
        </div>

        <div className="max-w-md">
          <Shield className="w-12 h-12 text-brand mb-6" />
          <h2 className="text-3xl font-bold text-brand-dark mb-4 tracking-tight">
            Independent Identity Infrastructure
          </h2>
          <p className="text-brand-dark/80 text-lg">
            A unified verification platform ensuring 100% data isolation for institutions and agencies. 
            Over 2.4M queries routed securely this month.
          </p>
        </div>

        <div className="text-sm font-medium text-brand-dark/60">
          © 2026 Slogani. TruvoID is not NIMC.
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 bg-surface">
        <div className="w-full max-w-[400px] mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
