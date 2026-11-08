// Usable from client forms (no server imports).
/** Two buttons at the bottom of each step: save draft / continue. */
export function WizardButtons({ draft, next, pending }: { draft: string; next: string; pending?: boolean }) {
  const base = "flex h-12 items-center justify-center rounded-bf-12 px-3 text-label text-white transition-opacity hover:opacity-90 disabled:opacity-60";
  return (
    <div className="grid grid-cols-2 gap-2">
      <button type="submit" name="intent" value="draft" disabled={pending} className={`${base} border border-line bg-surface`}>
        {draft}
      </button>
      <button type="submit" name="intent" value="next" disabled={pending} className={`${base} bg-action`}>
        {next}
      </button>
    </div>
  );
}
