"use client"

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, ChevronRight, Server, Shield, ArrowRight } from "lucide-react"
import { useRouter } from 'next/navigation'
import { motion } from "framer-motion"

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [orgType, setOrgType] = useState<'institution'|'agency'|null>(null)

  const handleNext = () => setStep(s => s + 1)
  const handleFinish = () => router.push('/dashboard')

  const steps = [
    { id: 1, title: 'Identity', desc: 'Define your role in the ecosystem' },
    { id: 2, title: 'Outlets', desc: 'Configure branching' },
    { id: 3, title: 'Security', desc: 'Access & MFA controls' },
    { id: 4, title: 'Wallet', desc: 'Pre-fund your ledger' }
  ]

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center py-20 px-4">
      <div className="w-full max-w-3xl">
        <div className="mb-12">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight mb-8">
            <div className="w-8 h-8 rounded-[8px] bg-brand flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>
            </div>
            TruvoID
          </div>

          <div className="flex items-center justify-between relative mb-8">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-line -z-10 -translate-y-1/2 rounded-full" />
            <motion.div 
              className="absolute top-1/2 left-0 h-1 bg-brand -z-10 -translate-y-1/2 rounded-full" 
              initial={{ width: "0%" }}
              animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
            {steps.map(s => (
              <div key={s.id} className="flex flex-col items-center gap-2 bg-bg px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm transition-colors duration-300 ${step >= s.id ? 'bg-brand text-white border-2 border-brand' : 'bg-surface text-muted border-2 border-line'}`}>
                  {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                </div>
                <span className={`text-[11px] uppercase tracking-wider font-semibold ${step >= s.id ? 'text-ink' : 'text-muted/50'}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="shadow-soft border-line w-full overflow-hidden">
            {step === 1 && (
              <>
                <CardHeader className="bg-surface pb-6 border-b border-line">
                  <Badge className="w-fit mb-4 bg-brand-tint text-brand-dark hover:bg-brand-tint">Step 1</Badge>
                  <CardTitle className="text-2xl">Organizational Hierarchy</CardTitle>
                  <CardDescription className="text-base mt-2 leading-relaxed">
                    How will you be using TruvoID? This strictly dictates your physical database schema and your wallet isolation boundaries.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6 bg-surface/50">
                  <div 
                    className={`p-6 border rounded-[12px] cursor-pointer transition-all ${orgType === 'institution' ? 'border-brand bg-brand-tint/30 shadow-sm' : 'border-line hover:border-brand/40 bg-surface'}`}
                    onClick={() => setOrgType('institution')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold flex items-center gap-3 text-lg"><Server className="w-5 h-5 text-brand" /> Institution</div>
                      <Badge variant="secondary">Direct Integration</Badge>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">
                      You are a direct consumer of verification data (e.g. a Bank, Fintech, or Telco). Your entire organization shares one central prepaid wallet. All API calls deduct from this single balance regardless of which outlet initiated it.
                    </p>
                  </div>
                  <div 
                    className={`p-6 border rounded-[12px] cursor-pointer transition-all ${orgType === 'agency' ? 'border-info bg-info-tint/30 shadow-sm' : 'border-line hover:border-info/40 bg-surface'}`}
                    onClick={() => setOrgType('agency')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold flex items-center gap-3 text-lg"><Shield className="w-5 h-5 text-info" /> Agency</div>
                      <Badge variant="info">Reseller Model</Badge>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">
                      You act as an aggregator or reseller. Every Outlet you create gets its own completely isolated wallet. They must fund their wallet from you, and you fund your wallet from Slogani. You can define markup rates on verifications.
                    </p>
                  </div>
                  <Button onClick={handleNext} disabled={!orgType} size="lg" className="w-full mt-4 font-semibold text-base">Continue <ArrowRight className="w-4 h-4 ml-2"/></Button>
                </CardContent>
              </>
            )}

            {step === 2 && (
              <>
                <CardHeader className="bg-surface pb-6 border-b border-line">
                  <Badge className="w-fit mb-4 bg-brand-tint text-brand-dark hover:bg-brand-tint">Step 2</Badge>
                  <CardTitle className="text-2xl">Create your first Outlet</CardTitle>
                  <CardDescription className="text-base mt-2">An outlet represents a physical branch, a specific app, or a tenant you are reselling to.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-ink uppercase tracking-wider">Outlet Name</label>
                    <input type="text" placeholder="e.g. Ikeja Branch / App Frontend" className="w-full border border-line rounded-[8px] p-4 text-base focus:outline-none focus:ring-2 focus:ring-brand/30 bg-bg" />
                  </div>
                  {orgType === 'agency' && (
                    <div className="space-y-4">
                      <label className="text-sm font-semibold text-ink uppercase tracking-wider flex justify-between">
                        <span>Reseller Markup Rate</span>
                        <span className="text-muted font-normal lowercase tracking-normal">Per transaction</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold">₦</span>
                        <input type="number" placeholder="50.00" className="w-full border border-line rounded-[8px] p-4 pl-8 text-base focus:outline-none focus:ring-2 focus:ring-info/30 bg-bg tabular-nums" />
                      </div>
                      <p className="text-xs text-muted">Slogani charges ₦150. If you enter ₦50, your outlets pay ₦200 per call.</p>
                    </div>
                  )}
                  <Button onClick={handleNext} size="lg" className="w-full text-base">Configure Security Settings</Button>
                </CardContent>
              </>
            )}

            {step === 3 && (
              <>
                <CardHeader className="bg-surface pb-6 border-b border-line">
                  <Badge className="w-fit mb-4 bg-brand-tint text-brand-dark hover:bg-brand-tint">Step 3</Badge>
                  <CardTitle className="text-2xl">Security & Compliance</CardTitle>
                  <CardDescription className="text-base mt-2">Configure enforcement policies across all your staff and outlets.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="space-y-6">
                    {[
                      { title: "Enforce Multi-factor Authentication", desc: "Require OTP or Authenticator app for all staff logging into the dashboard." },
                      { title: "Strict IP Allowlisting", desc: "API calls will be rejected if they do not originate from your registered static IP addresses." },
                      { title: "Enable Webhook Signatures", desc: "Sign all outgoing asynchronous webhook payloads using HMAC-SHA256." }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-4 p-4 border border-line rounded-[10px] bg-surface hover:border-line/80 transition-colors">
                        <input type="checkbox" defaultChecked={i === 0} className="mt-1 w-5 h-5 rounded border-line text-brand focus:ring-brand accent-brand" />
                        <div>
                          <div className="font-semibold text-ink mb-1">{item.title}</div>
                          <div className="text-sm text-muted">{item.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleNext} size="lg" className="w-full text-base">Proceed to Wallet</Button>
                </CardContent>
              </>
            )}

            {step === 4 && (
              <>
                <CardHeader className="bg-surface pb-6 border-b border-line">
                  <Badge className="w-fit mb-4 bg-brand-tint text-brand-dark hover:bg-brand-tint">Step 4</Badge>
                  <CardTitle className="text-2xl">Pre-fund Wallet</CardTitle>
                  <CardDescription className="text-base mt-2">
                    {orgType === 'institution' ? "Your central institution wallet needs credit to perform verification lookups." : "Fund your agency wallet to allow your outlets to draw their allocations."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8 text-center">
                  <div className="bg-bg border border-line rounded-[16px] p-8 max-w-sm mx-auto">
                    <div className="text-sm uppercase tracking-wider text-muted font-semibold mb-2">Total amount to fund</div>
                    <div className="text-5xl font-bold tabular-nums text-ink mb-6">₦50,000</div>
                    <Button variant="outline" className="w-full bg-surface border-line">Change Amount</Button>
                  </div>
                  
                  <div className="max-w-sm mx-auto p-4 bg-info-tint/30 border border-info/20 rounded-[8px] text-sm text-info text-left flex items-start gap-3">
                    <Shield className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block mb-1">Instant Settlement</span>
                      Your wallet will be credited instantly and you can begin issuing API calls immediately.
                    </div>
                  </div>

                  <Button onClick={handleFinish} size="lg" className="w-full text-base h-14">
                    Complete Setup & Go to Dashboard
                  </Button>
                </CardContent>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
