// DAIO Value Explorer Calculator
// Implements the core formulas for risk and ROI calculations

import type { CalculatorInputs, CalculationResults, YearlyProjection } from "@/types";

/**
 * Calculate expected prevented loss (current)
 * N = V * (p_u - p_d)
 */
export function calculateExpectedPreventedLoss(
  totalValue: number,
  riskWithoutDAIO: number,
  riskWithDAIO: number
): number {
  return totalValue * (riskWithoutDAIO / 100 - riskWithDAIO / 100);
}

/**
 * Calculate future value
 * V_t = V * (1 + g)^t
 */
export function calculateFutureValue(
  totalValue: number,
  growthRate: number,
  timeHorizon: number
): number {
  return totalValue * Math.pow(1 + growthRate / 100, timeHorizon);
}

/**
 * Calculate future prevented loss
 * N_t = V_t * (p_u - p_d)
 */
export function calculateFuturePreventedLoss(
  futureValue: number,
  riskWithoutDAIO: number,
  riskWithDAIO: number
): number {
  return futureValue * (riskWithoutDAIO / 100 - riskWithDAIO / 100);
}

/**
 * Calculate ROI
 * ROI = (N - C) / C
 */
export function calculateROI(
  expectedPreventedLoss: number,
  daioCost: number
): number {
  if (daioCost === 0) return 0;
  return ((expectedPreventedLoss - daioCost) / daioCost) * 100;
}

/**
 * Calculate continuity score (0-100)
 * Based on custody type weighting and input completeness
 */
export function calculateContinuityScore(inputs: CalculatorInputs): number {
  let score = 50; // Start at baseline

  const { allocation, riskWithDAIO, timeHorizon } = inputs;

  // Self-custody weight (higher self-custody = more need for DAIO)
  const selfCustodyWeight = allocation.selfCustodyCrypto;
  score += selfCustodyWeight * 0.2;

  // DeFi weight (complex positions need more structure)
  const defiWeight = allocation.defiPositions;
  score += defiWeight * 0.15;

  // Business accounts weight
  const businessWeight = allocation.businessAccounts;
  score += businessWeight * 0.15;

  // Risk reduction (lower risk with DAIO = better)
  score += (15 - riskWithDAIO) * 1.5;

  // Time horizon (longer = more important)
  score += timeHorizon * 1;

  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get continuity score recommendation
 */
export function getContinuityRecommendation(score: number): string {
  if (score >= 80) {
    return "Excellent continuity planning. Your digital assets are well-structured for long-term preservation.";
  } else if (score >= 60) {
    return "Good foundation. Consider increasing governance structure for complex assets.";
  } else if (score >= 40) {
    return "Moderate risk. DAIO implementation can significantly improve your continuity posture.";
  } else {
    return "High risk profile. Immediate action recommended to protect your digital assets.";
  }
}

/**
 * Calculate year-by-year projections
 */
export function calculateYearlyProjections(
  inputs: CalculatorInputs
): YearlyProjection[] {
  const projections: YearlyProjection[] = [];
  const { totalValue, growthRate, riskWithoutDAIO, riskWithDAIO, daioCost } =
    inputs;

  let cumulativeBenefit = -daioCost; // Start with cost

  for (let year = 1; year <= inputs.timeHorizon; year++) {
    const portfolioValue = calculateFutureValue(
      totalValue,
      growthRate,
      year
    );
    const preventedLoss = calculateFuturePreventedLoss(
      portfolioValue,
      riskWithoutDAIO,
      riskWithDAIO
    );
    cumulativeBenefit += preventedLoss;

    projections.push({
      year,
      portfolioValue: Math.round(portfolioValue),
      preventedLoss: Math.round(preventedLoss),
      cumulativeBenefit: Math.round(cumulativeBenefit),
    });
  }

  return projections;
}

/**
 * Perform all calculations
 */
export function calculateAll(
  inputs: CalculatorInputs
): CalculationResults {
  const expectedPreventedLoss = calculateExpectedPreventedLoss(
    inputs.totalValue,
    inputs.riskWithoutDAIO,
    inputs.riskWithDAIO
  );

  const futureValue = calculateFutureValue(
    inputs.totalValue,
    inputs.growthRate,
    inputs.timeHorizon
  );

  const futurePreventedLoss = calculateFuturePreventedLoss(
    futureValue,
    inputs.riskWithoutDAIO,
    inputs.riskWithDAIO
  );

  const roi = calculateROI(expectedPreventedLoss, inputs.daioCost);

  const continuityScore = calculateContinuityScore(inputs);

  const yearlyProjections = calculateYearlyProjections(inputs);

  return {
    expectedPreventedLoss: Math.round(expectedPreventedLoss),
    futureValue: Math.round(futureValue),
    futurePreventedLoss: Math.round(futurePreventedLoss),
    roi: Math.round(roi * 10) / 10, // Round to 1 decimal
    continuityScore,
    yearlyProjections,
  };
}

/**
 * Format currency value
 */
export function formatCurrency(
  value: number,
  currency: CalculatorInputs["currency"]
): string {
  const symbols: Record<CalculatorInputs["currency"], string> = {
    EUR: "€",
    USD: "$",
    CHF: "CHF",
    GBP: "£",
  };

  const symbol = symbols[currency];

  if (value >= 1000000) {
    return `${symbol}${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(0)}k`;
  } else {
    return `${symbol}${value}`;
  }
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}
