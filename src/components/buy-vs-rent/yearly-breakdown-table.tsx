import { useState } from 'react';
import type { DashboardResult } from '@/types/buy-vs-rent';
import { SCENARIO_COLORS } from '@/types/buy-vs-rent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils/format';
import { InfoTooltip } from '@/components/shared/info-tooltip';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { FIXED_COSTS } from '@/lib/data/tax-rates';

interface YearlyBreakdownTableProps {
  result: DashboardResult;
}

export function YearlyBreakdownTable({ result }: YearlyBreakdownTableProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { baseResult, sellAndRebuyData, keepAndRentOutData, toggles, sellAfterYear, switchYear } = result;
  const data = baseResult.yearlyBreakdown;

  const showSellRebuy = toggles.sellAndRebuy && sellAndRebuyData;
  const showKeepRent = toggles.keepAndRentOut && keepAndRentOutData;

  return (
    <Card>
      <CardHeader
        className="pb-2 cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Year-by-Year Breakdown</CardTitle>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              {/* Group headers */}
              <tr className="border-b text-center">
                <th />
                <th colSpan={5} className="py-1 px-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: SCENARIO_COLORS.buyAndHold }}>
                  Buy & Hold
                </th>
                <th colSpan={4} className="py-1 px-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: SCENARIO_COLORS.rent }}>
                  Just Rent
                </th>
                <th className="py-1 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  vs
                </th>
                {showSellRebuy && (
                  <th colSpan={3} className="py-1 px-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: SCENARIO_COLORS.sellAndRebuy }}>
                    Sell & Rebuy
                  </th>
                )}
                {showKeepRent && (
                  <th colSpan={3} className="py-1 px-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: SCENARIO_COLORS.keepAndRentOut }}>
                    Keep & Rent Out
                  </th>
                )}
              </tr>
              {/* Column headers */}
              <tr className="border-b text-left">
                <th className="py-2 px-2 font-medium">Year</th>
                {/* Buy & Hold columns */}
                <th className="py-2 px-2 font-medium text-right">
                  Property
                  <InfoTooltip text="Property value after annual growth: Price x (1 + growth%)^year" />
                </th>
                <th className="py-2 px-2 font-medium text-right">
                  Mortgage
                  <InfoTooltip text="Remaining mortgage balance after amortisation payments" />
                </th>
                <th className="py-2 px-2 font-medium text-right" style={{ color: SCENARIO_COLORS.buyAndHold }}>
                  Equity
                  <InfoTooltip text="Buy & Hold net wealth = Property Value - Mortgage Balance. This is the buyer's total asset." />
                </th>
                <th className="py-2 px-2 font-medium text-right">
                  Cost/mo
                  <InfoTooltip text="Buyer's total monthly outgoing: mortgage payment + maintenance/12 + insurance/12" />
                </th>
                <th className="py-2 px-2 font-medium text-right">
                  Cost total
                  <InfoTooltip text="Cumulative cost of buying: upfront costs + all mortgage payments + maintenance + insurance" />
                </th>
                {/* Just Rent columns */}
                <th className="py-2 px-2 font-medium text-right">
                  Rent/mo
                  <InfoTooltip text="Monthly rent, increasing each year by the annual rent increase %" />
                </th>
                <th className="py-2 px-2 font-medium text-right">
                  Saving/mo
                  <InfoTooltip text="Monthly surplus the renter invests: (buyer cost/mo) - (rent/mo). Only invested when positive (renting is cheaper)." />
                </th>
                <th className="py-2 px-2 font-medium text-right" style={{ color: SCENARIO_COLORS.rent }}>
                  Inv. Pot
                  <InfoTooltip text="Just Rent net wealth = investment pot. Starts with upfront costs (deposit + stamp duty + fees), then each month: compounds at investment return rate + adds monthly saving." />
                </th>
                <th className="py-2 px-2 font-medium text-right">
                  Rent total
                  <InfoTooltip text="Cumulative cost of renting: sum of all rent paid" />
                </th>
                {/* Comparison */}
                <th className="py-2 px-2 font-medium text-right">
                  Diff
                  <InfoTooltip text="Buy & Hold equity minus Just Rent investment pot. Positive = buying wins, negative = renting wins." />
                </th>
                {/* Sell & Rebuy */}
                {showSellRebuy && (
                  <>
                    <th className="py-2 px-2 font-medium text-right" style={{ color: SCENARIO_COLORS.sellAndRebuy }}>
                      Equity
                      <InfoTooltip text="Before sell: same as Buy & Hold. After sell: Property B value - Property B mortgage." />
                    </th>
                    <th className="py-2 px-2 font-medium text-right" style={{ color: SCENARIO_COLORS.sellAndRebuy }}>
                      Cash
                      <InfoTooltip text="Cash reserve from sale proceeds minus Property B purchase costs. Grows at investment rate, adjusted for cost differences between A and B." />
                    </th>
                    <th className="py-2 px-2 font-medium text-right font-semibold" style={{ color: SCENARIO_COLORS.sellAndRebuy }}>
                      Wealth
                      <InfoTooltip text="S&R net wealth = Property equity + cash reserve. Represents total assets after selling A and buying B." />
                    </th>
                  </>
                )}
                {/* Keep & Rent Out */}
                {showKeepRent && (
                  <>
                    <th className="py-2 px-2 font-medium text-right" style={{ color: SCENARIO_COLORS.keepAndRentOut }}>
                      Equity
                      <InfoTooltip text="Before switch: Property A equity. After switch: Property A equity + Property B equity." />
                    </th>
                    <th className="py-2 px-2 font-medium text-right" style={{ color: SCENARIO_COLORS.keepAndRentOut }}>
                      Cash
                      <InfoTooltip text="Starts at negative (upfront costs for B). Each month: compounds at investment rate + rental income - mortgage B - maintenance B - insurance B." />
                    </th>
                    <th className="py-2 px-2 font-medium text-right font-semibold" style={{ color: SCENARIO_COLORS.keepAndRentOut }}>
                      Wealth
                      <InfoTooltip text="K&R net wealth = combined equity + cash position. Cash is typically negative (cost of owning 2 properties), offset by rental income." />
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const isSellYear = showSellRebuy && row.year === sellAfterYear;
                const isSwitchYear = showKeepRent && row.year === switchYear;
                const isHighlighted = isSellYear || isSwitchYear;

                // Compute derived values for this row
                const buyerMonthlyCost =
                  row.mortgagePaymentYearly / 12 +
                  row.maintenanceCost / 12 +
                  FIXED_COSTS.annualInsurance / 12;
                const monthlySaving = buyerMonthlyCost - row.monthlyRentThisYear;

                return (
                  <tr
                    key={row.year}
                    className={`border-b last:border-0 hover:bg-muted/50 ${
                      isHighlighted ? 'bg-amber-50/50' : ''
                    }`}
                  >
                    <td className="py-2 px-2 whitespace-nowrap">
                      {row.year}
                      {isSellYear && <span className="ml-1 text-[10px]" style={{ color: SCENARIO_COLORS.sellAndRebuy }}>Sell</span>}
                      {isSwitchYear && <span className="ml-1 text-[10px]" style={{ color: SCENARIO_COLORS.keepAndRentOut }}>Switch</span>}
                    </td>
                    {/* Buy & Hold */}
                    <td className="py-2 px-2 text-right tabular-nums">{formatCurrency(row.propertyValue)}</td>
                    <td className="py-2 px-2 text-right tabular-nums">{formatCurrency(row.mortgageBalance)}</td>
                    <td className="py-2 px-2 text-right tabular-nums font-medium" style={{ color: SCENARIO_COLORS.buyAndHold }}>
                      {formatCurrency(row.equity)}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums">{formatCurrency(buyerMonthlyCost, true)}</td>
                    <td className="py-2 px-2 text-right tabular-nums">{formatCurrency(row.buyingCostCumulative)}</td>
                    {/* Just Rent */}
                    <td className="py-2 px-2 text-right tabular-nums">{formatCurrency(row.monthlyRentThisYear)}</td>
                    <td className={`py-2 px-2 text-right tabular-nums ${monthlySaving > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {monthlySaving >= 0 ? '+' : ''}{formatCurrency(monthlySaving, true)}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums font-medium" style={{ color: SCENARIO_COLORS.rent }}>
                      {formatCurrency(row.investmentPot)}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums">{formatCurrency(row.rentCostCumulative)}</td>
                    {/* Comparison */}
                    <td className={`py-2 px-2 text-right tabular-nums font-medium ${row.netDifference >= 0 ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {row.netDifference >= 0 ? '+' : ''}{formatCurrency(row.netDifference)}
                    </td>
                    {/* Sell & Rebuy */}
                    {showSellRebuy && sellAndRebuyData[i] && (
                      <>
                        <td className="py-2 px-2 text-right tabular-nums" style={{ color: SCENARIO_COLORS.sellAndRebuy }}>
                          {formatCurrency(sellAndRebuyData[i].equity)}
                        </td>
                        <td className={`py-2 px-2 text-right tabular-nums ${sellAndRebuyData[i].cashReserve >= 0 ? '' : 'text-red-500'}`}>
                          {sellAndRebuyData[i].cashReserve >= 0 ? '' : ''}{formatCurrency(sellAndRebuyData[i].cashReserve)}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums font-semibold" style={{ color: SCENARIO_COLORS.sellAndRebuy }}>
                          {formatCurrency(sellAndRebuyData[i].netWealth)}
                        </td>
                      </>
                    )}
                    {/* Keep & Rent Out */}
                    {showKeepRent && keepAndRentOutData[i] && (
                      <>
                        <td className="py-2 px-2 text-right tabular-nums" style={{ color: SCENARIO_COLORS.keepAndRentOut }}>
                          {formatCurrency(keepAndRentOutData[i].propertyAEquity + keepAndRentOutData[i].propertyBEquity)}
                        </td>
                        <td className={`py-2 px-2 text-right tabular-nums ${keepAndRentOutData[i].cashPosition >= 0 ? '' : 'text-red-500'}`}>
                          {formatCurrency(keepAndRentOutData[i].cashPosition)}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums font-semibold" style={{ color: SCENARIO_COLORS.keepAndRentOut }}>
                          {formatCurrency(keepAndRentOutData[i].netWealth)}
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      )}
    </Card>
  );
}
