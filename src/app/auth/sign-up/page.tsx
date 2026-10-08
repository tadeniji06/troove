"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Building2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const signUpSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  accountType: z.enum(["institution", "agency"]),
});

export default function SignUpPage() {
  const router = useRouter();
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      accountType: "institution",
    }
  });

  const selectedType = watch("accountType");

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    await new Promise(r => setTimeout(r, 600));
    router.push("/onboarding");
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink mb-2">Create an account</h1>
        <p className="text-muted text-sm">Join TruvoID to verify identities securely.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-ink">Account Type</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className={cn(
                "p-4 border rounded-[12px] text-left transition-all",
                selectedType === "institution" ? "border-brand bg-brand-tint/30 ring-1 ring-brand" : "border-line bg-surface hover:bg-bg"
              )}
              onClick={() => setValue("accountType", "institution")}
            >
              <Building2 className={cn("w-5 h-5 mb-2", selectedType === "institution" ? "text-brand" : "text-muted")} />
              <div className="font-semibold text-sm">Institution</div>
              <div className="text-xs text-muted mt-1">Shared wallet</div>
            </button>
            <button
              type="button"
              className={cn(
                "p-4 border rounded-[12px] text-left transition-all",
                selectedType === "agency" ? "border-brand bg-brand-tint/30 ring-1 ring-brand" : "border-line bg-surface hover:bg-bg"
              )}
              onClick={() => setValue("accountType", "agency")}
            >
              <Shield className={cn("w-5 h-5 mb-2", selectedType === "agency" ? "text-brand" : "text-muted")} />
              <div className="font-semibold text-sm">Agency</div>
              <div className="text-xs text-muted mt-1">Reseller markup</div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">First name</label>
            <Input {...register("firstName")} />
            {errors.firstName && <p className="text-danger text-xs mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Last name</label>
            <Input {...register("lastName")} />
            {errors.lastName && <p className="text-danger text-xs mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Work Email</label>
          <Input {...register("email")} type="email" placeholder="you@company.com" />
          {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
          <Input {...register("password")} type="password" />
          {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
          {isSubmitting ? "Creating account..." : "Continue to onboarding"}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/auth/sign-in" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
