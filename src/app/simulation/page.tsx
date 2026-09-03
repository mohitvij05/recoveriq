"use client";

import { useState } from "react";
import { enrichTransaction } from "@/lib/engine/enrich";
import { createRng } from "@/lib/engine/rng";
import {
  FAILURE_REASONS,
  PAYMENT_METHODS,
  type FailureReason,
  type PaymentMethod,
  type RecoveryTransaction,
type TransactionFeatures,
} from "@/lib/types";

const presets = {
  highValue: {
    amount: 8499,
    paymentMethod: "UPI" as PaymentMethod,
    failureReason: "Bank timeout" as FailureReason,
    previousAttempts: 0,
    customerIntent: 85,
    networkQuality: 78,
    bankHealth: 80,
    riskScore: 12,
  },
  lowValue: {
    amount: 149,
    paymentMethod: "UPI" as PaymentMethod,
    failureReason: "Insufficient funds" as FailureReason,
    previousAttempts: 3,
    customerIntent: 25,
    networkQuality: 55,
    bankHealth: 48,
    riskScore: 70,
  },
  changeMethod: {
    amount: 6999,
    paymentMethod: "UPI" as PaymentMethod,
    failureReason: "UPI decline" as FailureReason,
    previousAttempts: 1,
    customerIntent: 88,
    networkQuality: 22,
    bankHealth: 72,
    riskScore: 20,
  },
};

function decisionStyle(decision: string) {
  if (decision === "RECOVER_NOW")
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  if (decision === "CHANGE_METHOD")
    return "border-blue-500/30 bg-blue-500/10 text-blue-400";
  if (decision === "WAIT")
    return "border-amber-500/30 bg-amber-500/10 text-amber-400";

  return "border-red-500/30 bg-red-500/10 text-red-400";
}

function decisionLabel(decision: string) {
  if (decision === "DONT_RECOVER") return "DON'T RECOVER";
  return decision.replaceAll("_", " ");
}

function money(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export default function SimulationPage() {
  const [amount, setAmount] = useState(presets.highValue.amount);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>(presets.highValue.paymentMethod);
  const [failureReason, setFailureReason] =
    useState<FailureReason>(presets.highValue.failureReason);
  const [previousAttempts, setPreviousAttempts] = useState(
    presets.highValue.previousAttempts
  );
  const [customerIntent, setCustomerIntent] = useState(
    presets.highValue.customerIntent
  );
  const [networkQuality, setNetworkQuality] = useState(
    presets.highValue.networkQuality
  );
  const [bankHealth, setBankHealth] = useState(presets.highValue.bankHealth);
  const [riskScore, setRiskScore] = useState(presets.highValue.riskScore);

  const [result, setResult] = useState<RecoveryTransaction | null>(null);

  function analyzeTransaction() {
    const alternativeMethod =
      paymentMethod === "UPI"
        ? "Card"
        : paymentMethod === "Card"
          ? "UPI"
          : paymentMethod === "Net Banking"
            ? "Card"
            : "UPI";

   const transaction: TransactionFeatures = {
      transactionId: "SIM_" + Date.now().toString().slice(-6),
      customerId: 9999,
      customerName: "Simulation Customer",
      amount: Number(amount),
      paymentMethod,
      alternativeMethod,
      bank: "Simulation Bank",
      failureReason,
      previousAttempts: Number(previousAttempts),
      customerIntent: customerIntent / 100,
      networkQuality: networkQuality / 100,
      bankHealth: bankHealth / 100,
      riskScore: riskScore / 100,
      occurredAt: new Date().toISOString(),
    };

    const analyzed = enrichTransaction(transaction, createRng(12345));

    setResult(analyzed);
  }

  function loadPreset(
    preset: (typeof presets)[keyof typeof presets]
  ) {
    setAmount(preset.amount);
    setPaymentMethod(preset.paymentMethod);
    setFailureReason(preset.failureReason);
    setPreviousAttempts(preset.previousAttempts);
    setCustomerIntent(preset.customerIntent);
    setNetworkQuality(preset.networkQuality);
    setBankHealth(preset.bankHealth);
    setRiskScore(preset.riskScore);
    setResult(null);
  }

  return (
    <main className="space-y-6">
      <div>
        <div className="text-sm font-medium text-emerald-400">
          RECOVERIQ / SIMULATION LAB
        </div>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Test the AI recovery decision
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          Change transaction conditions and see whether RecoverIQ recommends
          recovering, waiting, changing the payment method, or stopping
          recovery altogether.
        </p>
      </div>

      {/* Presets */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
        <div className="mb-4">
          <h2 className="font-semibold">Quick scenarios</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Load a realistic scenario to demonstrate different AI decisions.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <button
            onClick={() => loadPreset(presets.highValue)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left transition hover:border-emerald-500/40"
          >
            <div className="text-sm font-semibold text-emerald-400">
              High-value recovery
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              ₹8,499 · Bank timeout · High intent
            </div>
          </button>

          <button
            onClick={() => loadPreset(presets.lowValue)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left transition hover:border-red-500/40"
          >
            <div className="text-sm font-semibold text-red-400">
              Low-value / uneconomic
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              ₹149 · 3 attempts · Low intent
            </div>
          </button>

          <button
            onClick={() => loadPreset(presets.changeMethod)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 text-left transition hover:border-blue-500/40"
          >
            <div className="text-sm font-semibold text-blue-400">
              Change payment method
            </div>
            <div className="mt-1 text-xs text-zinc-500">
              ₹6,999 · UPI decline · Weak network
            </div>
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Input panel */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
          <div className="mb-6">
            <h2 className="font-semibold">Transaction conditions</h2>
            <p className="mt-1 text-xs text-zinc-500">
              These inputs are converted into recovery probability, cost,
              friction and risk.
            </p>
          </div>

          <div className="space-y-5">
            {/* Amount */}
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400">
                Transaction amount
              </label>

              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-500">
                  ₹
                </span>

                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-2 pl-8 pr-3 text-sm outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {/* Payment method */}
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400">
                Payment method
              </label>

              <select
                value={paymentMethod}
                onChange={(e) =>
                  setPaymentMethod(e.target.value as PaymentMethod)
                }
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method}>{method}</option>
                ))}
              </select>
            </div>

            {/* Failure reason */}
            <div>
              <label className="mb-2 block text-xs font-medium text-zinc-400">
                Failure reason
              </label>

              <select
                value={failureReason}
                onChange={(e) =>
                  setFailureReason(e.target.value as FailureReason)
                }
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500/50"
              >
                {FAILURE_REASONS.map((reason) => (
                  <option key={reason}>{reason}</option>
                ))}
              </select>
            </div>

            {/* Attempts */}
            <div>
              <div className="mb-2 flex justify-between">
                <label className="text-xs font-medium text-zinc-400">
                  Previous attempts
                </label>
                <span className="text-xs text-zinc-500">
                  {previousAttempts}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="5"
                value={previousAttempts}
                onChange={(e) => setPreviousAttempts(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Customer intent */}
            <SliderInput
              label="Customer intent"
              value={customerIntent}
              onChange={setCustomerIntent}
            />

            {/* Network quality */}
            <SliderInput
              label="Network quality"
              value={networkQuality}
              onChange={setNetworkQuality}
            />

            {/* Bank health */}
            <SliderInput
              label="Bank health"
              value={bankHealth}
              onChange={setBankHealth}
            />

            {/* Risk */}
            <SliderInput
              label="Risk score"
              value={riskScore}
              onChange={setRiskScore}
            />

            <button
              onClick={analyzeTransaction}
              className="w-full rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400"
            >
              Analyze Transaction
            </button>
          </div>
        </section>

        {/* Result panel */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
          <div className="mb-6">
            <h2 className="font-semibold">AI decision</h2>
            <p className="mt-1 text-xs text-zinc-500">
              RecoverIQ applies economics and guardrails before recommending
              an intervention.
            </p>
          </div>

          {!result ? (
            <div className="flex min-h-[520px] items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/40 p-8 text-center">
              <div>
                <div className="text-4xl">⌁</div>
                <div className="mt-4 text-sm font-medium text-zinc-300">
                  No transaction analyzed
                </div>
                <p className="mt-2 max-w-xs text-xs leading-5 text-zinc-500">
                  Change the inputs and click Analyze Transaction to see the
                  AI's decision.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Main decision */}
              <div
                className={`rounded-2xl border p-5 ${decisionStyle(
                  result.aiDecision
                )}`}
              >
                <div className="text-xs font-medium uppercase tracking-wider opacity-70">
                  Recommended decision
                </div>

                <div className="mt-2 text-3xl font-bold">
                  {decisionLabel(result.aiDecision)}
                </div>

                <div className="mt-2 text-sm">
                  {result.recommendedAction}
                </div>
              </div>

              {/* Core numbers */}
              <div className="grid grid-cols-2 gap-3">
                <Metric
                  label="Recovery probability"
                  value={`${Math.round(result.recoveryProbability * 100)}%`}
                />

                <Metric
                  label="Expected recovery"
                  value={money(result.expectedRecoveryValue)}
                />

                <Metric
                  label="Expected net value"
                  value={money(result.expectedNetValue)}
                />

                <Metric
                  label="Alternative probability"
                  value={`${Math.round(
                    result.alternativeMethodProbability * 100
                  )}%`}
                />
              </div>

              {/* Alternative method */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="text-xs text-zinc-500">
                  Alternative payment method
                </div>

                <div className="mt-1 flex items-center justify-between">
                  <span className="font-semibold">
                    {result.alternativeMethod}
                  </span>

                  <span className="text-sm text-blue-400">
                    {Math.round(
                      result.alternativeMethodProbability * 100
                    )}
                    % probability
                  </span>
                </div>

                <div className="mt-3 flex justify-between text-xs">
                  <span className="text-zinc-500">
                    Alternative expected net
                  </span>
                  <span className="font-medium text-zinc-300">
                    {money(result.alternativeExpectedNetValue)}
                  </span>
                </div>
              </div>

              {/* Economics */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="mb-3 text-xs font-medium text-zinc-400">
                  Decision economics
                </div>

                <div className="space-y-2 text-xs">
                  <Row
                    label="Recovery value"
                    value={money(result.expectedRecoveryValue)}
                  />

                  <Row
                    label="Recovery cost"
                    value={`-${money(result.recoveryCost)}`}
                  />

                  <Row
                    label="Customer friction"
                    value={`-${money(result.frictionCost)}`}
                  />

                  <Row
                    label="Risk penalty"
                    value={`-${money(result.riskPenalty)}`}
                  />

                  <div className="border-t border-zinc-800 pt-2">
                    <Row
                      label="Expected net value"
                      value={money(result.expectedNetValue)}
                      strong
                    />
                  </div>
                </div>
              </div>

              {/* Guardrails */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="mb-3 text-xs font-medium text-zinc-400">
                  Guardrail checks
                </div>

                <div className="space-y-2">
                  <Guardrail
                    label="Retry limit"
                    passed={result.previousAttempts < 3}
                    detail={
                      result.previousAttempts < 3
                        ? `${result.previousAttempts}/3 attempts`
                        : "Retry limit reached"
                    }
                  />

                  <Guardrail
                    label="Positive economics"
                    passed={result.expectedNetValue > 0}
                    detail={
                      result.expectedNetValue > 0
                        ? "Recovery is economically viable"
                        : "Recovery cost exceeds expected value"
                    }
                  />

                  <Guardrail
                    label="Customer intent"
                    passed={result.customerIntent >= 0.5}
                    detail={`${Math.round(result.customerIntent * 100)}% intent`}
                  />

                  <Guardrail
                    label="Risk threshold"
                    passed={result.riskScore < 0.7}
                    detail={`${Math.round(result.riskScore * 100)}% risk`}
                  />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Explanation */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <div className="text-sm font-semibold text-emerald-400">
              01 · Predict
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Estimate the probability that the payment can actually be
              recovered.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-blue-400">
              02 · Calculate
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Compare expected revenue against recovery cost, customer
              friction and risk.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-amber-400">
              03 · Decide
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-500">
              Only execute recovery when the expected outcome justifies the
              intervention.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

function SliderInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between">
        <label className="text-xs font-medium text-zinc-400">{label}</label>

        <span className="text-xs text-zinc-500">{value}%</span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${
        strong ? "font-semibold text-zinc-100" : "text-zinc-400"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Guardrail({
  label,
  passed,
  detail,
}: {
  label: string;
  passed: boolean;
  detail: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-zinc-950/60 px-3 py-2">
      <div className="flex items-center gap-2">
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
            passed
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          {passed ? "✓" : "!"}
        </span>

        <span className="text-xs text-zinc-300">{label}</span>
      </div>

      <span className="text-[11px] text-zinc-500">{detail}</span>
    </div>
  );
}