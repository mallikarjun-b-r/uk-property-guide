import type { DashboardResult } from '@/types/buy-vs-rent';
import { VerdictCard } from './verdict-card';
import { SummaryCards } from './summary-cards';
import { NetWealthChart } from './net-wealth-chart';
import { CumulativeCostChart } from './cumulative-cost-chart';
import { YearlyBreakdownTable } from './yearly-breakdown-table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils/format';

interface ResultsPanelProps {
  result: DashboardResult;
}

export function ResultsPanel({ result }: ResultsPanelProps) {
  const { baseResult } = result;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline">
          Stamp duty: {formatCurrency(baseResult.stampDuty)}
        </Badge>
        <Badge variant="outline">
          Monthly mortgage: {formatCurrency(baseResult.monthlyMortgagePayment, true)}
        </Badge>
        <Badge variant="outline">
          Upfront costs: {formatCurrency(baseResult.totalUpfrontCosts)}
        </Badge>
      </div>

      <VerdictCard result={result} />
      <SummaryCards result={result} />
      <NetWealthChart result={result} />
      <CumulativeCostChart result={result} />
      <YearlyBreakdownTable result={result} />
    </div>
  );
}
