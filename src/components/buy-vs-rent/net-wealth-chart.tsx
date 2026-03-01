import type { DashboardResult } from '@/types/buy-vs-rent';
import { SCENARIO_COLORS } from '@/types/buy-vs-rent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { InfoTooltip } from '@/components/shared/info-tooltip';
import { formatCurrency } from '@/lib/utils/format';

interface NetWealthChartProps {
  result: DashboardResult;
}

export function NetWealthChart({ result }: NetWealthChartProps) {
  const { multiScenarioData, toggles, sellAfterYear, switchYear } = result;

  const chartData = multiScenarioData.map((d) => {
    const entry: Record<string, string | number> = {
      year: `Year ${d.year}`,
      yearNum: d.year,
      'Just Rent': Math.round(d.rentNetWealth),
      'Buy & Hold': Math.round(d.buyAndHoldNetWealth),
    };
    if (toggles.sellAndRebuy && d.sellAndRebuyNetWealth != null) {
      entry['Sell & Rebuy'] = Math.round(d.sellAndRebuyNetWealth);
    }
    if (toggles.keepAndRentOut && d.keepAndRentOutNetWealth != null) {
      entry['Keep & Rent Out'] = Math.round(d.keepAndRentOutNetWealth);
    }
    return entry;
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Net Wealth Over Time
          <InfoTooltip text="Buy & Hold = property equity. Just Rent = investment pot (upfront costs + monthly savings, compounding). Sell & Rebuy = equity + cash reserve. Keep & Rent Out = combined equity + cash position (includes opportunity cost of capital)." />
        </CardTitle>
        <p className="text-xs text-muted-foreground">Total assets per scenario, accounting for opportunity cost of capital deployed</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
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
              <Line
                type="monotone"
                dataKey="Buy & Hold"
                stroke={SCENARIO_COLORS.buyAndHold}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Just Rent"
                stroke={SCENARIO_COLORS.rent}
                strokeWidth={2}
                dot={false}
              />
              {toggles.sellAndRebuy && (
                <Line
                  type="monotone"
                  dataKey="Sell & Rebuy"
                  stroke={SCENARIO_COLORS.sellAndRebuy}
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false}
                />
              )}
              {toggles.keepAndRentOut && (
                <Line
                  type="monotone"
                  dataKey="Keep & Rent Out"
                  stroke={SCENARIO_COLORS.keepAndRentOut}
                  strokeWidth={2}
                  strokeDasharray="6 3"
                  dot={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
