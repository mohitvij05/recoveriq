import { generateTransactions } from "@/lib/data/generate";
import type { AiDecision } from "@/lib/types";

const DECISION_INFO: Record<
  AiDecision,
  {
    title: string;
    description: string;
    action: string;
  }
> = {
  RECOVER_NOW: {
    title: "Recover Now",
    description:
      "Recovery is economically worthwhile and the probability of success is high.",
    action: "Retry once",
  },
  WAIT: {
    title: "Wait",
    description:
      "The payment may recover more efficiently after a temporary degradation improves.",
    action: "Wait for a better window",
  },
  CHANGE_METHOD: {
    title: "Change Method",
    description:
      "Another payment method has a materially better recovery probability.",
    action: "Recommend alternative method",
  },
  DONT_RECOVER: {
    title: "Don't Recover",
    description:
      "Recovery is not economically worthwhile or recovery guardrails have been reached.",
    action: "Stop recovery",
  },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function decisionClass(decision: AiDecision) {
  switch (decision) {
    case "RECOVER_NOW":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "WAIT":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "CHANGE_METHOD":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "DONT_RECOVER":
      return "bg-red-500/10 text-red-400 border-red-500/20";
  }
}

export default function DecisionsPage() {
  const transactions = generateTransactions();

  const counts: Record<AiDecision, number> = {
    RECOVER_NOW: 0,
    WAIT: 0,
    CHANGE_METHOD: 0,
    DONT_RECOVER: 0,
  };

  transactions.forEach((transaction) => {
    counts[transaction.aiDecision] += 1;
  });

  const demoTransactions = transactions.filter((transaction) =>
    ["TXN_10293", "TXN_10302", "TXN_10314", "TXN_10320"].includes(
      transaction.transactionId,
    ),
  );

  return (
    <main className="space-y-8 p-6 md:p-8">
      <div>
        <p className="text-sm font-medium text-blue-400">
          RECOVERIQ DECISION ENGINE
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          AI Decision Center
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          RecoverIQ does not blindly retry failed payments. It evaluates
          recovery probability, expected value, customer friction and risk
          before deciding whether recovery should happen at all.
        </p>
      </div>

      {/* Decision summary */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(Object.keys(DECISION_INFO) as AiDecision[]).map((decision) => (
          <div
            key={decision}
            className="rounded-2xl border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${decisionClass(
                  decision,
                )}`}
              >
                {DECISION_INFO[decision].title}
              </span>

              <span className="text-2xl font-semibold">
                {counts[decision]}
              </span>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              {DECISION_INFO[decision].description}
            </p>

            <div className="mt-4 border-t pt-4 text-xs">
              <span className="text-muted-foreground">Default action: </span>
              <span className="font-medium">
                {DECISION_INFO[decision].action}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Decision philosophy */}
      <section className="rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-semibold">
          Why RecoverIQ sometimes says &quot;Don&apos;t Recover&quot;
        </h2>

        <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">
          Traditional recovery systems often optimize for recovery volume.
          RecoverIQ optimizes for economically valuable recovery. A recovery
          attempt can cost money, create customer friction and increase risk.
          If the expected recovered value is lower than the cost and penalties,
          the engine stops instead of retrying.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">
              Expected Recovery Value
            </p>
            <p className="mt-2 text-lg font-semibold">
              Amount × Probability
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">
              Expected Net Value
            </p>
            <p className="mt-2 text-lg font-semibold">
              Recovery Value − Costs
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-xs text-muted-foreground">Guardrails</p>
            <p className="mt-2 text-lg font-semibold">
              Stop when recovery is not worthwhile
            </p>
          </div>
        </div>
      </section>

      {/* Demonstration transactions */}
      <section className="rounded-2xl border bg-card">
        <div className="border-b p-6">
          <h2 className="text-lg font-semibold">Decision Examples</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Real decisions generated by the deterministic RecoverIQ engine.
          </p>
        </div>

        <div className="divide-y">
          {demoTransactions.map((transaction) => (
            <div
              key={transaction.transactionId}
              className="grid gap-4 p-6 lg:grid-cols-[1.2fr_1fr_1fr_1fr]"
            >
              <div>
                <p className="font-medium">{transaction.transactionId}</p>

                <p className="mt-1 text-sm text-muted-foreground">
                  {transaction.failureReason} ·{" "}
                  {transaction.paymentMethod}
                </p>

                <p className="mt-2 text-lg font-semibold">
                  {formatCurrency(transaction.amount)}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Recovery Probability
                </p>

                <p className="mt-1 font-semibold">
                  {(transaction.recoveryProbability * 100).toFixed(1)}%
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Expected Net Value
                </p>

                <p
                  className={`mt-1 font-semibold ${
                    transaction.expectedNetValue >= 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {formatCurrency(transaction.expectedNetValue)}
                </p>
              </div>

              <div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${decisionClass(
                    transaction.aiDecision,
                  )}`}
                >
                  {DECISION_INFO[transaction.aiDecision].title}
                </span>

                <p className="mt-2 text-sm text-muted-foreground">
                  {transaction.recommendedAction}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Formula */}
      <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
          Decision principle
        </p>

        <p className="mt-3 text-xl font-semibold">
          Don&apos;t recover revenue at any cost. Recover revenue when the
          expected value justifies the intervention.
        </p>

        <p className="mt-3 text-sm text-muted-foreground">
          Current batch: {transactions.length} synthetic transactions
          analyzed by the RecoverIQ policy engine.
        </p>
      </section>
    </main>
  );
}