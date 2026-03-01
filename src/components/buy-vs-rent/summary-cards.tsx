import type { DashboardResult } from '@/types/buy-vs-rent';
import { SCENARIO_COLORS } from '@/types/buy-vs-rent';
import { Card, CardContent } from '@/components/ui/card';
import { InfoTooltip } from '@/components/shared/info-tooltip';
import { formatCurrency } from '@/lib/utils/format';

interface SummaryCardsProps {
  result: DashboardResult;
}

interface MetricCardProps {
  label: string;
  value: string;
  sublabel?: string;
  accentColor?: string;
  tooltip?: string;
}

function MetricCard({ label, value, sublabel, accentColor, tooltip }: MetricCardProps) {
  return (
    <Card style={accentColor ? { borderTopColor: accentColor, borderTopWidth: 2 } : undefined}>
      <CardContent className="py-4 px-4">
        <p className="text-xs text-muted-foreground">
          {label}
          {tooltip && <InfoTooltip text={tooltip} />}
        </p>
        <p className="text-lg font-bold tabular-nums mt-0.5">{value}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </CardContent>
    </Card>
  );
}

export function SummaryCards({ result }: SummaryCardsProps) {
  const { baseResult, sellAndRebuyData, keepAndRentOutData, toggles } = result;
  const final = baseResult.yearlyBreakdown[baseResult.yearlyBreakdown.length - 1];
  if (!final) return null;

  const cards = [
    <MetricCard
      key="buy-cost"
      label="Total cost of buying"
      value={formatCurrency(final.buyingCostCumulative)}
      tooltip="Upfront costs (deposit + stamp duty + fees) + all mortgage payments + maintenance + insurance over the period"
    />,
    <MetricCard
      key="rent-cost"
      label="Total cost of renting"
      value={formatCurrency(final.rentCostCumulative)}
      tooltip="Sum of all monthly rent paid over the period, increasing each year"
    />,
    <MetricCard
      key="equity"
      label="Buy & Hold net wealth"
      value={formatCurrency(final.equity)}
      sublabel={`Property: ${formatCurrency(final.propertyValue)}`}
      accentColor={SCENARIO_COLORS.buyAndHold}
      tooltip="Property value - remaining mortgage. The deposit converts to equity; stamp duty and fees are sunk costs not recovered."
    />,
    <MetricCard
      key="investment"
      label="Just Rent net wealth"
      value={formatCurrency(final.investmentPot)}
      accentColor={SCENARIO_COLORS.rent}
      tooltip="Investment pot that starts with the buyer's upfront costs (deposit + stamp duty + fees), then each month compounds at the investment return rate and adds the surplus (buyer's monthly cost - rent) when renting is cheaper."
    />,
  ];

  if (toggles.sellAndRebuy && sellAndRebuyData) {
    const finalSR = sellAndRebuyData[sellAndRebuyData.length - 1];
    if (finalSR) {
      const cashLabel = finalSR.cashReserve >= 0
        ? `Cash: ${formatCurrency(finalSR.cashReserve)}`
        : `Cash: -${formatCurrency(Math.abs(finalSR.cashReserve))}`;
      cards.push(
        <MetricCard
          key="sell-rebuy"
          label="Sell & Rebuy net wealth"
          value={formatCurrency(finalSR.netWealth)}
          sublabel={`Equity: ${formatCurrency(finalSR.equity)} | ${cashLabel}`}
          accentColor={SCENARIO_COLORS.sellAndRebuy}
          tooltip="Property B equity + cash reserve. Cash reserve = sale proceeds from A minus purchase costs of B, growing at investment rate, adjusted for cost differences between properties."
        />
      );
    }
  }

  if (toggles.keepAndRentOut && keepAndRentOutData) {
    const finalKR = keepAndRentOutData[keepAndRentOutData.length - 1];
    if (finalKR) {
      const cashLabel = finalKR.cashPosition >= 0
        ? `Cash: ${formatCurrency(finalKR.cashPosition)}`
        : `Cash: -${formatCurrency(Math.abs(finalKR.cashPosition))}`;
      cards.push(
        <MetricCard
          key="keep-rent"
          label="Keep & Rent Out net wealth"
          value={formatCurrency(finalKR.netWealth)}
          sublabel={`Equity: ${formatCurrency(finalKR.propertyAEquity + finalKR.propertyBEquity)} | ${cashLabel}`}
          accentColor={SCENARIO_COLORS.keepAndRentOut}
          tooltip="Combined equity (A + B) + cash position. Cash starts negative (deposit + stamp duty + fees for B), then each month adds rental income and subtracts Property B costs (mortgage, maintenance, insurance). Compounds at investment rate."
        />
      );
    }
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      {cards}
    </div>
  );
}
