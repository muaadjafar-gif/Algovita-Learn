import type { Metadata } from "next";
import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[60dvh]" />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
