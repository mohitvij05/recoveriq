"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [maxRetries, setMaxRetries] = useState(3);
  const [minProbability, setMinProbability] = useState(55);
  const [maxContacts, setMaxContacts] = useState(2);
  const [minNetValue, setMinNetValue] = useState(0);

  const [stopRepeated, setStopRepeated] = useState(true);
  const [stopNegative, setStopNegative] = useState(true);
  const [humanApproval, setHumanApproval] = useState(true);
  const [preferAlternative, setPreferAlternative] = useState(true);

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
          RECOVERIQ / POLICY CONTROL
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Recovery Policies & Guardrails
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Define the boundaries within which RecoverIQ can recommend and
          execute revenue recovery actions. The AI can optimize decisions,
          but it cannot bypass these controls.
        </p>
      </div>

      {/* Active policy */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              CURRENT POLICY
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              Standard Revenue Recovery Policy
            </h2>

            <p className="mt-1 text-xs text-muted">
              Applied to the synthetic recovery batch.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            POLICY ACTIVE
          </div>
        </div>
      </div>

      {/* Numeric guardrails */}
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted">
          RECOVERY LIMITS
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <PolicyInput
            label="Maximum retry attempts"
            description="Stop recovery after this many previous attempts."
            value={maxRetries}
            onChange={setMaxRetries}
            suffix="attempts"
            min={1}
            max={5}
          />

          <PolicyInput
            label="Minimum recovery probability"
            description="Recovery below this threshold should not be attempted."
            value={minProbability}
            onChange={setMinProbability}
            suffix="%"
            min={10}
            max={95}
          />

          <PolicyInput
            label="Maximum customer contacts"
            description="Limit repeated recovery communication."
            value={maxContacts}
            onChange={setMaxContacts}
            suffix="contacts"
            min={1}
            max={5}
          />

          <PolicyInput
            label="Minimum expected net value"
            description="Recovery must create at least this much expected value."
            value={minNetValue}
            onChange={setMinNetValue}
            suffix="₹"
            min={0}
            max={1000}
          />
        </div>
      </div>

      {/* Safety controls */}
      <div>
        <p className="mb-3 text-xs uppercase tracking-[0.18em] text-muted">
          SAFETY CONTROLS
        </p>

        <div className="overflow-hidden rounded-xl border border-border bg-surface">
          <GuardrailToggle
            title="Stop after repeated failures"
            description="Prevent additional recovery attempts when the retry limit is reached."
            enabled={stopRepeated}
            onChange={setStopRepeated}
          />

          <GuardrailToggle
            title="Stop when expected value is negative"
            description="Never pursue recovery when expected recovery value is lower than its cost and risk."
            enabled={stopNegative}
            onChange={setStopNegative}
          />

          <GuardrailToggle
            title="Require human approval for high-risk recovery"
            description="High-risk actions must pass through human review before execution."
            enabled={humanApproval}
            onChange={setHumanApproval}
          />

          <GuardrailToggle
            title="Prefer materially better payment methods"
            description="Switch payment method when the alternative has a significantly higher expected value."
            enabled={preferAlternative}
            onChange={setPreferAlternative}
            last
          />
        </div>
      </div>

      {/* Policy logic */}
      <div className="rounded-xl border border-border bg-surface p-6">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          DECISION BOUNDARY
        </p>

        <h2 className="mt-2 text-lg font-semibold">
          AI operates inside explicit boundaries
        </h2>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Boundary
            number="01"
            title="Predict"
            text="Estimate recovery probability."
          />

          <Boundary
            number="02"
            title="Value"
            text="Calculate expected net value."
          />

          <Boundary
            number="03"
            title="Guard"
            text="Apply retry, risk and friction limits."
          />

          <Boundary
            number="04"
            title="Decide"
            text="Recover, wait, switch or stop."
          />
        </div>
      </div>

      {/* Configuration summary */}
      <div className="rounded-xl border border-dashed border-border p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">
          CURRENT CONFIGURATION
        </p>

        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Summary
            label="Max retries"
            value={`${maxRetries}`}
          />

          <Summary
            label="Min probability"
            value={`${minProbability}%`}
          />

          <Summary
            label="Max contacts"
            value={`${maxContacts}`}
          />

          <Summary
            label="Min net value"
            value={`₹${minNetValue}`}
          />
        </div>

        <p className="mt-5 text-xs text-muted">
          Changes in this simulation panel demonstrate configurable policy
          boundaries. The core decision engine remains deterministic and
          auditable.
        </p>
      </div>
    </section>
  );
}

function PolicyInput({
  label,
  description,
  value,
  onChange,
  suffix,
  min,
  max,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  suffix: string;
  min: number;
  max: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{label}</p>

          <p className="mt-1 text-xs leading-5 text-muted">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border px-3 py-2">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-14 bg-transparent text-right text-sm font-semibold outline-none"
          />

          <span className="text-xs text-muted">{suffix}</span>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-5 w-full"
      />
    </div>
  );
}

function GuardrailToggle({
  title,
  description,
  enabled,
  onChange,
  last = false,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-5 p-5 ${
        !last ? "border-b border-border" : ""
      }`}
    >
      <div>
        <p className="text-sm font-medium">{title}</p>

        <p className="mt-1 max-w-2xl text-xs leading-5 text-muted">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange(!enabled)}
        aria-pressed={enabled}
        className={`relative h-6 w-11 shrink-0 rounded-full border border-border transition ${
          enabled ? "bg-foreground" : "bg-background"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full transition ${
            enabled
              ? "left-6 bg-background"
              : "left-1 bg-muted"
          }`}
        />
      </button>
    </div>
  );
}

function Boundary({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs font-semibold text-muted">{number}</p>

      <p className="mt-3 text-sm font-semibold">{title}</p>

      <p className="mt-1 text-xs leading-5 text-muted">{text}</p>
    </div>
  );
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}