export const PAYMENT_METHODS = [
  "UPI",
  "Card",
  "Net Banking",
  "Mandate",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const FAILURE_REASONS = [
  "Bank timeout",
  "Bank degradation",
  "Insufficient funds",
  "Network failure",
  "Checkout abandonment",
  "Card declined",
  "Mandate failure",
  "UPI decline",
] as const;

export type FailureReason = (typeof FAILURE_REASONS)[number];

export const AI_DECISIONS = [
  "RECOVER_NOW",
  "WAIT",
  "CHANGE_METHOD",
  "DONT_RECOVER",
] as const;

export type AiDecision = (typeof AI_DECISIONS)[number];

export const RECOVERY_STATUSES = [
  "PENDING",
  "SCHEDULED",
  "RECOVERED",
  "STOPPED",
  "FAILED",
] as const;

export type RecoveryStatus = (typeof RECOVERY_STATUSES)[number];

export type RiskLevel = "Low" | "Medium" | "High";
export type IntentLevel = "Low" | "Medium" | "High";

export type TransactionFeatures = {
  transactionId: string;
  customerId: number;
  customerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  alternativeMethod: PaymentMethod;
  bank: string;
  failureReason: FailureReason;
  previousAttempts: number;
  customerIntent: number;
  networkQuality: number;
  bankHealth: number;
  riskScore: number;
  occurredAt: string;
};

export type RecoveryTransaction = TransactionFeatures & {
  recoveryCost: number;
  frictionCost: number;
  riskPenalty: number;
  recoveryProbability: number;
  alternativeMethodProbability: number;
  expectedRecoveryValue: number;
  expectedNetValue: number;
  alternativeExpectedNetValue: number;
  riskLevel: RiskLevel;
  intentLevel: IntentLevel;
  aiDecision: AiDecision;
  recommendedAction: string;
  recoveryStatus: RecoveryStatus;
  recoveredAmount: number;
  recoveredAt: string | null;
};

export type DashboardMetrics = {
  transactionCount: number;
  totalRevenueAtRisk: number;
  aiRecommendedRecovery: number;
  revenueRecovered: number;
  unnecessaryRecoveriesAvoided: number;
  recoveryCostAvoided: number;
  recoveryAttemptsAvoided: number;
  recoveryEfficiency: number;
  recoveryRate: number;
  averageRecoveryProbability: number;
  dontRecoverRate: number;
  customerFrictionAvoided: number;
  decisionCounts: Record<AiDecision, number>;
  decisionPercents: Record<AiDecision, number>;
  recoveredByDay: { date: string; recovered: number }[];
};
