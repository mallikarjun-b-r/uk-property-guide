import type { SellAndRebuyParams } from '@/types/buy-vs-rent';
import { SCENARIO_COLORS } from '@/types/buy-vs-rent';
import { CurrencyInput } from '@/components/shared/currency-input';
import { PercentageInput } from '@/components/shared/percentage-input';

interface SellAndRebuyParamsPanelProps {
  params: SellAndRebuyParams;
  onChange: (params: SellAndRebuyParams) => void;
  maxYear: number;
}

export function SellAndRebuyParamsPanel({ params, onChange, maxYear }: SellAndRebuyParamsPanelProps) {
  const update = <K extends keyof SellAndRebuyParams>(key: K, value: SellAndRebuyParams[K]) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div
      className="space-y-4 pl-3 border-l-2"
      style={{ borderColor: SCENARIO_COLORS.sellAndRebuy }}
    >
      <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: SCENARIO_COLORS.sellAndRebuy }}>
        Sell & Rebuy
      </h4>
      <PercentageInput
        label="Sell after year"
        value={params.sellAfterYear}
        onChange={(v) => update('sellAfterYear', v)}
        min={1}
        max={Math.max(1, maxYear - 1)}
        step={1}
        suffix=""
        tooltip="Year to sell property A and buy property B"
      />
      <CurrencyInput
        label="New property price"
        value={params.newPropertyPrice}
        onChange={(v) => update('newPropertyPrice', v)}
        min={50000}
        max={2000000}
        step={5000}
      />
      <PercentageInput
        label="Selling costs"
        value={params.sellingCostsPercent}
        onChange={(v) => update('sellingCostsPercent', v)}
        min={1}
        max={5}
        step={0.5}
        tooltip="Estate agent fees + solicitor costs as % of sale price"
      />
      <PercentageInput
        label="New deposit"
        value={params.newDepositPercent}
        onChange={(v) => update('newDepositPercent', v)}
        min={5}
        max={50}
        step={1}
      />
      <PercentageInput
        label="New mortgage rate"
        value={params.newMortgageRate}
        onChange={(v) => update('newMortgageRate', v)}
        min={1}
        max={10}
        step={0.1}
      />
      <PercentageInput
        label="New mortgage term"
        value={params.newMortgageTerm}
        onChange={(v) => update('newMortgageTerm', v)}
        min={10}
        max={35}
        step={1}
        suffix=" years"
      />
    </div>
  );
}
