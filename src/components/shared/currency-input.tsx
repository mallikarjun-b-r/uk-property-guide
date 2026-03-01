import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { InfoTooltip } from './info-tooltip';
import { formatCurrency } from '@/lib/utils/format';

interface CurrencyInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  tooltip?: string;
}

export function CurrencyInput({ label, value, onChange, min, max, step, tooltip }: CurrencyInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">
          {label}
          {tooltip && <InfoTooltip text={tooltip} />}
        </Label>
        <span className="text-sm font-medium tabular-nums">{formatCurrency(value)}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
}
