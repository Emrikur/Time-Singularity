import type { TaxSettings } from "./types";

// Kyrkoavgiften varierar per församling, runt 1 % är ett rimligt snitt
export const CHURCH_FEE_RATE = 1;

export function totalTaxRate(settings: TaxSettings) {
  if (settings.taxRate === null) return null;
  return settings.taxRate + (settings.churchFee ? CHURCH_FEE_RATE : 0);
}

// Returns null when no rate is set, so callers can hide the estimate
export function estimateTax(gross: number, settings: TaxSettings) {
  const rate = totalTaxRate(settings);
  if (rate === null) return null;
  const tax = gross * (rate / 100);
  return { rate, tax, net: gross - tax };
}

export function formatTaxLabel(settings: TaxSettings) {
  if (settings.taxRate === null) return "";
  const rate = settings.taxRate.toLocaleString("sv-SE");
  return settings.churchFee
    ? `${rate}% + ${CHURCH_FEE_RATE}% church fee`
    : `${rate}%`;
}
