"use client";

import { useMemo } from "react";
import Link from "next/link";
import { generateTransactions } from "@/lib/data/generate";

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function decisionLabel(decision: string) {
  switch (decision) {
    case "RECOVER_NOW":
      return "RECOVER NOW";
    case "CHANGE_METHOD":
      return "CHANGE METHOD";
    case "DONT_RECOVER":
      return "DON'T RECOVER";
    default:
      return "WAIT";
  }
}

function decisionColor(decision: string) {
  switch (decision) {
    case "RECOVER_NOW":
      return "text-emerald-400";
    case "CHANGE_METHOD":
      return "text-blue-400";
    case "DONT_RECOVER":
      return "text-red-400";
    default:
      return "text-amber-400";
  }
}

function decisionBorder(decision: string) {
  switch (decision) {
    case "RECOVER_NOW":
      return "border-emerald-500/30";
    case "CHANGE_METHOD":
      return "border-blue-500/30";
    case "DONT_RECOVER":
      return "border-red-500/30";
    default:
      return "border-amber-500/30";
  }
}

export default function DashboardPage() {
  const transactions = useMemo(() => generateTransactions(), []);

  const stats = useMemo(() => {
    const recoverNow = transactions.filter(
      (tx) => tx.aiDecision === "RECOVER_NOW"
    );

    const changeMethod = transactions.filter(
      (tx) => tx.aiDecision === "CHANGE_METHOD"
    );

    const wait = transactions.filter((tx) => tx.aiDecision === "WAIT");

    const dontRecover = transactions.filter(
      (tx) => tx.aiDecision === "DONT_RECOVER"
    );

    const recovered = transactions.reduce(
      (sum, tx) => sum + tx.recoveredAmount,
      0
    );

    const awaitingApproval = transactions.filter(
      (tx) =>
        (tx.aiDecision === "RECOVER_NOW" ||
          tx.aiDecision === "CHANGE_METHOD") &&
        tx.recoveryStatus === "PENDING"
    );

    const recoveryOpportunity = [...recoverNow, ...changeMethod]
      .sort((a, b) => b.expectedNetValue - a.expectedNetValue)
      .slice(0, 1)[0];

    return {
      recoverNow,
      changeMethod,
      wait,
      dontRecover,
      recovered,
      awaitingApproval,
      recoveryOpportunity,
    };
  }, [transactions]);

  const recentDecisions = useMemo(() => {
    return [...transactions]
      .sort(
        (a, b) =>
          new Date(b.occurredAt).getTime() -
          new Date(a.occurredAt).getTime()
      )
      .slice(0, 5);
  }, [transactions]);

  return (
    <section className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
            RECOVERIQ / COMMAND CENTER
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Good decisions recover more revenue.
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Monitor AI recovery actions, review priority transactions, and
            intervene only when the system needs human approval.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="font-medium">AI ENGINE ACTIVE</span>
          <span className="text-muted">· {transactions.length} monitored</span>
        </div>
      </div>

      {/* ATTENTION BANNER */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              NEEDS ATTENTION
            </p>

            <p className="mt-2 text-xl font-semibold">
              {stats.awaitingApproval.length} recovery actions awaiting review
            </p>

            <p className="mt-1 text-sm text-muted">
              The AI has identified transactions where recovery is economically
              justified and ready for a bounded workflow.
            </p>
          </div>

          <Link
            href="/recovery-queue"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-background"
          >
            Review Recovery Queue →
          </Link>
        </div>
      </div>

      {/* AI ACTION COUNTS */}
      <div>
        <div className="mb-3">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">
            TODAY'S AI ACTIONS
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ActionCard
            label="RECOVER NOW"
            count={stats.recoverNow.length}
            amount={stats.recoverNow.reduce((s, tx) => s + tx.amount, 0)}
            description="Positive expected value"
            color="text-emerald-400"
          />

          <ActionCard
            label="WAIT"
            count={stats.wait.length}
            amount={stats.wait.reduce((s, tx) => s + tx.amount, 0)}
            description="Temporary conditions"
            color="text-amber-400"
          />

          <ActionCard
            label="CHANGE METHOD"
            count={stats.changeMethod.length}
            amount={stats.changeMethod.reduce((s, tx) => s + tx.amount, 0)}
            description="Alternative method wins"
            color="text-blue-400"
          />

          <ActionCard
            label="DON'T RECOVER"
            count={stats.dontRecover.length}
            amount={stats.dontRecover.reduce((s, tx) => s + tx.amount, 0)}
            description="Recovery not worth the cost"
            color="text-red-400"
          />
        </div>
      </div>

      {/* PRIORITY ACTION */}
      {stats.recoveryOpportunity && (
        <div
          className={`rounded-xl border bg-surface p-6 ${decisionBorder(
            stats.recoveryOpportunity.aiDecision
          )}`}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-muted">
                ⚡ PRIORITY AI RECOMMENDATION
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold">
                  {stats.recoveryOpportunity.transactionId}
                </h2>

                <span
                  className={`text-xs font-bold ${decisionColor(
                    stats.recoveryOpportunity.aiDecision
                  )}`}
                >
                  {decisionLabel(stats.recoveryOpportunity.aiDecision)}
                </span>
              </div>

              <p className="mt-2 text-sm text-muted">
                {stats.recoveryOpportunity.customerName} ·{" "}
                {stats.recoveryOpportunity.paymentMethod} ·{" "}
                {stats.recoveryOpportunity.failureReason}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <MiniMetric
                label="Amount"
                value={money(stats.recoveryOpportunity.amount)}
              />

              <MiniMetric
                label="Probability"
                value={`${(
                  stats.recoveryOpportunity.recoveryProbability * 100
                ).toFixed(0)}%`}
              />

              <MiniMetric
                label="Expected Net"
                value={money(stats.recoveryOpportunity.expectedNetValue)}
              />
            </div>

            <Link
              href="/recovery-queue"
              className="rounded-lg bg-foreground px-5 py-3 text-center text-sm font-medium text-background hover:opacity-90"
            >
              Review Action
            </Link>
          </div>
        </div>
      )}

      {/* RECENT DECISIONS */}
      <div className="rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              DECISION FEED
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              Recent AI decisions
            </h2>
          </div>

          <Link
            href="/decisions"
            className="text-xs font-medium text-muted hover:text-foreground"
          >
            Open Decision Center →
          </Link>
        </div>

        <div className="divide-y divide-border">
          {recentDecisions.map((tx) => (
            <div
              key={tx.transactionId}
              className="grid gap-3 p-4 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto] md:items-center"
            >
              <div>
                <p className="text-sm font-medium">{tx.transactionId}</p>
                <p className="mt-1 text-xs text-muted">
                  {tx.customerName}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">Amount</p>
                <p className="mt-1 text-sm font-medium">{money(tx.amount)}</p>
              </div>

              <div>
                <p className="text-xs text-muted">Failure</p>
                <p className="mt-1 text-xs">{tx.failureReason}</p>
              </div>

              <div>
                <p className="text-xs text-muted">Expected net</p>
                <p className="mt-1 text-sm font-medium">
                  {money(tx.expectedNetValue)}
                </p>
              </div>

              <div
                className={`text-xs font-bold ${decisionColor(tx.aiDecision)}`}
              >
                {decisionLabel(tx.aiDecision)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted">
          QUICK ACTIONS
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <QuickAction
            href="/decisions"
            title="Decision Center"
            text="Understand why the AI chose an action."
          />

          <QuickAction
            href="/simulation"
            title="Simulation Lab"
            text="Test a payment and challenge the AI."
          />

          <QuickAction
            href="/audit"
            title="Audit Trail"
            text="Verify decisions, guardrails and outcomes."
          />
        </div>
      </div>

      {/* CORE PRINCIPLE */}
      <div className="rounded-xl border border-dashed border-border p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          THE RECOVERIQ PRINCIPLE
        </p>

        <p className="mt-3 max-w-4xl text-lg font-medium leading-8">
          “Don't retry a payment just because it failed.{" "}
          <span className="text-muted">
            Recover only when recovery creates more value than it costs.
          </span>
          ”
        </p>

        <div className="mt-5 flex flex-wrap gap-3 text-xs text-muted">
          <span>✓ Probability-aware</span>
          <span>✓ Cost-aware</span>
          <span>✓ Risk-aware</span>
          <span>✓ Bounded actions</span>
          <span>✓ Auditable decisions</span>
        </div>
      </div>
    </section>
  );
}

function ActionCard({
  label,
  count,
  amount,
  description,
  color,
}: {
  label: string;
  count: number;
  amount: number;
  description: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <p className={`text-xs font-bold ${color}`}>{label}</p>

        <p className="text-2xl font-semibold">{count}</p>
      </div>

      <p className="mt-4 text-lg font-semibold">{money(amount)}</p>

      <p className="mt-1 text-xs text-muted">{description}</p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function QuickAction({
  href,
  title,
  text,
}: {
  href: string;
  title: string;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-border bg-surface p-5 transition hover:border-foreground/30"
    >
      <p className="font-medium">{title} →</p>
      <p className="mt-2 text-xs leading-5 text-muted">{text}</p>
    </Link>
  );
}