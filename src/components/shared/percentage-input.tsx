import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { InfoTooltip } from './info-tooltip';

interface PercentageInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  tooltip?: string;
  suffix?: string;
}

export function PercentageInput({ label, value, onChange, min, max, step, tooltip, suffix = '%' }: PercentageInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">
          {label}
          {tooltip && <InfoTooltip text={tooltip} />}
        </Label>
        <span className="text-sm font-medium tabular-nums">
          {value.toFixed(step < 1 ? 1 : 0)}{suffix}
        </span>
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
