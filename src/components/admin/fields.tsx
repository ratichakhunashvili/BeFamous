// Form controls in the Figma "Field" style (label + 48px box, radius 12). Client-safe.
import type { ComponentProps } from "react";

const box = "w-full rounded-bf-12 border border-line bg-surface px-[15px] text-body text-text outline-none placeholder:text-muted focus:ring-2 focus:ring-inset focus:ring-primary/60";

function Wrap({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-2">
      <span className="text-label text-text">{label}</span>
      {children}
      {hint && !error && <span className="text-caption text-muted">{hint}</span>}
      {error && (
        <span role="alert" className="text-caption text-chart">
          {error}
        </span>
      )}
    </label>
  );
}

export function TextField({ label, hint, error, ...input }: ComponentProps<"input"> & { label: string; hint?: string; error?: string }) {
  return (
    <Wrap label={label} hint={hint} error={error}>
      <input {...input} className={`${box} h-12`} aria-invalid={error ? true : undefined} />
    </Wrap>
  );
}

export function TextArea({ label, hint, error, ...input }: ComponentProps<"textarea"> & { label: string; hint?: string; error?: string }) {
  return (
    <Wrap label={label} hint={hint} error={error}>
      <textarea rows={2} {...input} className={`${box} min-h-12 resize-y py-3`} aria-invalid={error ? true : undefined} />
    </Wrap>
  );
}

export function SelectField({ label, hint, error, options, ...select }: ComponentProps<"select"> & { label: string; hint?: string; error?: string; options: { value: string; label: string }[] }) {
  return (
    <Wrap label={label} hint={hint} error={error}>
      <select {...select} className={`${box} h-12`}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Wrap>
  );
}

export function CheckField({ label, ...input }: ComponentProps<"input"> & { label: string }) {
  return (
    <label className="flex h-12 items-center gap-3 rounded-bf-12 border border-line bg-surface px-[15px] text-body text-text">
      <input type="checkbox" {...input} className="size-4 accent-[#ad91ff]" />
      {label}
    </label>
  );
}
