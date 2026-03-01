import type { DashboardResult } from '@/types/buy-vs-rent';
import { Card, CardContent } from '@/components/ui/card';
import { InfoTooltip } from '@/components/shared/info-tooltip';
import { formatCurrency } from '@/lib/utils/format';

interface VerdictCardProps {
  result: DashboardResult;
}

export function VerdictCard({ result }: VerdictCardProps) {
  const { rankings, baseResult } = result;
  const years = baseResult.params.simulationYears;

  if (rankings.length === 0) return null;

  const best = rankings[0];

  return (
    <Card className="border-gray-300 bg-gray-50/50">
      <CardContent className="py-5">
        <p className="text-sm text-muted-foreground mb-3 text-center">
          After {years} year{years !== 1 ? 's' : ''}
          <InfoTooltip text="Ranked by net wealth: Buy & Hold = property equity. Just Rent = investment pot (upfront money + monthly savings invested). Other scenarios include property equity plus/minus cash flows from sales, purchases, and rental income." />
        </p>
        <div className="space-y-1.5">
          {rankings.map((scenario, idx) => (
            <div
              key={scenario.key}
              className={`flex items-center justify-between px-3 py-1.5 rounded-md ${
                idx === 0 ? 'font-bold' : ''
              }`}
              style={idx === 0 ? { backgroundColor: `${scenario.color}15` } : undefined}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-5">{idx + 1}.</span>
                <span
                  className="w-2.5 h-2.5 rounded-full inline-block"
                  style={{ backgroundColor: scenario.color }}
                />
                <span className="text-sm">{scenario.label}</span>
                {idx === 0 && (
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ color: scenario.color, backgroundColor: `${scenario.color}20` }}
                  >
                    Best
                  </span>
                )}
              </div>
              <span className="text-sm tabular-nums" style={idx === 0 ? { color: best.color } : undefined}>
                {formatCurrency(scenario.netWealth)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
