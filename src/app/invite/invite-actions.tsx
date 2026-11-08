"use client";
// 54: the code row copies the code, "ბმულის გაზიარება" opens the phone's share sheet (or copies the link).
// Both continue to 55 once the code/link is on the clipboard or shared.
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Button } from "@/components/ui";

type Labels = { code: string; codeBody: string; share: string; shareText: string };

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function InviteActions({ code, link, copiedHref, labels, children }: { code: string; link: string; copiedHref: string; labels: Labels; children: ReactNode }) {
  const router = useRouter();

  const copyCode = async () => {
    if (await copy(code)) router.push(copiedHref);
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "BeFamous", text: labels.shareText, url: link });
        router.push(copiedHref);
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return; // user closed the share sheet
      }
    }
    if (await copy(link)) router.push(copiedHref);
  };

  return (
    <>
      <button type="button" onClick={copyCode} className="flex w-full items-center gap-3 overflow-clip rounded-bf-16 border border-line bg-surface p-3 transition-colors hover:bg-elevated/60">
        <span className="relative size-9 shrink-0 overflow-clip rounded-bf-12 bg-elevated">
          <Image src="/figma/icon-copy-20.svg" alt="" width={20} height={20} className="absolute left-2 top-2 size-5" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-5 text-center text-white">
          <span className="text-label">{labels.code}</span>
          <span className="text-caption">{labels.codeBody}</span>
        </span>
        <Image src="/figma/icon-chevron.svg" alt="" width={16} height={16} className="size-4 shrink-0" />
      </button>
      {children}
      <Button type="button" onClick={share}>
        {labels.share}
      </Button>
    </>
  );
}
