import type {
  FailureReason,
  IntentLevel,
  PaymentMethod,
  RiskLevel,
} from "@/lib/types";
import { clamp, round2 } from "./rng";

export const FAILURE_BASE_PROBABILITY: Record<FailureReason, number> = {
  "Bank timeout": 0.62,
  "Bank degradation": 0.58,
  "Insufficient funds": 0.4,
  "Network failure": 0.5,
  "Checkout abandonment": 0.28,
  "Card declined": 0.36,
  "Mandate failure": 0.42,
  "UPI decline": 0.2,
};

export function isBankFailure(reason: FailureReason): boolean {
  return (
    reason === "Bank timeout" ||
    reason === "Bank degradation" ||
    reason === "Mandate failure"
  );
}

export function levelFromScore(score: number): RiskLevel {
  if (score >= 0.66) return "High";
  if (score >= 0.33) return "Medium";
  return "Low";
}

export function intentLevelFromScore(score: number): IntentLevel {
  if (score >= 0.66) return "High";
  if (score >= 0.33) return "Medium";
  return "Low";
}

export type ProbabilityInput = {
  paymentMethod: PaymentMethod;
  failureReason: FailureReason;
  previousAttempts: number;
  customerIntent: number;
  networkQuality: number;
  bankHealth: number;
  riskScore: number;
};

export function calculateRecoveryProbability(input: ProbabilityInput): number {
  let probability = FAILURE_BASE_PROBABILITY[input.failureReason];
  probability += (input.customerIntent - 0.5) * 0.24;

  if (isBankFailure(input.failureReason)) {
    probability += (input.bankHealth - 0.5) * 0.3;
  }

  if (
    input.failureReason === "Network failure" ||
    input.failureReason === "UPI decline"
  ) {
    probability += (input.networkQuality - 0.5) * 0.28;
  }

  if (input.paymentMethod === "UPI") {
    probability += (input.networkQuality - 0.5) * 0.06;
  }

  probability -= input.previousAttempts * 0.06;
  probability -= input.riskScore * 0.1;

  return round2(clamp(probability, 0.04, 0.93));
}

const METHOD_BASE: Record<PaymentMethod, number> = {
  Card: 0.5,
  "Net Banking": 0.38,
  UPI: 0.34,
  Mandate: 0.3,
};

export function calculateAlternativeMethodProbability(
  input: ProbabilityInput,
  alternativeMethod: PaymentMethod,
): number {
  let probability = METHOD_BASE[alternativeMethod];
  probability += input.customerIntent * 0.22;
  probability += input.bankHealth * 0.18;
  probability -= input.previousAttempts * 0.04;

  if (alternativeMethod === "UPI") {
    probability += input.networkQuality * 0.1 - 0.12;
  }

  return round2(clamp(probability, 0.05, 0.92));
}

export function calculateRecoveryCost(amount: number): number {
  if (amount < 500) return 18;
  if (amount < 2000) return 22;
  return round2(28 + amount * 0.0012);
}

export function calculateFrictionCost(
  previousAttempts: number,
  customerIntent: number,
): number {
  return round2(previousAttempts * 6 + (1 - customerIntent) * 8);
}

export function calculateRiskPenalty(amount: number, riskScore: number): number {
  return round2(riskScore * amount * 0.012);
}

export function calculateExpectedRecoveryValue(
  probability: number,
  amount: number,
): number {
  return round2(probability * amount);
}

export function calculateExpectedNetValue(input: {
  expectedRecoveryValue: number;
  recoveryCost: number;
  frictionCost: number;
  riskPenalty: number;
}): number {
  return round2(
    input.expectedRecoveryValue -
      input.recoveryCost -
      input.frictionCost -
      input.riskPenalty,
  );
}
