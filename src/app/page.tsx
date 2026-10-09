"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Server, FileText, ArrowRight, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col font-sans selection:bg-brand-tint selection:text-brand-dark">
      <header className="fixed top-0 z-50 w-full border-b border-line bg-surface/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-[10px] bg-brand flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>
            </div>
            TruvoID
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted">
            <Link href="#product" className="hover:text-ink transition-colors">Platform</Link>
            <Link href="#security" className="hover:text-ink transition-colors">Isolation</Link>
            <Link href="#pricing" className="hover:text-ink transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/sign-in">
              <Button variant="ghost" className="hidden sm:inline-flex text-muted hover:text-ink">Sign in</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Start building</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-32 border-b border-line bg-surface">
          <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              className="space-y-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <Badge variant="secondary" className="mb-4 bg-bg text-muted border-line">Platform v2.0</Badge>
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-ink leading-[1.1] mb-6">
                  Multitenant Identity <br/> 
                  <span className="text-brand">Verification Infrastructure</span>
                </h1>
                <p className="text-lg text-muted max-w-[480px] leading-relaxed">
                  A robust, isolated platform for Institutions, Agencies, and their outlets. Perform NIN and BVN lookups billed safely against a prepaid wallet in a single atomic transaction.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4">
                <Link href="/auth/sign-up" className="w-full sm:w-auto">
                  <Button size="lg" className="h-12 w-full px-8 text-base group">
                    Start building 
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/auth/sign-in" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="h-12 w-full px-8 text-base bg-surface hover:bg-bg">
                    View Demo Dashboard
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
            
            {/* Live-ish Mock Visual */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto w-full max-w-lg lg:ml-auto"
            >
              <Card className="w-full shadow-soft border-line overflow-hidden bg-surface">
                <CardHeader className="border-b border-line pb-4 bg-surface">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Shield className="w-4 h-4 text-brand" /> Verification Call
                    </CardTitle>
                    <Badge variant="default" className="bg-brand-tint text-brand-dark">Verified</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0 bg-[#0B0D12] text-[#d7dde8] font-mono text-xs p-5 overflow-x-auto">
                  <motion.pre 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="whitespace-pre leading-relaxed"
                  >
                    <span className="text-[#6EE7B7]">BEGIN;</span>{"\n"}
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                      {"  "}INSERT wallet_ledger_entry  debit ₦150  → led_xyz
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
                      {"  "}INSERT verification_call    call_abc  subject_ref=a1b2
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                      <span className="text-[#6EE7B7]">COMMIT;</span>
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
                      <span className="text-muted-foreground mt-4 block">-- debit + call record are one transaction</span>
                    </motion.div>
                  </motion.pre>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Business Types */}
        <section id="product" className="py-24 bg-bg">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4 tracking-tight">Built for three kinds of business</h2>
              <p className="text-muted text-lg">A flexible multitenant architecture that adapts to your organizational structure natively.</p>
            </div>
            
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={containerVariants}
            >
              {[
                { icon: Server, color: "text-brand", title: "Platform Ops", desc: "Control plane access. Manage the organization registry, view the Slogani Revenue Ledger, and monitor the global audit log. No access to tenant data schemas." },
                { icon: FileText, color: "text-info", title: "Institutions", desc: "Outlets share the parent organization's single wallet. Centralized billing with outlet-level reporting and role-based access for staff." },
                { icon: Shield, color: "text-warn", title: "Agencies", desc: "Each outlet has its own isolated wallet. Agencies buy credit from Slogani and resell to their outlets automatically at a marked-up rate." }
              ].map((card, i) => (
                <motion.div key={i} variants={itemVariants} className="h-full">
                  <Card className="h-full border-line transition-transform duration-200 hover:-translate-y-1 hover:border-line hover:shadow-soft">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-[10px] bg-surface border border-line flex items-center justify-center mb-4">
                        <card.icon className={`w-5 h-5 ${card.color}`} />
                      </div>
                      <CardTitle className="text-lg">{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted text-sm leading-relaxed">
                      {card.desc}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Security / Isolation */}
        <section id="security" className="py-24 bg-surface border-t border-line relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
              >
                <h2 className="text-3xl font-bold mb-8 tracking-tight">Uncompromising Data Isolation</h2>
                <div className="space-y-6">
                  {[
                    { title: "Per-Organization Database Roles", desc: "Cross-tenant reads fail at the Postgres layer, not in app code. Each tenant schema rejects foreign database roles." },
                    { title: "Row-Level Security (RLS)", desc: "Inside a schema, rows are scoped strictly by app.org_id and app.outlet_id." },
                    { title: "Connection-pool Safe", desc: "We utilize SET LOCAL to guarantee identity resets at COMMIT, preventing identity leaks on reused pooled connections." }
                  ].map((feat, i) => (
                    <motion.div key={i} variants={itemVariants} className="flex gap-4 group">
                      <div className="shrink-0 w-8 h-8 rounded-full bg-brand-tint flex items-center justify-center text-brand-dark">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-ink">{feat.title}</h4>
                        <p className="text-muted text-sm mt-1 leading-relaxed">{feat.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="bg-surface p-8 rounded-[16px] border border-line shadow-soft"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-sm font-medium text-danger">ERROR: permission denied for schema org_paygate</span>
                </div>
                <div className="bg-bg rounded-[8px] p-4 font-mono text-xs text-muted mb-6">
                  Postgres (SQLSTATE 42501)
                </div>
                <div className="h-px bg-line w-full mb-6" />
                <p className="text-ink text-sm leading-relaxed">
                  Our architecture guarantees that one tenant cannot access another's data, physically enforced by the database engine itself.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-bg border-t border-line py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="w-8 h-8 rounded-[8px] bg-brand flex items-center justify-center mx-auto mb-4">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>
          </div>
          <p className="text-sm font-bold text-ink mb-2 tracking-tight">TruvoID</p>
          <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
            TruvoID is an independent identity verification platform. It is explicitly NOT NIMC or a government body.
          </p>
        </div>
      </footer>
    </div>
  )
}
