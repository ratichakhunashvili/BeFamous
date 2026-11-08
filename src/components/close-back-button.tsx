"use client";
// Primary "Close" button that returns to the previous screen (Figma "→ !back").
import { useRouter } from "next/navigation";
import { Button } from "./ui";

export function CloseBackButton({ label }: { label: string }) {
  const router = useRouter();
  return (
    <Button type="button" onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}>
      {label}
    </Button>
  );
}
