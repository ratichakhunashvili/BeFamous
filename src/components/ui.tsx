// Shared building blocks that mirror the Figma components
// (Action / Primary · Secondary · Quiet, Field, list rows, app bar).
import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { BackButton } from "./back-button";
import { Logo } from "./logo";

/** Phone-width column (390px, like the Figma frames), centred on larger screens. */
export function Screen({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bf-screen relative mx-auto min-h-dvh w-full max-w-[390px] overflow-x-clip bg-bg ${className}`}>{children}</div>;
}

type BackTarget = string | "history";

/** Top app bar: optional back button + BEFAMOUS brand (links to welcome). The theme toggle was removed on purpose. */
export function AppBar({ back, backStyle = "filled", brandLabel }: { back?: BackTarget; backStyle?: "filled" | "plain"; brandLabel: string }) {
  return (
    <header className="relative z-10 h-[49px] w-full">
      {back && <BackButton href={back} filled={backStyle === "filled"} label="back" />}
      <Link href="/" className={`absolute top-[5px] flex h-[44px] w-[155px] items-center gap-[9px] ${back ? "left-[64px]" : "left-[20px]"}`}>
        <Logo size={29} priority />
        <span className="text-label text-white">{brandLabel}</span>
      </Link>
    </header>
  );
}

const variants = {
  primary: "bg-action text-white",
  secondary: "border border-line bg-surface text-white",
  quiet: "bg-elevated text-white",
} as const;

type Variant = keyof typeof variants;
const btnBase = "flex h-12 w-full items-center justify-center rounded-bf-12 px-3 text-center text-label transition-opacity hover:opacity-90 disabled:opacity-60";

export function ButtonLink({ variant = "primary", className = "", ...props }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link {...props} className={`${btnBase} ${variants[variant]} ${className}`} />;
}

export function Button({ variant = "primary", className = "", ...props }: ComponentProps<"button"> & { variant?: Variant }) {
  return <button {...props} className={`${btnBase} ${variants[variant]} ${className}`} />;
}

/** Labelled text field with an optional icon on the right (Figma "Field"). */
export function Field({
  label,
  icon,
  hint,
  error,
  hintGap = false,
  ...input
}: ComponentProps<"input"> & { label: string; icon?: string; hint?: string; error?: string; hintGap?: boolean }) {
  return (
    <label className={`flex w-full flex-col ${hintGap ? "gap-5" : "gap-2"}`}>
      <span className="text-label text-white">{label}</span>
      <span className="relative block h-12 w-full overflow-clip rounded-bf-12 border border-line bg-surface">
        <input
          {...input}
          className={`h-full w-full bg-transparent pl-[15px] text-body text-white outline-none placeholder:text-muted focus:ring-2 focus:ring-primary/60 focus:ring-inset ${icon ? "pr-11" : "pr-[15px]"} rounded-bf-12`}
        />
        {icon && <Image src={icon} alt="" width={18} height={18} className="pointer-events-none absolute right-[15px] top-[14px] size-[18px]" />}
      </span>
      {hint && <span className="text-caption text-white">{hint}</span>}
      {error && <span className="text-caption text-chart" role="alert">{error}</span>}
    </label>
  );
}

/** Card row with an icon tile and two lines of text (used on 02, 04, 31, 73). */
export function InfoRow({
  icon,
  title,
  body,
  href,
  chevron,
  layout = "start",
}: {
  icon: string;
  title: string;
  body: string;
  href?: string;
  chevron?: string;
  /** "start" = left-aligned with 4px gap (02); "centered" = centred with 20px gap (04, 31, 73);
   *  "titleCentered" = centred title, left-aligned caption (10/37 first rows) — as drawn in Figma. */
  layout?: "start" | "centered" | "titleCentered";
}) {
  const content = (
    <>
      <span className="relative size-9 shrink-0 overflow-clip rounded-bf-12 bg-elevated">
        <Image src={icon} alt="" width={20} height={20} className="absolute left-2 top-2 size-5" />
      </span>
      <span className={`flex min-w-0 flex-1 flex-col text-white ${layout === "centered" ? "gap-5 text-center" : layout === "titleCentered" ? "gap-5" : "gap-1 text-left"}`}>
        <span className={`whitespace-pre-wrap text-label ${layout === "titleCentered" ? "text-center" : ""}`}>{title}</span>
        <span className="whitespace-pre-wrap text-caption">{body}</span>
      </span>
      {chevron && <Image src={chevron} alt="" width={16} height={16} className="size-4 shrink-0" />}
    </>
  );
  const cls = "flex w-full items-center gap-3 overflow-clip rounded-bf-16 border border-line bg-surface p-3";
  return href ? (
    <Link href={href} className={`${cls} transition-colors hover:bg-elevated/60`}>
      {content}
    </Link>
  ) : (
    <div className={cls}>{content}</div>
  );
}

/**
 * Eyebrow + H2 title + body ("Page title" block). Figma mixes alignments per line, so presets are
 * listed as [eyebrow, title, body]: center = c,c,c · start = l,l,l · terms = c,l,c (31/73) · bodyStart = c,c,l (05/08/38).
 */
const titleAligns = {
  center: ["text-center", "text-center", "text-center"],
  start: ["text-left", "text-left", "text-left"],
  terms: ["text-center", "text-left", "text-center"],
  bodyStart: ["text-center", "text-center", "text-left"],
} as const;

export function PageTitle({ eyebrow, title, body, align = "center", gap = 20 }: { eyebrow: string; title: string; body: string; align?: keyof typeof titleAligns; gap?: 8 | 20 }) {
  const [e, t, b] = titleAligns[align];
  return (
    <div className={`flex w-full flex-col text-white ${gap === 8 ? "gap-2" : "gap-5"}`}>
      <p className={`whitespace-pre-wrap text-caption ${e}`}>{eyebrow}</p>
      <h1 className={`text-h2 ${t}`}>{title}</h1>
      <p className={`text-body ${b}`}>{body}</p>
    </div>
  );
}

/** Bordered surface card (Figma "Panel"). */
export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`overflow-clip rounded-bf-16 border border-line bg-surface ${className}`}>{children}</div>;
}

/** Status panel: 52px icon tile + H2 + body (39, 40, 14, 15, 16, 42). */
export function ResultPanel({ icon, title, body, centerTitle = false, centerBody = false }: { icon: string; title: string; body: string; centerTitle?: boolean; centerBody?: boolean }) {
  return (
    <Panel className="flex w-full flex-col gap-5 p-6 text-white">
      <span className="relative size-[52px] overflow-clip rounded-bf-16 bg-elevated">
        <Image src={icon} alt="" width={26} height={26} className="absolute left-[13px] top-[13px] size-[26px]" />
      </span>
      <h1 className={`text-h2 ${centerTitle ? "text-center" : ""}`}>{title}</h1>
      <p className={`text-body ${centerBody ? "text-center" : ""}`}>{body}</p>
    </Panel>
  );
}

/** Fixed bottom action bar with one primary action (09, 10, 37). */
export function StickyBar({ children }: { children: ReactNode }) {
  return (
    <div className="bf-sticky fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[390px] border-t border-line bg-surface px-5 pb-[14px] pt-[14px]">
      <div className="bf-sticky-inner">{children}</div>
    </div>
  );
}

/** Auth-style screen: purple curves behind, solid content panel starting 58px below the app bar. */
export function CurvesBackdrop({ children, clearance = 0 }: { children: ReactNode; /** extra bottom space for a sticky bar / bottom nav */ clearance?: number }) {
  return (
    <main className="bf-backdrop relative min-h-[754px] pt-[58px]" style={{ paddingBottom: clearance }}>
      {/* Fixed 390×754 like the Figma layer, so it never stretches with taller content. */}
      <div className="bf-curves pointer-events-none absolute inset-x-0 top-0 h-[754px]" aria-hidden>
        <Image src="/figma/bg-curves.png" alt="" fill sizes="390px" className="object-fill" priority />
      </div>
      <div className="bf-content relative flex flex-col items-start gap-5 bg-bg p-5">{children}</div>
    </main>
  );
}
