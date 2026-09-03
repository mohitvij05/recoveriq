import { generateTransactions } from "@/lib/data/generate";
import type { AiDecision } from "@/lib/types";

const decisionConfig: Record<
  AiDecision,
  { label: string; description: string; className: string }
> = {
  RECOVER_NOW: {
    label: "Recover Now",
    description: "High-value recovery opportunity",
    className: "text-emerald-400",
  },
  WAIT: {
    label: "Wait",
    description: "Better recovery window expected",
    className: "text-amber-400",
  },
  CHANGE_METHOD: {
    label: "Change Method",
    description: "Alternative payment method is stronger",
    className: "text-blue-400",
  },
  DONT_RECOVER: {
    label: "Don't Recover",
    description: "Recovery is not economically worthwhile",
    className: "text-red-400",
  },
};

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function RevenueAtRiskPage() {
  const transactions = generateTransactions();

  const totalAtRisk = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const recoverNow = transactions.filter(
    (transaction) => transaction.aiDecision === "RECOVER_NOW"
  );

  const waiting = transactions.filter(
    (transaction) => transaction.aiDecision === "WAIT"
  );

  const changeMethod = transactions.filter(
    (transaction) => transaction.aiDecision === "CHANGE_METHOD"
  );

  const dontRecover = transactions.filter(
    (transaction) => transaction.aiDecision === "DONT_RECOVER"
  );

  const recoverNowValue = recoverNow.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const waitingValue = waiting.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const changeMethodValue = changeMethod.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const dontRecoverValue = dontRecover.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const topTransactions = [...transactions]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 12);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Revenue at Risk
          </h1>

          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            AI ANALYZED
          </span>
        </div>

        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          RecoverIQ analyzes failed payments and decides which revenue is worth
          recovering, when to wait, when to change payment method, and when to
          stop recovery entirely.
        </p>
      </div>

      {/* Main metrics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Revenue at Risk"
          value={formatINR(totalAtRisk)}
          subtitle={`${transactions.length} transactions analyzed`}
        />

        <MetricCard
          title="Worth Recovering Now"
          value={formatINR(recoverNowValue)}
          subtitle={`${recoverNow.length} transactions`}
          accent="emerald"
        />

        <MetricCard
          title="Waiting for Better Window"
          value={formatINR(waitingValue)}
          subtitle={`${waiting.length} transactions`}
          accent="amber"
        />

        <MetricCard
          title="Deliberately Not Recovered"
          value={formatINR(dontRecoverValue)}
          subtitle={`${dontRecover.length} transactions`}
          accent="red"
        />
      </div>

      {/* Decision distribution */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Where the revenue goes</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Every transaction receives one bounded AI recovery decision.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DecisionCard
            title="Recover Now"
            count={recoverNow.length}
            value={recoverNowValue}
            description="High probability and positive expected value"
            color="emerald"
          />

          <DecisionCard
            title="Wait"
            count={waiting.length}
            value={waitingValue}
            description="Temporary conditions make immediate recovery inefficient"
            color="amber"
          />

          <DecisionCard
            title="Change Method"
            count={changeMethod.length}
            value={changeMethodValue}
            description="Another payment method has a better expected outcome"
            color="blue"
          />

          <DecisionCard
            title="Don't Recover"
            count={dontRecover.length}
            value={dontRecoverValue}
            description="Expected recovery does not justify customer friction or cost"
            color="red"
          />
        </div>
      </section>

      {/* Core AI philosophy */}
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">
              RecoverIQ principle
            </p>

            <h2 className="mt-3 text-2xl font-semibold">
              Revenue at risk ≠ revenue worth recovering
            </h2>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
              A failed payment should not automatically trigger another retry.
              RecoverIQ evaluates the probability of success, transaction
              economics, customer friction, previous attempts and risk before
              deciding what happens next.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Decision equation
            </p>

            <div className="mt-4 rounded-lg bg-white/[0.04] p-4 font-mono text-sm text-zinc-200">
              Expected Recovery Value
              <br />
              = Amount × Recovery Probability
              <br />
              <br />
              Expected Net Value
              <br />
              = Expected Recovery Value − Recovery Cost
            </div>

            <p className="mt-4 text-xs leading-5 text-zinc-500">
              If the expected value is negative, the AI can intentionally stop
              recovery instead of blindly retrying.
            </p>
          </div>
        </div>
      </section>

      {/* Transaction table */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="border-b border-white/10 p-6">
          <h2 className="text-lg font-semibold">Highest-value transactions</h2>
          <p className="mt-1 text-sm text-zinc-500">
            The largest revenue-at-risk transactions in the current synthetic
            batch.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Failure</th>
                <th className="px-6 py-4">Probability</th>
                <th className="px-6 py-4">Expected Net</th>
                <th className="px-6 py-4">AI Decision</th>
              </tr>
            </thead>

            <tbody>
              {topTransactions.map((transaction) => {
                const config = decisionConfig[transaction.aiDecision];

                return (
                  <tr
                    key={transaction.transactionId}
                    className="border-b border-white/5 transition hover:bg-white/[0.03]"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-zinc-200">
                        {transaction.transactionId}
                      </div>
                      <div className="mt-1 text-xs text-zinc-500">
                        {transaction.customerName}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium">
                      {formatINR(transaction.amount)}
                    </td>

                    <td className="px-6 py-4 text-zinc-400">
                      {transaction.failureReason}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-medium text-zinc-200">
                        {(transaction.recoveryProbability * 100).toFixed(0)}%
                      </span>
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

                    <td className="px-6 py-4">
                      <span className={`font-medium ${config.className}`}>
                        {config.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Bottom insight */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-medium text-blue-300">
              AI found {changeMethod.length} transactions where changing the
              payment method is better than retrying.
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              This prevents unnecessary retries while preserving high-intent
              revenue opportunities.
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-zinc-500">
              Alternate-method revenue
            </p>

            <p className="mt-1 text-xl font-semibold text-blue-300">
              {formatINR(changeMethodValue)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
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
  const accentClass =
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

      <p className={`mt-3 text-2xl font-semibold ${accentClass}`}>{value}</p>

      <p className="mt-2 text-xs text-zinc-600">{subtitle}</p>
    </div>
  );
}

function DecisionCard({
  title,
  count,
  value,
  description,
  color,
}: {
  title: string;
  count: number;
  value: number;
  description: string;
  color: "emerald" | "amber" | "blue" | "red";
}) {
  const colorClass =
    color === "emerald"
      ? "text-emerald-400"
      : color === "amber"
        ? "text-amber-400"
        : color === "blue"
          ? "text-blue-400"
          : "text-red-400";

  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-zinc-200">{title}</p>
          <p className="mt-2 text-xs leading-5 text-zinc-500">{description}</p>
        </div>

        <span className={`text-2xl font-semibold ${colorClass}`}>
          {count}
        </span>
      </div>

      <div className="mt-5 border-t border-white/5 pt-4">
        <p className="text-xs uppercase tracking-wider text-zinc-600">
          Revenue
        </p>

        <p className={`mt-1 text-lg font-semibold ${colorClass}`}>
          {formatINR(value)}
        </p>
      </div>
    </div>
  );
}