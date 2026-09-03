import type { AiDecision, RecoveryTransaction, TransactionFeatures } from "@/lib/types";
import {
  chooseAlternativeMethod,
  enrichTransaction,
} from "@/lib/engine/enrich";
import { createRng, pick, randFloat, randInt, type Rng } from "@/lib/engine/rng";

const BANKS = [
  "HDFC Bank",
  "ICICI Bank",
  "SBI",
  "Axis Bank",
  "Kotak Mahindra",
  "Yes Bank",
  "PNB",
] as const;

type Archetype =
  | "recover_now"
  | "wait"
  | "change_method"
  | "dont_recover_low"
  | "dont_recover_repeat"
  | "network";

const ARCHETYPE_PLAN: { kind: Archetype; count: number }[] = [
  { kind: "recover_now", count: 28 },
  { kind: "wait", count: 20 },
  { kind: "change_method", count: 16 },
  { kind: "dont_recover_low", count: 22 },
  { kind: "dont_recover_repeat", count: 9 },
  { kind: "network", count: 8 },
];

const DEMO_CASES: TransactionFeatures[] = [
  {
    transactionId: "TXN_10293",
    customerId: 293,
    customerName: "Customer #293",
    amount: 8499,
    paymentMethod: "UPI",
    alternativeMethod: "Card",
    bank: "HDFC Bank",
    failureReason: "Bank timeout",
    previousAttempts: 0,
    customerIntent: 0.85,
    networkQuality: 0.78,
    bankHealth: 0.8,
    riskScore: 0.12,
    occurredAt: "2026-08-28T10:14:00.000Z",
  },
  {
    transactionId: "TXN_10302",
    customerId: 302,
    customerName: "Customer #302",
    amount: 149,
    paymentMethod: "UPI",
    alternativeMethod: "Card",
    bank: "Yes Bank",
    failureReason: "Insufficient funds",
    previousAttempts: 3,
    customerIntent: 0.25,
    networkQuality: 0.55,
    bankHealth: 0.48,
    riskScore: 0.7,
    occurredAt: "2026-08-29T06:22:00.000Z",
  },
  {
    transactionId: "TXN_10314",
    customerId: 314,
    customerName: "Customer #314",
    amount: 4999,
    paymentMethod: "UPI",
    alternativeMethod: "Net Banking",
    bank: "ICICI Bank",
    failureReason: "Bank degradation",
    previousAttempts: 0,
    customerIntent: 0.72,
    networkQuality: 0.7,
    bankHealth: 0.32,
    riskScore: 0.22,
    occurredAt: "2026-08-30T11:40:00.000Z",
  },
  {
    transactionId: "TXN_10320",
    customerId: 320,
    customerName: "Customer #320",
    amount: 6999,
    paymentMethod: "UPI",
    alternativeMethod: "Card",
    bank: "Axis Bank",
    failureReason: "UPI decline",
    previousAttempts: 1,
    customerIntent: 0.88,
    networkQuality: 0.22,
    bankHealth: 0.72,
    riskScore: 0.2,
    occurredAt: "2026-08-31T08:05:00.000Z",
  },
  {
    transactionId: "TXN_10331",
    customerId: 331,
    customerName: "Customer #331",
    amount: 2199,
    paymentMethod: "Card",
    alternativeMethod: "Net Banking",
    bank: "PNB",
    failureReason: "Card declined",
    previousAttempts: 4,
    customerIntent: 0.18,
    networkQuality: 0.4,
    bankHealth: 0.3,
    riskScore: 0.88,
    occurredAt: "2026-09-01T15:18:00.000Z",
  },
];

export function generateTransactions(seed = 42): RecoveryTransaction[] {
  const rng = createRng(seed);
  const demoRng = createRng(seed + 7);
  const transactions = DEMO_CASES.map((features) =>
    enrichTransaction(features, demoRng),
  );

  let nextId = 11001;
  for (const { kind, count } of ARCHETYPE_PLAN) {
    for (let i = 0; i < count; i += 1) {
      const desired = desiredDecision(kind);
      transactions.push(
        generateMatchingCase(rng, kind, desired, nextId),
      );
      nextId += 1;
    }
  }

  return transactions.sort((a, b) => b.amount - a.amount);
}

function desiredDecision(kind: Archetype): AiDecision {
  switch (kind) {
    case "recover_now":
    case "network":
      return "RECOVER_NOW";
    case "wait":
      return "WAIT";
    case "change_method":
      return "CHANGE_METHOD";
    case "dont_recover_low":
    case "dont_recover_repeat":
      return "DONT_RECOVER";
  }
}

function generateMatchingCase(
  rng: Rng,
  kind: Archetype,
  desired: AiDecision,
  id: number,
): RecoveryTransaction {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const features = makeFeatures(rng, kind, id);
    const tx = enrichTransaction(features, rng);
    if (tx.aiDecision === desired) return tx;
  }
  return enrichTransaction(makeFeatures(rng, kind, id), rng);
}

function makeFeatures(
  rng: Rng,
  kind: Archetype,
  id: number,
): TransactionFeatures {
  const occurredAt = randomOccurredAt(rng);
  const customerId = 400 + (id % 500);
  const base = {
    transactionId: `TXN_${id}`,
    customerId,
    customerName: `Customer #${customerId}`,
    bank: pick(rng, BANKS),
    occurredAt,
  };

  switch (kind) {
    case "recover_now":
      return {
        ...base,
        amount: randInt(rng, 4500, 24999),
        paymentMethod: pick(rng, ["UPI", "Card"] as const),
        alternativeMethod: "Net Banking",
        failureReason: "Bank timeout",
        previousAttempts: randInt(rng, 0, 1),
        customerIntent: randFloat(rng, 0.72, 0.94),
        networkQuality: randFloat(rng, 0.65, 0.92),
        bankHealth: randFloat(rng, 0.68, 0.92),
        riskScore: randFloat(rng, 0.08, 0.28),
      };
    case "wait":
      return {
        ...base,
        amount: randInt(rng, 2800, 12999),
        paymentMethod: pick(rng, ["UPI", "Net Banking"] as const),
        alternativeMethod: "Card",
        failureReason: "Bank degradation",
        previousAttempts: randInt(rng, 0, 1),
        customerIntent: randFloat(rng, 0.58, 0.82),
        networkQuality: randFloat(rng, 0.55, 0.85),
        bankHealth: randFloat(rng, 0.18, 0.38),
        riskScore: randFloat(rng, 0.16, 0.34),
      };
    case "change_method":
      return {
        ...base,
        amount: randInt(rng, 3500, 15999),
        paymentMethod: "UPI",
        alternativeMethod: "Card",
        failureReason: "UPI decline",
        previousAttempts: randInt(rng, 0, 1),
        customerIntent: randFloat(rng, 0.74, 0.94),
        networkQuality: randFloat(rng, 0.12, 0.32),
        bankHealth: randFloat(rng, 0.62, 0.88),
        riskScore: randFloat(rng, 0.12, 0.3),
      };
    case "dont_recover_low": {
      const paymentMethod = pick(rng, ["UPI", "Card"] as const);
      return {
        ...base,
        amount: randInt(rng, 49, 399),
        paymentMethod,
        alternativeMethod: chooseAlternativeMethod(paymentMethod, rng),
        failureReason: pick(rng, [
          "Insufficient funds",
          "Checkout abandonment",
        ] as const),
        previousAttempts: randInt(rng, 1, 3),
        customerIntent: randFloat(rng, 0.08, 0.32),
        networkQuality: randFloat(rng, 0.3, 0.65),
        bankHealth: randFloat(rng, 0.25, 0.55),
        riskScore: randFloat(rng, 0.55, 0.9),
      };
    }
    case "dont_recover_repeat":
      return {
        ...base,
        amount: randInt(rng, 799, 4599),
        paymentMethod: pick(rng, ["Card", "Mandate"] as const),
        alternativeMethod: "UPI",
        failureReason: pick(rng, ["Card declined", "Mandate failure"] as const),
        previousAttempts: randInt(rng, 3, 5),
        customerIntent: randFloat(rng, 0.1, 0.28),
        networkQuality: randFloat(rng, 0.25, 0.55),
        bankHealth: randFloat(rng, 0.18, 0.4),
        riskScore: randFloat(rng, 0.72, 0.95),
      };
    case "network":
      return {
        ...base,
        amount: randInt(rng, 1999, 8999),
        paymentMethod: pick(rng, ["UPI", "Card"] as const),
        alternativeMethod: "Net Banking",
        failureReason: "Network failure",
        previousAttempts: 0,
        customerIntent: randFloat(rng, 0.7, 0.9),
        networkQuality: randFloat(rng, 0.55, 0.88),
        bankHealth: randFloat(rng, 0.6, 0.85),
        riskScore: randFloat(rng, 0.1, 0.28),
      };
  }
}

function randomOccurredAt(rng: Rng): string {
  const start = Date.parse("2026-08-21T00:00:00.000Z");
  const span = 13 * 24 * 3600 * 1000;
  return new Date(start + Math.floor(rng() * span)).toISOString();
}
