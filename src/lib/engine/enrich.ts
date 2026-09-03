import type {
  PaymentMethod,
  RecoveryStatus,
  RecoveryTransaction,
  TransactionFeatures,
} from "@/lib/types";
import {
  calculateAlternativeMethodProbability,
  calculateExpectedNetValue,
  calculateExpectedRecoveryValue,
  calculateFrictionCost,
  calculateRecoveryCost,
  calculateRecoveryProbability,
  calculateRiskPenalty,
  intentLevelFromScore,
  levelFromScore,
} from "./calculations";
import { determineRecoveryDecision } from "./policy";
import { pick, type Rng, round2 } from "./rng";

const OTHER_METHODS: Record<PaymentMethod, PaymentMethod[]> = {
  UPI: ["Card", "Net Banking"],
  Card: ["UPI", "Net Banking"],
  "Net Banking": ["Card", "UPI"],
  Mandate: ["Card", "UPI"],
};

export function chooseAlternativeMethod(
  method: PaymentMethod,
  rng?: Rng,
): PaymentMethod {
  const options = OTHER_METHODS[method];
  if (!rng) return options[0]!;
  return pick(rng, options);
}

export function enrichTransaction(
  features: TransactionFeatures,
  rng: Rng,
): RecoveryTransaction {
  const recoveryProbability = calculateRecoveryProbability(features);
  const alternativeMethodProbability = calculateAlternativeMethodProbability(
    features,
    features.alternativeMethod,
  );
  const recoveryCost = calculateRecoveryCost(features.amount);
  const frictionCost = calculateFrictionCost(
    features.previousAttempts,
    features.customerIntent,
  );
  const riskPenalty = calculateRiskPenalty(features.amount, features.riskScore);
  const expectedRecoveryValue = calculateExpectedRecoveryValue(
    recoveryProbability,
    features.amount,
  );
  const expectedNetValue = calculateExpectedNetValue({
    expectedRecoveryValue,
    recoveryCost,
    frictionCost,
    riskPenalty,
  });
  const alternativeExpectedRecoveryValue = calculateExpectedRecoveryValue(
    alternativeMethodProbability,
    features.amount,
  );
  const alternativeExpectedNetValue = calculateExpectedNetValue({
    expectedRecoveryValue: alternativeExpectedRecoveryValue,
    recoveryCost,
    frictionCost,
    riskPenalty,
  });

  const { decision, recommendedAction } = determineRecoveryDecision({
    amount: features.amount,
    paymentMethod: features.paymentMethod,
    alternativeMethod: features.alternativeMethod,
    failureReason: features.failureReason,
    bankHealth: features.bankHealth,
    previousAttempts: features.previousAttempts,
    recoveryProbability,
    alternativeMethodProbability,
    expectedNetValue,
    alternativeExpectedNetValue,
  });

  const { recoveryStatus, recoveredAmount, recoveredAt } = simulateOutcome(
    {
      decision,
      recoveryProbability,
      alternativeMethodProbability,
      amount: features.amount,
      occurredAt: features.occurredAt,
    },
    rng,
  );

  return {
    ...features,
    customerIntent: round2(features.customerIntent),
    networkQuality: round2(features.networkQuality),
    bankHealth: round2(features.bankHealth),
    riskScore: round2(features.riskScore),
    recoveryCost,
    frictionCost,
    riskPenalty,
    recoveryProbability,
    alternativeMethodProbability,
    expectedRecoveryValue,
    expectedNetValue,
    alternativeExpectedNetValue,
    riskLevel: levelFromScore(features.riskScore),
    intentLevel: intentLevelFromScore(features.customerIntent),
    aiDecision: decision,
    recommendedAction,
    recoveryStatus,
    recoveredAmount,
    recoveredAt,
  };
}

function simulateOutcome(
  input: {
    decision: RecoveryTransaction["aiDecision"];
    recoveryProbability: number;
    alternativeMethodProbability: number;
    amount: number;
    occurredAt: string;
  },
  rng: Rng,
): {
  recoveryStatus: RecoveryStatus;
  recoveredAmount: number;
  recoveredAt: string | null;
} {
  if (input.decision === "DONT_RECOVER") {
    return { recoveryStatus: "STOPPED", recoveredAmount: 0, recoveredAt: null };
  }

  if (input.decision === "WAIT") {
    return { recoveryStatus: "SCHEDULED", recoveredAmount: 0, recoveredAt: null };
  }

  const successChance =
    input.decision === "CHANGE_METHOD"
      ? input.alternativeMethodProbability * 0.82
      : input.recoveryProbability * 0.84;

  if (rng() < successChance) {
    const recoveredAt = new Date(
      new Date(input.occurredAt).getTime() + Math.floor(rng() * 36) * 3600000,
    ).toISOString();
    return {
      recoveryStatus: "RECOVERED",
      recoveredAmount: input.amount,
      recoveredAt,
    };
  }

  return {
    recoveryStatus: input.decision === "RECOVER_NOW" ? "FAILED" : "PENDING",
    recoveredAmount: 0,
    recoveredAt: null,
  };
}
