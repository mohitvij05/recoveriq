import type { AiDecision, RecoveryStatus } from "./types";

export function formatINR(value: number, digits = 0): string {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString("en-IN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });
  return `${value < 0 ? "-" : ""}₹${formatted}`;
}

export function formatINRCompact(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 100000) {
    const lakhs = abs / 100000;
    const decimals = lakhs >= 10 ? 1 : 2;
    return `${sign}₹${lakhs.toFixed(decimals)}L`;
  }
  return formatINR(value, abs < 100 ? 2 : 0);
}

export function formatPercent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function decisionLabel(decision: AiDecision): string {
  switch (decision) {
    case "RECOVER_NOW":
      return "Recover Now";
    case "WAIT":
      return "Wait";
    case "CHANGE_METHOD":
      return "Change Method";
    case "DONT_RECOVER":
      return "Don't Recover";
  }
}

export function statusLabel(status: RecoveryStatus): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "SCHEDULED":
      return "Scheduled";
    case "RECOVERED":
      return "Recovered";
    case "STOPPED":
      return "Stopped";
    case "FAILED":
      return "Failed";
  }
}
