import type { AiDecision, RecoveryStatus, RiskLevel } from "@/lib/types";
import { decisionLabel, statusLabel } from "@/lib/format";

const DECISION_CLASS: Record<AiDecision, string> = {
  RECOVER_NOW: "border-recover/30 bg-recover/10 text-recover",
  WAIT: "border-wait/30 bg-wait/10 text-wait",
  CHANGE_METHOD: "border-change/30 bg-change/10 text-change",
  DONT_RECOVER: "border-stop/30 bg-stop/10 text-stop",
};

const RISK_CLASS: Record<RiskLevel, string> = {
  Low: "border-recover/30 bg-recover/10 text-recover",
  Medium: "border-wait/30 bg-wait/10 text-wait",
  High: "border-stop/30 bg-stop/10 text-stop",
};

export function DecisionBadge({ decision }: { decision: AiDecision }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide ${DECISION_CLASS[decision]}`}
    >
      {decisionLabel(decision)}
    </span>
  );
}

export function StatusBadge({ status }: { status: RecoveryStatus }) {
  return (
    <span className="inline-flex rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
      {statusLabel(status)}
    </span>
  );
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${RISK_CLASS[level]}`}
    >
      {level}
    </span>
  );
}
