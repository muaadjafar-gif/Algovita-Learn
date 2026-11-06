"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { formatINR } from "@/lib/utils";

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open(): void;
  on(event: string, cb: (res: { error: { description: string } }) => void): void;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.getElementById("razorpay-checkout-js");
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

interface Props {
  course: { _id: string; slug: string; title: string; price: number };
  className?: string;
}

export default function EnrollButton({ course, className = "" }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [enrolled, setEnrolled] = useState(false);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isDemo = course._id.startsWith("demo-");

  useEffect(() => {
    if (!user) {
      setEnrolled(false);
      return;
    }
    let cancelled = false;
    setChecking(true);
    fetch("/api/enrollments", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const list = (d.enrollments ?? []) as Array<{ course: { _id: string } }>;
        setEnrolled(list.some((e) => e.course._id === course._id));
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setChecking(false));
    return () => {
      cancelled = true;
    };
  }, [user, course._id]);

  async function handleEnroll() {
    setError("");
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`);
      return;
    }
    setBusy(true);
    try {
      if (course.price === 0) {
        const res = await fetch("/api/enrollments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId: course._id }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not enroll");
        router.push(`/dashboard/learn/${course.slug}`);
        return;
      }

      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course._id }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error ?? "Could not start payment");

      const ready = await loadRazorpay();
      if (!ready || !window.Razorpay) throw new Error("Could not load the payment window. Check your connection and try again.");

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "Algovita Learn",
        description: course.title,
        order_id: order.orderId,
        prefill: { name: user.name, email: user.email },
        theme: { color: "#862fe7" },
        modal: { ondismiss: () => setBusy(false) },
        handler: async (response: RazorpayResponse) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verified = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verified.error ?? "Verification failed");
            router.push(`/dashboard/learn/${course.slug}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Payment verification failed");
            setBusy(false);
          }
        },
      });
      rzp.on("payment.failed", (res) => {
        setError(res.error?.description ?? "Payment failed. Please try again.");
        setBusy(false);
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  if (enrolled) {
    return (
      <Link href={`/dashboard/learn/${course.slug}`} className={`btn btn-dark btn-block ${className}`}>
        Continue learning
      </Link>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleEnroll}
        disabled={busy || loading || checking || isDemo}
        className="btn btn-primary btn-block"
      >
        {busy ? "Please wait..." : course.price === 0 ? "Enroll for free" : `Enroll now - ${formatINR(course.price)}`}
      </button>
      {isDemo && (
        <p className="mt-3 text-center text-xs text-muted">Demo catalog: connect MongoDB and run the seed to enable enrollment.</p>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-btn bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
