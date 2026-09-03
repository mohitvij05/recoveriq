import { generateTransactions } from "@/lib/data/generate";
import type { AiDecision, RecoveryStatus } from "@/lib/types";

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

const decisionLabel: Record<AiDecision, string> = {
  RECOVER_NOW: "Recover Now",
  WAIT: "Wait",
  CHANGE_METHOD: "Change Method",
  DONT_RECOVER: "Don't Recover",
};

const decisionClass: Record<AiDecision, string> = {
  RECOVER_NOW: "text-emerald-400",
  WAIT: "text-amber-400",
  CHANGE_METHOD: "text-blue-400",
  DONT_RECOVER: "text-red-400",
};

const statusClass: Record<RecoveryStatus, string> = {
  PENDING: "text-zinc-400",
  SCHEDULED: "text-amber-400",
  RECOVERED: "text-emerald-400",
  STOPPED: "text-red-400",
  FAILED: "text-red-400",
};

export default function AuditPage() {
  const transactions = generateTransactions();

  const sortedTransactions = [...transactions]
    .sort((a, b) => {
      const timeA = new Date(a.occurredAt).getTime();
      const timeB = new Date(b.occurredAt).getTime();

      return timeB - timeA;
    })
    .slice(0, 20);

  const recovered = transactions.filter(
    (transaction) => transaction.recoveryStatus === "RECOVERED"
  );

  const stopped = transactions.filter(
    (transaction) =>
      transaction.recoveryStatus === "STOPPED" ||
      transaction.aiDecision === "DONT_RECOVER"
  );

  const scheduled = transactions.filter(
    (transaction) => transaction.recoveryStatus === "SCHEDULED"
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Audit Trail
          </h1>

          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
            AUDIT READY
          </span>
        </div>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
          Every AI decision is traceable from the original payment failure to
          the recommended action, guardrail evaluation and recovery outcome.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Decision Events"
          value={transactions.length.toString()}
          subtitle="AI decisions logged"
        />

        <Metric
          title="Recovered"
          value={recovered.length.toString()}
          subtitle={formatINR(
            recovered.reduce((sum, transaction) => {
              return sum + transaction.recoveredAmount;
            }, 0)
          )}
          accent="emerald"
        />

        <Metric
          title="Scheduled"
          value={scheduled.length.toString()}
          subtitle="Waiting for better window"
          accent="amber"
        />

        <Metric
          title="Stopped"
          value={stopped.length.toString()}
          subtitle="Recovery prevented"
          accent="red"
        />
      </div>

      {/* Audit principles */}
      <section className="grid gap-4 md:grid-cols-3">
        <AuditPrinciple
          title="Explainable"
          description="Every decision has measurable inputs: probability, expected value, cost, risk and previous attempts."
          icon="01"
        />

        <AuditPrinciple
          title="Bounded"
          description="Retry limits, economic thresholds and stopping rules prevent uncontrolled recovery loops."
          icon="02"
        />

        <AuditPrinciple
          title="Human Controlled"
          description="The AI recommends an action. Human approval is required before recovery execution."
          icon="03"
        />
      </section>

      {/* Decision log */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-lg font-semibold">Decision event log</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Recent AI decisions generated from the current synthetic batch.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-600">
              <tr>
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">AI Decision</th>
                <th className="px-6 py-4">Probability</th>
                <th className="px-6 py-4">Expected Net</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {sortedTransactions.map((transaction) => (
                <tr
                  key={transaction.transactionId}
                  className="border-b border-white/5 hover:bg-white/[0.02]"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-zinc-200">
                      {transaction.transactionId}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      {transaction.customerName}
                    </p>
                  </td>

                  <td className="px-6 py-4 font-medium text-zinc-200">
                    {formatINR(transaction.amount)}
                  </td>

                  <td
                    className={`px-6 py-4 font-medium ${
                      decisionClass[transaction.aiDecision]
                    }`}
                  >
                    {decisionLabel[transaction.aiDecision]}
                  </td>

                  <td className="px-6 py-4 text-zinc-300">
                    {(transaction.recoveryProbability * 100).toFixed(0)}%
                  </td>

                  <td
                    className={`px-6 py-4 font-medium ${
                      transaction.expectedNetValue >= 0
                        ? "text-emerald-400"
                        : "text-red-400"
                    }`}
                  >
                    {formatINR(transaction.expectedNetValue)}
                  </td>

                  <td className="max-w-[220px] px-6 py-4 text-zinc-400">
                    {transaction.recommendedAction}
                  </td>

                  <td
                    className={`px-6 py-4 font-medium ${
                      statusClass[transaction.recoveryStatus]
                    }`}
                  >
                    {transaction.recoveryStatus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detailed audit example */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-blue-400">
              Example audit event
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              How a decision becomes traceable
            </h2>
          </div>

          <span className="text-xs text-zinc-600">
            {transactions[0]?.transactionId}
          </span>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-5">
          <TimelineStep
            number="01"
            title="Payment Failed"
            description={transactions[0]?.failureReason ?? "Payment failure"}
          />

          <TimelineStep
            number="02"
            title="Signals Evaluated"
            description="Amount, intent, bank, network, risk"
          />

          <TimelineStep
            number="03"
            title="AI Decision"
            description={
              transactions[0]
                ? decisionLabel[transactions[0].aiDecision]
                : "Decision generated"
            }
          />

          <TimelineStep
            number="04"
            title="Guardrails"
            description="Retry and economic policy checked"
          />

          <TimelineStep
            number="05"
            title="Audit Event"
            description="Decision and outcome recorded"
          />
        </div>
      </section>

      {/* Guardrail log */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div>
          <h2 className="text-lg font-semibold">Guardrail checks</h2>

          <p className="mt-1 text-sm text-zinc-500">
            Controls applied before an AI-recommended recovery can proceed.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Guardrail
            title="Expected Net Value"
            description="Recovery is blocked when expected value is negative."
          />

          <Guardrail
            title="Retry Limit"
            description="Repeated failures trigger an automatic stop."
          />

          <Guardrail
            title="Human Approval"
            description="AI cannot independently execute recovery."
          />

          <Guardrail
            title="Alternative Method"
            description="A materially better payment method can replace another retry."
          />
        </div>
      </section>

      {/* Strong hackathon statement */}
      <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">
          RecoverIQ safety model
        </p>

        <h2 className="mt-2 text-xl font-semibold">
          Every AI action must be explainable, bounded and auditable.
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-500">
          Instead of giving an AI agent unrestricted access to payment
          recovery, RecoverIQ creates a controlled decision layer between
          intelligence and execution.
        </p>
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
  accent?: "emerald" | "amber" | "red";
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-400"
      : accent === "amber"
        ? "text-amber-400"
        : accent === "red"
          ? "text-red-400"
          : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-zinc-500">{title}</p>

      <p className={`mt-3 text-2xl font-semibold ${color}`}>{value}</p>

      <p className="mt-2 text-xs text-zinc-600">{subtitle}</p>
    </div>
  );
}

function AuditPrinciple({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between">
        <p className="text-sm font-semibold text-zinc-200">{title}</p>

        <span className="text-xs text-zinc-700">{icon}</span>
      </div>

      <p className="mt-3 text-sm leading-6 text-zinc-500">{description}</p>
    </div>
  );
}

function TimelineStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs text-zinc-700">{number}</p>

      <p className="mt-2 text-sm font-medium text-zinc-200">{title}</p>

      <p className="mt-1 text-xs leading-5 text-zinc-600">{description}</p>
    </div>
  );
}

function Guardrail({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
      <span className="mt-0.5 text-emerald-400">✓</span>

      <div>
        <p className="text-sm font-medium text-zinc-200">{title}</p>

        <p className="mt-1 text-xs leading-5 text-zinc-600">
          {description}
        </p>
      </div>
    </div>
  );
}