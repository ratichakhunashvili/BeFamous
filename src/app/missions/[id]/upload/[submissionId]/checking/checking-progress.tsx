"use client";
// Progress bar for 42. The bar animates for at least ~2.5s; the server check runs in parallel.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { verifySubmissionAction } from "@/app/actions/missions";

export function CheckingProgress({ submissionId, cancelHref, cancelLabel }: { submissionId: string; cancelHref: string; cancelLabel: string }) {
  const router = useRouter();
  const [pct, setPct] = useState(8);
  const cancelled = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => setPct((p) => Math.min(p + 6, 90)), 150);
    const minWait = new Promise((r) => setTimeout(r, 2500));
    Promise.all([verifySubmissionAction(submissionId), minWait]).then(([res]) => {
      clearInterval(timer);
      if (cancelled.current) return;
      setPct(100);
      setTimeout(() => router.replace(res.next), 300);
    });
    return () => clearInterval(timer);
  }, [router, submissionId]);

  return (
    <>
      <div className="h-2 w-full overflow-clip rounded-full bg-elevated" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full bg-primary transition-[width] duration-150" style={{ width: `${pct}%` }} />
      </div>
      <Link
        href={cancelHref}
        onClick={() => (cancelled.current = true)}
        className="flex h-12 w-full items-center justify-center rounded-bf-12 border border-line bg-surface px-3 text-label text-white hover:opacity-90"
      >
        {cancelLabel}
      </Link>
    </>
  );
}
