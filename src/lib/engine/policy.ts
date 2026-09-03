import type {
  AiDecision,
  FailureReason,
  PaymentMethod,
} from "@/lib/types";
import { isBankFailure } from "./calculations";

export type DecisionInput = {
  amount: number;
  paymentMethod: PaymentMethod;
  alternativeMethod: PaymentMethod;
  failureReason: FailureReason;
  bankHealth: number;
  previousAttempts: number;
  recoveryProbability: number;
  alternativeMethodProbability: number;
  expectedNetValue: number;
  alternativeExpectedNetValue: number;
};

export type DecisionResult = {
  decision: AiDecision;
  recommendedAction: string;
};

export function determineRecoveryDecision(input: DecisionInput): DecisionResult {
  const methodLift =
    input.alternativeMethodProbability - input.recoveryProbability;

  if (
    methodLift >= 0.25 &&
    input.alternativeExpectedNetValue > input.expectedNetValue + 40 &&
    input.alternativeExpectedNetValue > 0
  ) {
    return {
      decision: "CHANGE_METHOD",
      recommendedAction: `Recommend ${input.alternativeMethod}`,
    };
  }

  if (input.expectedNetValue < 0 || input.previousAttempts >= 3) {
    return {
      decision: "DONT_RECOVER",
      recommendedAction: "Stop recovery",
    };
  }

  if (input.recoveryProbability < 0.3 && input.amount < 3000) {
    return {
      decision: "DONT_RECOVER",
      recommendedAction: "Stop recovery",
    };
  }

  if (
    input.failureReason === "Bank degradation" &&
    input.bankHealth < 0.42 &&
    input.expectedNetValue > 0 &&
    input.recoveryProbability >= 0.4
  ) {
    return {
      decision: "WAIT",
      recommendedAction: "Wait 15 minutes",
    };
  }

  if (input.expectedNetValue > 0 && input.recoveryProbability >= 0.55) {
    return {
      decision: "RECOVER_NOW",
      recommendedAction: "Retry once",
    };
  }

  if (input.expectedNetValue > 0) {
    return {
      decision: "WAIT",
      recommendedAction: isBankFailure(input.failureReason)
        ? "Wait 15 minutes"
        : "Wait for a better window",
    };
  }

  return {
    decision: "DONT_RECOVER",
    recommendedAction: "Stop recovery",
  };
}
