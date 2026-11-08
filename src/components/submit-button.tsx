"use client";
// Form submit button that dims itself while the server action runs (prevents double taps).
import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./ui";

export function SubmitButton(props: ComponentProps<typeof Button>) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending || props.disabled} aria-busy={pending} {...props} />;
}
