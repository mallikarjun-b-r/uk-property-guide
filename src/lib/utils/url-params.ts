import {
  DEFAULT_PARAMS,
  DEFAULT_SCENARIO_TOGGLES,
  DEFAULT_SELL_AND_REBUY_PARAMS,
  DEFAULT_KEEP_AND_RENT_OUT_PARAMS,
} from '@/types/buy-vs-rent';
import type {
  BuyVsRentParams,
  ScenarioToggles,
  SellAndRebuyParams,
  KeepAndRentOutParams,
} from '@/types/buy-vs-rent';

// Short keys → full property path mapping
const PARAM_KEYS: Record<string, { obj: 'p' | 't' | 's' | 'k'; key: string }> = {
  pp: { obj: 'p', key: 'propertyPrice' },
  dp: { obj: 'p', key: 'depositPercent' },
  mr: { obj: 'p', key: 'mortgageRate' },
  mt: { obj: 'p', key: 'mortgageTerm' },
  re: { obj: 'p', key: 'monthlyRent' },
  ri: { obj: 'p', key: 'annualRentIncrease' },
  pg: { obj: 'p', key: 'annualPropertyGrowth' },
  am: { obj: 'p', key: 'annualMaintenancePercent' },
  ir: { obj: 'p', key: 'investmentReturnRate' },
  sy: { obj: 'p', key: 'simulationYears' },
  fb: { obj: 'p', key: 'isFirstTimeBuyer' },
  // Toggles
  ts: { obj: 't', key: 'sellAndRebuy' },
  tk: { obj: 't', key: 'keepAndRentOut' },
  // Sell & Rebuy
  sa: { obj: 's', key: 'sellAfterYear' },
  np: { obj: 's', key: 'newPropertyPrice' },
  sc: { obj: 's', key: 'sellingCostsPercent' },
  nd: { obj: 's', key: 'newDepositPercent' },
  nm: { obj: 's', key: 'newMortgageRate' },
  nt: { obj: 's', key: 'newMortgageTerm' },
  // Keep & Rent Out
  sw: { obj: 'k', key: 'switchYear' },
  mi: { obj: 'k', key: 'monthlyRentalIncome' },
  ai: { obj: 'k', key: 'annualRentalIncrease' },
  lf: { obj: 'k', key: 'lettingAgentFeePercent' },
  vw: { obj: 'k', key: 'voidWeeksPerYear' },
  li: { obj: 'k', key: 'landlordInsurance' },
  bp: { obj: 'k', key: 'propertyBPrice' },
  bd: { obj: 'k', key: 'propertyBDepositPercent' },
  bm: { obj: 'k', key: 'propertyBMortgageRate' },
  bt: { obj: 'k', key: 'propertyBMortgageTerm' },
};

// Reverse: full key → short key
const REVERSE_KEYS: Record<string, Record<string, string>> = {};
for (const [short, { obj, key }] of Object.entries(PARAM_KEYS)) {
  if (!REVERSE_KEYS[obj]) REVERSE_KEYS[obj] = {};
  REVERSE_KEYS[obj][key] = short;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRecord(obj: any): Record<string, unknown> {
  return obj;
}

const DEFAULTS: Record<string, Record<string, unknown>> = {
  p: toRecord(DEFAULT_PARAMS),
  t: toRecord(DEFAULT_SCENARIO_TOGGLES),
  s: toRecord(DEFAULT_SELL_AND_REBUY_PARAMS),
  k: toRecord(DEFAULT_KEEP_AND_RENT_OUT_PARAMS),
};

export function encodeStateToUrl(
  params: BuyVsRentParams,
  toggles: ScenarioToggles,
  sellParams: SellAndRebuyParams,
  keepParams: KeepAndRentOutParams,
): string {
  const stateObjects: Record<string, Record<string, unknown>> = {
    p: toRecord(params),
    t: toRecord(toggles),
    s: toRecord(sellParams),
    k: toRecord(keepParams),
  };

  const searchParams = new URLSearchParams();

  for (const [objKey, reverseMap] of Object.entries(REVERSE_KEYS)) {
    const current = stateObjects[objKey];
    const defaults = DEFAULTS[objKey];
    for (const [fullKey, shortKey] of Object.entries(reverseMap)) {
      const val = current[fullKey as keyof typeof current];
      const def = defaults[fullKey as keyof typeof defaults];
      if (val !== def) {
        if (typeof val === 'boolean') {
          searchParams.set(shortKey, val ? '1' : '0');
        } else {
          searchParams.set(shortKey, String(val));
        }
      }
    }
  }

  const qs = searchParams.toString();
  return `${window.location.origin}${window.location.pathname}${qs ? '?' + qs : ''}`;
}

export function decodeStateFromUrl(): {
  params: BuyVsRentParams;
  toggles: ScenarioToggles;
  sellParams: SellAndRebuyParams;
  keepParams: KeepAndRentOutParams;
} {
  const sp = new URLSearchParams(window.location.search);

  const result: Record<string, Record<string, unknown>> = {
    p: { ...DEFAULT_PARAMS },
    t: { ...DEFAULT_SCENARIO_TOGGLES },
    s: { ...DEFAULT_SELL_AND_REBUY_PARAMS },
    k: { ...DEFAULT_KEEP_AND_RENT_OUT_PARAMS },
  };

  for (const [shortKey, { obj, key }] of Object.entries(PARAM_KEYS)) {
    const raw = sp.get(shortKey);
    if (raw === null) continue;

    const defaultVal = DEFAULTS[obj][key as keyof (typeof DEFAULTS)[typeof obj]];
    if (typeof defaultVal === 'boolean') {
      result[obj][key] = raw === '1';
    } else {
      const num = Number(raw);
      if (!Number.isNaN(num)) {
        result[obj][key] = num;
      }
    }
  }

  return {
    params: result.p as unknown as BuyVsRentParams,
    toggles: result.t as unknown as ScenarioToggles,
    sellParams: result.s as unknown as SellAndRebuyParams,
    keepParams: result.k as unknown as KeepAndRentOutParams,
  };
}
