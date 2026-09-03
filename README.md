# RecoverIQ

## AI-Powered Revenue Recovery & Decision Intelligence

RecoverIQ is an AI-powered decision intelligence platform designed to help businesses intelligently handle failed payment transactions.

Instead of blindly retrying every failed payment, RecoverIQ evaluates the transaction context, recovery probability, customer intent, payment conditions, recovery costs, friction, and risk to determine the most appropriate recovery action.

The system can recommend:

- RECOVER NOW
- WAIT
- CHANGE METHOD
- DON'T RECOVER

---

## 🚨 Problem

A failed payment does not always mean lost revenue.

Automatically retrying every failed transaction can:

- Increase unnecessary recovery costs
- Create additional customer friction
- Repeat unsuccessful payment attempts
- Waste recovery opportunities
- Treat every failed transaction the same way

Businesses need a smarter way to determine **which transactions are worth recovering and what action should be taken next**.

---

## 💡 Solution

RecoverIQ analyzes failed transactions and combines recovery probability with recovery economics.

The decision flow is:

Transaction Data
↓
Recovery Probability
↓
Expected Recovery Value
↓
Recovery Cost + Friction Cost + Risk Penalty
↓
Expected Net Value
↓
AI Decision
↓
Recovery Outcome
↓
Analytics + Audit Trail

---

## 🧠 AI Decision Engine

RecoverIQ evaluates multiple transaction-level factors, including:

- Transaction amount
- Payment method
- Failure reason
- Previous payment attempts
- Customer intent
- Network quality
- Bank health
- Risk score

These factors are used to estimate recovery probability and expected economic value.

The decision engine can recommend:

| Decision | Meaning |
|---|---|
| RECOVER_NOW | Recovery has strong expected value |
| WAIT | Conditions suggest delaying recovery |
| CHANGE_METHOD | Another payment method has better potential |
| DON'T_RECOVER | Recovery is not economically justified |

---

## 📊 Key Features

### Revenue at Risk

Identify failed transactions that represent potential revenue loss.

### Decision Center

Understand the recommended recovery action and the reasoning behind it.

### Recovery Queue

Track transactions that are candidates for recovery.

### Analytics

Measure recovery performance, recovery rate, recovered revenue, and other decision metrics.

### Audit Trail

Maintain visibility into recovery decisions and outcomes.

### Simulation Lab

Test different transaction conditions and observe how the decision engine responds.

### Recovery Economics

Compare expected recovery value against recovery costs, customer friction, and risk.

### Guardrails

Prevent unnecessary recovery attempts and support safer decision-making.

---

## 🧪 Simulation Lab

RecoverIQ includes a simulation environment for testing different transaction scenarios.

Example scenarios include:

### High-Value Recovery

A high-value failed transaction with strong recovery conditions can result in:

`RECOVER_NOW`

### Low-Value / Uneconomic

A low-value transaction with multiple previous attempts and weaker recovery conditions can result in:

`WAIT` or `DON'T RECOVER`

### Change Payment Method

When the original payment method has poor recovery potential but an alternative method performs better:

`CHANGE_METHOD`

---

## 🏗️ Architecture

```text
                    RecoverIQ
                        │
                        ▼
              Transaction Features
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
       Probability   Economics      Risk
          │             │             │
          └─────────────┼─────────────┘
                        ▼
                 Decision Policy
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
      Recover Now   Change Method    Wait
          │             │             │
          └─────────────┼─────────────┘
                        ▼
                 Outcome Simulation
                        │
                        ▼
                    Analytics
                        │
                        ▼
                    Audit Trail

```

## 🛠️ Tech Stack

### Frontend
- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Next.js App Router

### Decision & Simulation Engine
- TypeScript-based transaction modeling
- Recovery probability calculations
- Expected recovery value calculations
- Recovery cost and friction modeling
- Risk penalty calculations
- Decision policy engine
- Deterministic transaction simulation

### Development & Deployment
- Git
- GitHub
- Vercel



## 🧠 How the Decision Engine Works

RecoverIQ does not simply retry every failed transaction.

For each transaction, the engine evaluates factors such as:

- Transaction amount
- Payment method
- Failure reason
- Previous attempts
- Customer intent
- Network quality
- Bank health
- Risk score

These signals are used to estimate the probability and economic value of recovery.

The engine then considers:

Recovery Probability
        ↓
Expected Recovery Value
        ↓
Recovery Cost
        ↓
Customer Friction Cost
        ↓
Risk Penalty
        ↓
Expected Net Value
        ↓
Decision Policy
        ↓
Recommended Action



## 📊 Application Modules

| Module | Purpose |
|---|---|
| Dashboard | Overall recovery and revenue intelligence |
| Revenue at Risk | Identify potentially recoverable failed revenue |
| Decision Center | Understand AI/decision recommendations |
| Recovery Queue | Track transactions requiring recovery action |
| Analytics | Measure recovery performance |
| Audit | Provide decision and outcome visibility |
| Simulation | Test different transaction scenarios |
| Settings | Manage application configuration |

---

## 🧪 Simulation Scenarios

RecoverIQ provides predefined scenarios to demonstrate how different transaction conditions influence the recommended action.

### High-Value Recovery

Tests a high-value transaction with strong recovery conditions.

Expected behavior:

`RECOVER_NOW`

### Low-Value / Uneconomic

Tests a lower-value transaction with weaker conditions and previous attempts.

Expected behavior may include:

`WAIT`

or

`DON'T_RECOVER`

### Change Payment Method

Tests a failed transaction where an alternative payment method may provide better recovery potential.

Expected behavior:

`CHANGE_METHOD`

The Simulation Lab allows users to modify transaction conditions and observe how the decision changes.

---

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/mohitvij05/recoveriq.git
cd recoveriq
