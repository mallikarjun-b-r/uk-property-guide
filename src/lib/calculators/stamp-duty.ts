import {
  SDLT_STANDARD_BANDS,
  SDLT_FTB_BANDS,
  FTB_RELIEF_LIMIT,
  ADDITIONAL_PROPERTY_SURCHARGE,
} from '@/lib/data/tax-rates';

export function calculateStampDuty(
  price: number,
  isFirstTimeBuyer: boolean
): number {
  if (price <= 0) return 0;

  // First-time buyer relief only applies if price <= £500k
  if (isFirstTimeBuyer && price <= FTB_RELIEF_LIMIT) {
    return calculateFromBands(price, SDLT_FTB_BANDS);
  }

  // Standard rates (also for FTB above £500k)
  return calculateFromBands(price, SDLT_STANDARD_BANDS);
}

export function calculateStampDutyAdditionalProperty(price: number): number {
  if (price <= 0) return 0;

  const standardDuty = calculateFromBands(price, SDLT_STANDARD_BANDS);
  const surcharge = Math.round(price * ADDITIONAL_PROPERTY_SURCHARGE);

  return standardDuty + surcharge;
}

function calculateFromBands(
  price: number,
  bands: { threshold: number; rate: number }[]
): number {
  let tax = 0;
  let previousThreshold = 0;

  for (const band of bands) {
    if (price <= previousThreshold) break;

    const taxableInBand = Math.min(price, band.threshold) - previousThreshold;
    if (taxableInBand > 0) {
      tax += taxableInBand * band.rate;
    }

    previousThreshold = band.threshold;
  }

  return Math.round(tax);
}
