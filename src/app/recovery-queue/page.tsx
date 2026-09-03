"use client";

import { useMemo, useState } from "react";
import { generateTransactions } from "@/lib/data/generate";

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

type RecoveryState = "PENDING" | "APPROVED" | "RECOVERED" | "STOPPED";

export default function RecoveryQueuePage() {
  const transactions = useMemo(() => generateTransactions(), []);

  const initialQueue = transactions
    .filter(
      (transaction) =>
        transaction.aiDecision === "RECOVER_NOW" ||
        transaction.aiDecision === "CHANGE_METHOD"
    )
    .sort((a, b) => b.expectedNetValue - a.expectedNetValue)
    .slice(0, 12);

  const [statuses, setStatuses] = useState<Record<string, RecoveryState>>(
    {}
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const getStatus = (id: string): RecoveryState =>
    statuses[id] ?? "PENDING";

  function approveRecovery(id: string) {
    setStatuses((current) => ({
      ...current,
      [id]: "APPROVED",
    }));
    setSelectedId(id);
  }

  function simulateRecovery(id: string) {
    setStatuses((current) => ({
      ...current,
      [id]: "RECOVERED",
    }));
  }

  function stopRecovery(id: string) {
    setStatuses((current) => ({
      ...current,
      [id]: "STOPPED",
    }));
  }

  const approvedCount = Object.values(statuses).filter(
    (status) => status === "APPROVED"
  ).length;

  const recoveredCount = Object.values(statuses).filter(
    (status) => status === "RECOVERED"
  ).length;

  const stoppedCount = Object.values(statuses).filter(
    (status) => status === "STOPPED"
  ).length;

  const selectedTransaction = initialQueue.find(
    (transaction) => transaction.transactionId === selectedId
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Recovery Queue
          </h1>

          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
            HUMAN APPROVAL REQUIRED
          </span>
        </div>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
          RecoverIQ recommends recovery actions, but money movement never
          happens silently. Every recovery requires an explicit approval before
          execution.
        </p>
      </div>

      {/* Queue metrics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="AI Recovery Candidates"
          value={initialQueue.length.toString()}
          subtitle="High-value opportunities"
        />

        <Metric
          title="Awaiting Approval"
          value={initialQueue.filter(
            (transaction) => getStatus(transaction.transactionId) === "PENDING"
          ).length.toString()}
          subtitle="Human decision required"
          accent="amber"
        />

        <Metric
          title="Approved"
          value={approvedCount.toString()}
          subtitle="Ready for execution"
          accent="blue"
        />

        <Metric
          title="Recovered"
          value={recoveredCount.toString()}
          subtitle="Simulated successful recoveries"
          accent="emerald"
        />
      </div>

      {/* Safety banner */}
      <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-medium text-emerald-300">
              AI recommends. Humans approve. Guardrails execute.
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              This prevents an AI agent from independently moving customer
              money.
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-zinc-600">
              Stopped
            </p>

            <p className="text-xl font-semibold text-red-400">
              {stoppedCount}
            </p>
          </div>
        </div>
      </section>

      {/* Queue */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-lg font-semibold">Priority recovery queue</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Ranked by expected net recovery value.
          </p>
        </div>

        <div className="divide-y divide-white/5">
          {initialQueue.map((transaction) => {
            const status = getStatus(transaction.transactionId);
            const isSelected =
              selectedTransaction?.transactionId === transaction.transactionId;

            return (
              <div
                key={transaction.transactionId}
                className={`p-5 transition ${
                  isSelected ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                }`}
              >
                <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
                  {/* Transaction information */}
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-semibold text-zinc-200">
                        {transaction.transactionId}
                      </span>

                      <StatusBadge status={status} />

                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          transaction.aiDecision === "CHANGE_METHOD"
                            ? "bg-blue-500/10 text-blue-400"
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}
                      >
                        {transaction.aiDecision === "CHANGE_METHOD"
                          ? "CHANGE METHOD"
                          : "RECOVER NOW"}
                      </span>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                      <Info
                        label="Amount"
                        value={formatINR(transaction.amount)}
                      />

                      <Info
                        label="Recovery probability"
                        value={`${(
                          transaction.recoveryProbability * 100
                        ).toFixed(0)}%`}
                      />

                      <Info
                        label="Expected net"
                        value={formatINR(transaction.expectedNetValue)}
                        valueClass="text-emerald-400"
                      />

                      <Info
                        label="Payment method"
                        value={transaction.paymentMethod}
                      />

                      <Info
                        label="Failure"
                        value={transaction.failureReason}
                      />
                    </div>

                    <div className="mt-4 rounded-lg border border-white/5 bg-black/20 p-3">
                      <span className="text-xs uppercase tracking-wider text-zinc-600">
                        AI recommendation
                      </span>

                      <p className="mt-1 text-sm text-zinc-300">
                        {transaction.recommendedAction}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row gap-2 lg:flex-col lg:justify-center">
                    {status === "PENDING" && (
                      <>
                        <button
                          onClick={() =>
                            approveRecovery(transaction.transactionId)
                          }
                          className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-medium text-black transition hover:bg-emerald-400"
                        >
                          Approve Recovery
                        </button>

                        <button
                          onClick={() =>
                            stopRecovery(transaction.transactionId)
                          }
                          className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
                        >
                          Stop
                        </button>
                      </>
                    )}

                    {status === "APPROVED" && (
                      <button
                        onClick={() =>
                          simulateRecovery(transaction.transactionId)
                        }
                        className="rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-400"
                      >
                        Simulate Recovery
                      </button>
                    )}

                    {status === "RECOVERED" && (
                      <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-center text-sm font-medium text-emerald-400">
                        ✓ Payment Recovered
                      </span>
                    )}

                    {status === "STOPPED" && (
                      <span className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-center text-sm font-medium text-red-400">
                        Recovery Stopped
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Selected recovery flow */}
      {selectedTransaction && (
        <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-400">
            Recovery workflow
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            {selectedTransaction.transactionId}
          </h2>

          <div className="mt-6 grid gap-3 md:grid-cols-5">
            <FlowStep
              number="01"
              title="AI Decision"
              description="Opportunity detected"
              active
            />

            <FlowStep
              number="02"
              title="Policy Check"
              description="Guardrails verified"
              active
            />

            <FlowStep
              number="03"
              title="Human Approval"
              description={
                getStatus(selectedTransaction.transactionId) === "PENDING"
                  ? "Waiting"
                  : "Approved"
              }
              active={
                getStatus(selectedTransaction.transactionId) !== "PENDING"
              }
            />

            <FlowStep
              number="04"
              title="Recovery"
              description={
                getStatus(selectedTransaction.transactionId) === "RECOVERED"
                  ? "Successful"
                  : "Simulated"
              }
              active={
                getStatus(selectedTransaction.transactionId) === "RECOVERED"
              }
            />

            <FlowStep
              number="05"
              title="Audit Event"
              description="Action recorded"
              active={
                getStatus(selectedTransaction.transactionId) === "RECOVERED"
              }
            />
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-5">
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  Transaction
                </p>
                <p className="mt-1 font-medium text-zinc-200">
                  {selectedTransaction.transactionId}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  Recovery amount
                </p>
                <p className="mt-1 font-medium text-emerald-400">
                  {formatINR(selectedTransaction.amount)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-600">
                  Recommended action
                </p>
                <p className="mt-1 font-medium text-zinc-200">
                  {selectedTransaction.recommendedAction}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Audit explanation */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-semibold">Why this workflow matters</h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Revenue recovery should be an agentic workflow, not an
              uncontrolled retry loop. RecoverIQ separates the AI's decision
              from execution and requires explicit approval.
            </p>
          </div>

          <div>
            <h2 className="font-semibold">Stopping rules</h2>

            <ul className="mt-3 space-y-2 text-sm text-zinc-500">
              <li>• Never recover when expected net value is negative.</li>
              <li>• Stop after excessive previous attempts.</li>
              <li>• Prefer an alternate payment method when materially better.</li>
              <li>• Require human approval before recovery execution.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({
  title,
  value,
  subtitle,
  accent,
}: {
  title: string;
  value: string;
  subtitle: string;
  accent?: "amber" | "blue" | "emerald";
}) {
  const color =
    accent === "amber"
      ? "text-amber-400"
      : accent === "blue"
        ? "text-blue-400"
        : accent === "emerald"
          ? "text-emerald-400"
          : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className={`mt-3 text-2xl font-semibold ${color}`}>{value}</p>
      <p className="mt-2 text-xs text-zinc-600">{subtitle}</p>
    </div>
  );
}

function Info({
  label,
  value,
  valueClass = "text-zinc-200",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div>
      <p className="text-xs text-zinc-600">{label}</p>
      <p className={`mt-1 text-sm font-medium ${valueClass}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: RecoveryState }) {
  const config = {
    PENDING: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    APPROVED: "border-blue-500/20 bg-blue-500/10 text-blue-400",
    RECOVERED: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    STOPPED: "border-red-500/20 bg-red-500/10 text-red-400",
  };

  const labels = {
    PENDING: "Pending",
    APPROVED: "Approved",
    RECOVERED: "Recovered",
    STOPPED: "Stopped",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${config[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function FlowStep({
  number,
  title,
  description,
  active,
}: {
  number: string;
  title: string;
  description: string;
  active: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        active
          ? "border-blue-500/30 bg-blue-500/10"
          : "border-white/10 bg-black/20"
      }`}
    >
      <p className="text-xs text-zinc-600">{number}</p>

      <p
        className={`mt-2 text-sm font-medium ${
          active ? "text-blue-300" : "text-zinc-400"
        }`}
      >
        {title}
      </p>

      <p className="mt-1 text-xs text-zinc-600">{description}</p>
    </div>
  );
}