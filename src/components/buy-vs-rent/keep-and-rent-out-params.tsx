import type { KeepAndRentOutParams } from '@/types/buy-vs-rent';
import { SCENARIO_COLORS } from '@/types/buy-vs-rent';
import { CurrencyInput } from '@/components/shared/currency-input';
import { PercentageInput } from '@/components/shared/percentage-input';
import { InfoTooltip } from '@/components/shared/info-tooltip';

interface KeepAndRentOutParamsPanelProps {
  params: KeepAndRentOutParams;
  onChange: (params: KeepAndRentOutParams) => void;
  maxYear: number;
}

export function KeepAndRentOutParamsPanel({ params, onChange, maxYear }: KeepAndRentOutParamsPanelProps) {
  const update = <K extends keyof KeepAndRentOutParams>(key: K, value: KeepAndRentOutParams[K]) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <div
      className="space-y-4 pl-3 border-l-2"
      style={{ borderColor: SCENARIO_COLORS.keepAndRentOut }}
    >
      <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: SCENARIO_COLORS.keepAndRentOut }}>
        Keep & Rent Out
        <InfoTooltip text="Rental income tax not modelled in V1" />
      </h4>
      <PercentageInput
        label="Switch year"
        value={params.switchYear}
        onChange={(v) => update('switchYear', v)}
        min={1}
        max={Math.max(1, maxYear - 1)}
        step={1}
        suffix=""
        tooltip="Year to start renting out property A and buy property B"
      />
      <CurrencyInput
        label="Monthly rental income"
        value={params.monthlyRentalIncome}
        onChange={(v) => update('monthlyRentalIncome', v)}
        min={300}
        max={5000}
        step={50}
        tooltip="Expected monthly rent for property A"
      />
      <PercentageInput
        label="Annual rental increase"
        value={params.annualRentalIncrease}
        onChange={(v) => update('annualRentalIncrease', v)}
        min={0}
        max={10}
        step={0.5}
      />
      <PercentageInput
        label="Letting agent fee"
        value={params.lettingAgentFeePercent}
        onChange={(v) => update('lettingAgentFeePercent', v)}
        min={0}
        max={15}
        step={1}
        tooltip="Agent management fee as % of rental income"
      />
      <PercentageInput
        label="Void weeks/year"
        value={params.voidWeeksPerYear}
        onChange={(v) => update('voidWeeksPerYear', v)}
        min={0}
        max={12}
        step={1}
        suffix=" weeks"
        tooltip="Expected empty weeks per year with no tenant"
      />
      <CurrencyInput
        label="Landlord insurance"
        value={params.landlordInsurance}
        onChange={(v) => update('landlordInsurance', v)}
        min={0}
        max={1000}
        step={50}
        tooltip="Annual landlord insurance premium"
      />

      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-2">Property B</h4>
      <CurrencyInput
        label="Property B price"
        value={params.propertyBPrice}
        onChange={(v) => update('propertyBPrice', v)}
        min={50000}
        max={2000000}
        step={5000}
      />
      <PercentageInput
        label="Property B deposit"
        value={params.propertyBDepositPercent}
        onChange={(v) => update('propertyBDepositPercent', v)}
        min={5}
        max={50}
        step={1}
      />
      <PercentageInput
        label="Property B mortgage rate"
        value={params.propertyBMortgageRate}
        onChange={(v) => update('propertyBMortgageRate', v)}
        min={1}
        max={10}
        step={0.1}
      />
      <PercentageInput
        label="Property B mortgage term"
        value={params.propertyBMortgageTerm}
        onChange={(v) => update('propertyBMortgageTerm', v)}
        min={10}
        max={35}
        step={1}
        suffix=" years"
      />
    </div>
  );
}
