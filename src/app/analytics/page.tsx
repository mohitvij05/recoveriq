import { generateTransactions } from "@/lib/data/generate";
import type { AiDecision } from "@/lib/types";

function formatINR(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

const decisionConfig: Record<
  AiDecision,
  {
    label: string;
    description: string;
    className: string;
  }
> = {
  RECOVER_NOW: {
    label: "Recover Now",
    description: "Immediate recovery is economically justified",
    className: "text-emerald-400",
  },
  WAIT: {
    label: "Wait",
    description: "Recovery should happen in a better window",
    className: "text-amber-400",
  },
  CHANGE_METHOD: {
    label: "Change Method",
    description: "An alternative payment method performs better",
    className: "text-blue-400",
  },
  DONT_RECOVER: {
    label: "Don't Recover",
    description: "Recovery cost/friction outweighs expected value",
    className: "text-red-400",
  },
};

export default function AnalyticsPage() {
  const transactions = generateTransactions();

  const totalRevenueAtRisk = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  const revenueRecovered = transactions.reduce(
    (sum, transaction) => sum + transaction.recoveredAmount,
    0
  );

  const recoverableRevenue = transactions
    .filter((transaction) => transaction.aiDecision === "RECOVER_NOW")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const alternateMethodRevenue = transactions
    .filter((transaction) => transaction.aiDecision === "CHANGE_METHOD")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const waitingRevenue = transactions
    .filter((transaction) => transaction.aiDecision === "WAIT")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const deliberatelyUnrecovered = transactions
    .filter((transaction) => transaction.aiDecision === "DONT_RECOVER")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const avoidedCost = transactions
    .filter((transaction) => transaction.aiDecision === "DONT_RECOVER")
    .reduce((sum, transaction) => {
      return (
        sum +
        transaction.recoveryCost +
        transaction.frictionCost +
        transaction.riskPenalty
      );
    }, 0);

  const avoidedAttempts = transactions
    .filter((transaction) => transaction.aiDecision === "DONT_RECOVER")
    .reduce((sum, transaction) => {
      return sum + Math.max(1, 3 - transaction.previousAttempts);
    }, 0);

  const averageRecoveryProbability =
    transactions.length > 0
      ? transactions.reduce(
          (sum, transaction) => sum + transaction.recoveryProbability,
          0
        ) / transactions.length
      : 0;

  const recoveryEfficiency =
    totalRevenueAtRisk > 0
      ? ((revenueRecovered + avoidedCost) / totalRevenueAtRisk) * 100
      : 0;

  const recoveryRate =
    recoverableRevenue > 0
      ? (revenueRecovered / recoverableRevenue) * 100
      : 0;

  const decisionCounts: Record<AiDecision, number> = {
    RECOVER_NOW: transactions.filter(
      (transaction) => transaction.aiDecision === "RECOVER_NOW"
    ).length,
    WAIT: transactions.filter(
      (transaction) => transaction.aiDecision === "WAIT"
    ).length,
    CHANGE_METHOD: transactions.filter(
      (transaction) => transaction.aiDecision === "CHANGE_METHOD"
    ).length,
    DONT_RECOVER: transactions.filter(
      (transaction) => transaction.aiDecision === "DONT_RECOVER"
    ).length,
  };

  const maxDecisionCount = Math.max(...Object.values(decisionCounts), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Recovery Analytics
          </h1>

          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
            BATCH ANALYSIS
          </span>
        </div>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
          Measured outcomes from the synthetic transaction batch. RecoverIQ
          tracks not only money recovered, but also recovery attempts and
          customer friction deliberately avoided.
        </p>
      </div>

      {/* Primary metrics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Revenue at Risk"
          value={formatINR(totalRevenueAtRisk)}
          subtitle={`${transactions.length} transactions`}
        />

        <Metric
          title="Revenue Recovered"
          value={formatINR(revenueRecovered)}
          subtitle={`${recoveryRate.toFixed(1)}% of recoverable revenue`}
          accent="emerald"
        />

        <Metric
          title="Recovery Efficiency"
          value={`${recoveryEfficiency.toFixed(1)}%`}
          subtitle="Recovery + avoided waste"
          accent="blue"
        />

        <Metric
          title="Cost Avoided"
          value={formatINR(avoidedCost)}
          subtitle={`${avoidedAttempts} unnecessary attempts avoided`}
          accent="amber"
        />
      </div>

      {/* Money outcome */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">
            Money outcome
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            What happened to the revenue at risk?
          </h2>
        </div>

        <div className="mt-6 space-y-5">
          <RevenueRow
            label="Recovered"
            value={revenueRecovered}
            total={totalRevenueAtRisk}
            className="bg-emerald-500"
          />

          <RevenueRow
            label="Recoverable now"
            value={recoverableRevenue}
            total={totalRevenueAtRisk}
            className="bg-blue-500"
          />

          <RevenueRow
            label="Alternative payment method"
            value={alternateMethodRevenue}
            total={totalRevenueAtRisk}
            className="bg-indigo-500"
          />

          <RevenueRow
            label="Waiting"
            value={waitingRevenue}
            total={totalRevenueAtRisk}
            className="bg-amber-500"
          />

          <RevenueRow
            label="Intentionally not recovered"
            value={deliberatelyUnrecovered}
            total={totalRevenueAtRisk}
            className="bg-red-500"
          />
        </div>
      </section>

      {/* Decision distribution */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-blue-400">
            AI decision distribution
          </p>

          <h2 className="mt-2 text-xl font-semibold">
            One batch, four different strategies
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            The agent does not blindly retry every failed payment.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {(Object.keys(decisionCounts) as AiDecision[]).map((decision) => {
            const count = decisionCounts[decision];
            const percentage = (count / transactions.length) * 100;
            const config = decisionConfig[decision];

            return (
              <div key={decision}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`font-medium ${config.className}`}>
                      {config.label}
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      {config.description}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-zinc-200">{count}</p>
                    <p className="text-xs text-zinc-600">
                      {percentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-white/30 transition-all"
                    style={{
                      width: `${(count / maxDecisionCount) * 100}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AI economics */}
      <section className="grid gap-4 md:grid-cols-3">
        <InsightCard
          title="Average recovery probability"
          value={`${(averageRecoveryProbability * 100).toFixed(1)}%`}
          description="Across every transaction evaluated by the decision engine."
          accent="emerald"
        />

        <InsightCard
          title="Revenue intentionally left"
          value={formatINR(deliberatelyUnrecovered)}
          description="Low-value or uneconomic recovery opportunities that the AI chose not to pursue."
          accent="red"
        />

        <InsightCard
          title="Alternate-method opportunity"
          value={formatINR(alternateMethodRevenue)}
          description="Revenue where changing the payment method is better than repeating the failed method."
          accent="blue"
        />
      </section>

      {/* Key hackathon metric */}
      <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-400">
              The RecoverIQ difference
            </p>

            <h2 className="mt-2 text-2xl font-semibold">
              We measure money recovered — and money we chose not to waste.
            </h2>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-500">
              Traditional recovery systems optimize for retry volume. RecoverIQ
              optimizes for expected economic value by considering recovery
              probability, cost, customer friction and risk before taking
              action.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-black/20 px-6 py-5 text-center">
            <p className="text-xs uppercase tracking-wider text-zinc-600">
              Avoided recovery cost
            </p>

            <p className="mt-2 text-3xl font-semibold text-emerald-400">
              {formatINR(avoidedCost)}
            </p>
          </div>
        </div>
      </section>

      {/* Dataset integrity */}
      <section className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-medium text-zinc-300">
              Synthetic batch integrity
            </p>

            <p className="mt-1 text-sm text-zinc-600">
              All metrics on this page are calculated from the same deterministic
              transaction dataset used by the decision engine.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400">
            {transactions.length} records analyzed
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
  accent?: "emerald" | "amber" | "blue";
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-400"
      : accent === "amber"
        ? "text-amber-400"
        : accent === "blue"
          ? "text-blue-400"
          : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-zinc-500">{title}</p>

      <p className={`mt-3 text-2xl font-semibold ${color}`}>{value}</p>

      <p className="mt-2 text-xs text-zinc-600">{subtitle}</p>
    </div>
  );
}

function RevenueRow({
  label,
  value,
  total,
  className,
}: {
  label: string;
  value: number;
  total: number;
  className: string;
}) {
  const percentage = total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-zinc-400">{label}</span>

        <span className="text-sm font-medium text-zinc-200">
          {formatINR(value)}
          <span className="ml-2 text-xs text-zinc-600">
            ({percentage.toFixed(1)}%)
          </span>
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${className}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function InsightCard({
  title,
  value,
  description,
  accent,
}: {
  title: string;
  value: string;
  description: string;
  accent: "emerald" | "red" | "blue";
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-400"
      : accent === "red"
        ? "text-red-400"
        : "text-blue-400";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm text-zinc-500">{title}</p>

      <p className={`mt-3 text-2xl font-semibold ${color}`}>{value}</p>

      <p className="mt-3 text-sm leading-6 text-zinc-600">{description}</p>
    </div>
  );
}