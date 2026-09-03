import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border bg-accent-soft px-6 py-2 text-center text-xs tracking-wide text-accent">
          Simulation Mode — No real transactions are executed.
        </div>
        <header className="flex items-center justify-between border-b border-border px-8 py-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
              RecoverIQ
            </p>
            <h1 className="mt-1 text-xl font-semibold text-foreground">
              Recovery Intelligence
            </h1>
          </div>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
            Demo decision model using synthetic data
          </span>
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
