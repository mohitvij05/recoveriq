import type {
  AiDecision,
  DashboardMetrics,
  RecoveryTransaction,
} from "@/lib/types";

const EMPTY_COUNTS: Record<AiDecision, number> = {
  RECOVER_NOW: 0,
  WAIT: 0,
  CHANGE_METHOD: 0,
  DONT_RECOVER: 0,
};

export function calculateMetrics(
  transactions: RecoveryTransaction[],
): DashboardMetrics {
  const decisionCounts = { ...EMPTY_COUNTS };
  let totalRevenueAtRisk = 0;
  let aiRecommendedRecovery = 0;
  let revenueRecovered = 0;
  let unnecessaryRecoveriesAvoided = 0;
  let recoveryCostAvoided = 0;
  let customerFrictionAvoided = 0;
  let probabilitySum = 0;

  const recoveredByDayMap = new Map<string, number>();

  for (const tx of transactions) {
    totalRevenueAtRisk += tx.amount;
    probabilitySum += tx.recoveryProbability;
    decisionCounts[tx.aiDecision] += 1;

    if (tx.aiDecision !== "DONT_RECOVER") {
      aiRecommendedRecovery += tx.expectedRecoveryValue;
    } else {
      unnecessaryRecoveriesAvoided += tx.amount;
      recoveryCostAvoided += tx.recoveryCost;
      customerFrictionAvoided += tx.frictionCost;
    }

    if (tx.recoveryStatus === "RECOVERED") {
      revenueRecovered += tx.recoveredAmount;
      const day = (tx.recoveredAt ?? tx.occurredAt).slice(0, 10);
      recoveredByDayMap.set(day, (recoveredByDayMap.get(day) ?? 0) + tx.recoveredAmount);
    }
  }

  const count = transactions.length || 1;
  const decisionPercents = { ...EMPTY_COUNTS };
  (Object.keys(decisionCounts) as AiDecision[]).forEach((key) => {
    decisionPercents[key] = decisionCounts[key] / count;
  });

  const recoveredByDay = [...recoveredByDayMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, recovered]) => ({ date, recovered: Math.round(recovered) }));

  const recoveryAttemptsAvoided = decisionCounts.DONT_RECOVER;
  const recoveryEfficiency =
    aiRecommendedRecovery > 0 ? revenueRecovered / aiRecommendedRecovery : 0;
  const recoveryRate =
    totalRevenueAtRisk > 0 ? revenueRecovered / totalRevenueAtRisk : 0;

  return {
    transactionCount: transactions.length,
    totalRevenueAtRisk,
    aiRecommendedRecovery,
    revenueRecovered,
    unnecessaryRecoveriesAvoided,
    recoveryCostAvoided,
    recoveryAttemptsAvoided,
    recoveryEfficiency,
    recoveryRate,
    averageRecoveryProbability: probabilitySum / count,
    dontRecoverRate: decisionPercents.DONT_RECOVER,
    customerFrictionAvoided,
    decisionCounts,
    decisionPercents,
    recoveredByDay,
  };
}
