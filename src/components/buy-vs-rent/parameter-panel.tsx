import type { BuyVsRentParams, ScenarioToggles, SellAndRebuyParams, KeepAndRentOutParams } from '@/types/buy-vs-rent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CurrencyInput } from '@/components/shared/currency-input';
import { PercentageInput } from '@/components/shared/percentage-input';
import { formatCurrency } from '@/lib/utils/format';
import { SellAndRebuyParamsPanel } from './sell-and-rebuy-params';
import { KeepAndRentOutParamsPanel } from './keep-and-rent-out-params';

interface ParameterPanelProps {
  params: BuyVsRentParams;
  onChange: (params: BuyVsRentParams) => void;
  toggles: ScenarioToggles;
  onTogglesChange: (toggles: ScenarioToggles) => void;
  sellAndRebuyParams: SellAndRebuyParams;
  onSellAndRebuyChange: (params: SellAndRebuyParams) => void;
  keepAndRentOutParams: KeepAndRentOutParams;
  onKeepAndRentOutChange: (params: KeepAndRentOutParams) => void;
}

export function ParameterPanel({
  params,
  onChange,
  toggles,
  onTogglesChange,
  sellAndRebuyParams,
  onSellAndRebuyChange,
  keepAndRentOutParams,
  onKeepAndRentOutChange,
}: ParameterPanelProps) {
  const update = <K extends keyof BuyVsRentParams>(key: K, value: BuyVsRentParams[K]) => {
    onChange({ ...params, [key]: value });
  };

  const depositAmount = params.propertyPrice * (params.depositPercent / 100);

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Property */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Property</h3>
          <CurrencyInput
            label="Property price"
            value={params.propertyPrice}
            onChange={(v) => update('propertyPrice', v)}
            min={50000}
            max={2000000}
            step={5000}
          />
          <div className="space-y-2">
            <PercentageInput
              label="Deposit"
              value={params.depositPercent}
              onChange={(v) => update('depositPercent', v)}
              min={5}
              max={50}
              step={1}
            />
            <p className="text-xs text-muted-foreground pl-1">{formatCurrency(depositAmount)}</p>
          </div>
          <PercentageInput
            label="Annual property growth"
            value={params.annualPropertyGrowth}
            onChange={(v) => update('annualPropertyGrowth', v)}
            min={-5}
            max={15}
            step={0.5}
            tooltip="Expected annual increase in property value"
          />
          <PercentageInput
            label="Maintenance cost"
            value={params.annualMaintenancePercent}
            onChange={(v) => update('annualMaintenancePercent', v)}
            min={0}
            max={5}
            step={0.1}
            tooltip="Annual maintenance as % of property value"
            suffix="% of value/yr"
          />
        </div>

        <Separator />

        {/* Mortgage */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Mortgage</h3>
          <PercentageInput
            label="Interest rate"
            value={params.mortgageRate}
            onChange={(v) => update('mortgageRate', v)}
            min={1}
            max={10}
            step={0.1}
          />
          <PercentageInput
            label="Mortgage term"
            value={params.mortgageTerm}
            onChange={(v) => update('mortgageTerm', v)}
            min={10}
            max={35}
            step={1}
            suffix=" years"
          />
        </div>

        <Separator />

        {/* Renting */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Renting</h3>
          <CurrencyInput
            label="Monthly rent"
            value={params.monthlyRent}
            onChange={(v) => update('monthlyRent', v)}
            min={300}
            max={5000}
            step={50}
          />
          <PercentageInput
            label="Annual rent increase"
            value={params.annualRentIncrease}
            onChange={(v) => update('annualRentIncrease', v)}
            min={0}
            max={10}
            step={0.5}
          />
        </div>

        <Separator />

        {/* Investment */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Investment</h3>
          <PercentageInput
            label="Investment return"
            value={params.investmentReturnRate}
            onChange={(v) => update('investmentReturnRate', v)}
            min={0}
            max={15}
            step={0.5}
            tooltip="Return on investing the deposit + monthly savings instead of buying"
          />
        </div>

        <Separator />

        {/* Simulation */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Simulation</h3>
          <PercentageInput
            label="Time period"
            value={params.simulationYears}
            onChange={(v) => update('simulationYears', v)}
            min={1}
            max={30}
            step={1}
            suffix=" years"
          />
          <div className="flex items-center justify-between">
            <Label className="text-sm">First-time buyer</Label>
            <Switch
              checked={params.isFirstTimeBuyer}
              onCheckedChange={(v) => update('isFirstTimeBuyer', v)}
            />
          </div>
        </div>

        <Separator />

        {/* Scenarios */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Scenarios</h3>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Sell & Rebuy</Label>
            <Switch
              checked={toggles.sellAndRebuy}
              onCheckedChange={(v) => onTogglesChange({ ...toggles, sellAndRebuy: v })}
            />
          </div>
          {toggles.sellAndRebuy && (
            <SellAndRebuyParamsPanel
              params={sellAndRebuyParams}
              onChange={onSellAndRebuyChange}
              maxYear={params.simulationYears}
            />
          )}
          <div className="flex items-center justify-between">
            <Label className="text-sm">Keep & Rent Out</Label>
            <Switch
              checked={toggles.keepAndRentOut}
              onCheckedChange={(v) => onTogglesChange({ ...toggles, keepAndRentOut: v })}
            />
          </div>
          {toggles.keepAndRentOut && (
            <KeepAndRentOutParamsPanel
              params={keepAndRentOutParams}
              onChange={onKeepAndRentOutChange}
              maxYear={params.simulationYears}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
