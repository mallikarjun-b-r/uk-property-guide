import type { DashboardResult } from '@/types/buy-vs-rent';
import { SCENARIO_COLORS } from '@/types/buy-vs-rent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils/format';

interface CumulativeCostChartProps {
  result: DashboardResult;
}

export function CumulativeCostChart({ result }: CumulativeCostChartProps) {
  const { multiScenarioData, toggles, sellAfterYear, switchYear } = result;

  const chartData = multiScenarioData.map((d) => {
    const entry: Record<string, string | number> = {
      year: `Year ${d.year}`,
      'Buying Costs': Math.round(d.buyAndHoldCostCumulative),
      'Renting Costs': Math.round(d.rentCostCumulative),
    };
    return entry;
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Cumulative Costs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(v) => formatCurrency(v)}
              />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Legend />
              {toggles.sellAndRebuy && sellAfterYear && (
                <ReferenceLine
                  x={`Year ${sellAfterYear}`}
                  stroke={SCENARIO_COLORS.sellAndRebuy}
                  strokeDasharray="4 4"
                  label={{ value: 'Sell', position: 'top', fontSize: 10, fill: SCENARIO_COLORS.sellAndRebuy }}
                />
              )}
              {toggles.keepAndRentOut && switchYear && (
                <ReferenceLine
                  x={`Year ${switchYear}`}
                  stroke={SCENARIO_COLORS.keepAndRentOut}
                  strokeDasharray="4 4"
                  label={{ value: 'Switch', position: 'top', fontSize: 10, fill: SCENARIO_COLORS.keepAndRentOut }}
                />
              )}
              <Area
                type="monotone"
                dataKey="Buying Costs"
                stroke={SCENARIO_COLORS.buyAndHold}
                fill={SCENARIO_COLORS.buyAndHold}
                fillOpacity={0.15}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="Renting Costs"
                stroke={SCENARIO_COLORS.rent}
                fill={SCENARIO_COLORS.rent}
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
