import { generateTransactions } from "@/lib/data/generate";
import type { RecoveryTransaction } from "@/lib/types";

let cache: RecoveryTransaction[] | null = null;

export function getTransactions(): RecoveryTransaction[] {
  if (!cache) {
    cache = generateTransactions(42);
  }
  return cache;
}

export function getTransactionById(
  id: string,
): RecoveryTransaction | undefined {
  return getTransactions().find((tx) => tx.transactionId === id);
}
