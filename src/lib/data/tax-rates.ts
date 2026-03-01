export interface SDLTBand {
  threshold: number;
  rate: number;
}

export const SDLT_STANDARD_BANDS: SDLTBand[] = [
  { threshold: 125000, rate: 0 },
  { threshold: 250000, rate: 0.02 },
  { threshold: 925000, rate: 0.05 },
  { threshold: 1500000, rate: 0.10 },
  { threshold: Infinity, rate: 0.12 },
];

export const SDLT_FTB_BANDS: SDLTBand[] = [
  { threshold: 300000, rate: 0 },
  { threshold: 500000, rate: 0.05 },
  // FTB relief only applies up to £500k; above that, standard rates apply
];

export const FTB_RELIEF_LIMIT = 500000;

export const ADDITIONAL_PROPERTY_SURCHARGE = 0.03;

export const FIXED_COSTS = {
  legalFees: 1500,
  surveyFees: 500,
  annualInsurance: 300,
};
