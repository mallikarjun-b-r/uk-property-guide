import type {
  BuyVsRentParams,
  SellAndRebuyParams,
  KeepAndRentOutParams,
  ScenarioToggles,
  DashboardResult,
  MultiScenarioYearlyData,
  ScenarioRanking,
} from '@/types/buy-vs-rent';
import { SCENARIO_COLORS, SCENARIO_LABELS } from '@/types/buy-vs-rent';
import { runSimulation } from './buy-vs-rent';
import { runSellAndRebuySimulation } from './sell-and-rebuy';
import { runKeepAndRentOutSimulation } from './keep-and-rent-out';

export function runDashboard(
  baseParams: BuyVsRentParams,
  toggles: ScenarioToggles,
  sellAndRebuyParams: SellAndRebuyParams,
  keepAndRentOutParams: KeepAndRentOutParams
): DashboardResult {
  // Always run base simulation (Just Rent + Buy & Hold)
  const baseResult = runSimulation(baseParams);

  // Conditionally run new scenarios
  const sellAndRebuyData = toggles.sellAndRebuy
    ? runSellAndRebuySimulation(baseParams, sellAndRebuyParams)
    : undefined;

  const keepAndRentOutData = toggles.keepAndRentOut
    ? runKeepAndRentOutSimulation(baseParams, keepAndRentOutParams)
    : undefined;

  // Build unified multi-scenario data for charts
  const multiScenarioData: MultiScenarioYearlyData[] = baseResult.yearlyBreakdown.map((row, i) => {
    const entry: MultiScenarioYearlyData = {
      year: row.year,
      rentNetWealth: row.rentNetWealth,
      buyAndHoldNetWealth: row.buyNetWealth,
      rentCostCumulative: row.rentCostCumulative,
      buyAndHoldCostCumulative: row.buyingCostCumulative,
    };

    if (sellAndRebuyData && sellAndRebuyData[i]) {
      entry.sellAndRebuyNetWealth = sellAndRebuyData[i].netWealth;
      entry.sellAndRebuyCostCumulative = sellAndRebuyData[i].netWealth; // Use net wealth as proxy
    }

    if (keepAndRentOutData && keepAndRentOutData[i]) {
      entry.keepAndRentOutNetWealth = keepAndRentOutData[i].netWealth;
      entry.keepAndRentOutCostCumulative = keepAndRentOutData[i].netWealth; // Use net wealth as proxy
    }

    return entry;
  });

  // Build rankings based on final year net wealth
  const finalYear = baseResult.yearlyBreakdown[baseResult.yearlyBreakdown.length - 1];
  const rankings: ScenarioRanking[] = [
    {
      key: 'rent',
      label: SCENARIO_LABELS.rent,
      netWealth: finalYear?.rentNetWealth ?? 0,
      color: SCENARIO_COLORS.rent,
    },
    {
      key: 'buyAndHold',
      label: SCENARIO_LABELS.buyAndHold,
      netWealth: finalYear?.buyNetWealth ?? 0,
      color: SCENARIO_COLORS.buyAndHold,
    },
  ];

  if (toggles.sellAndRebuy && sellAndRebuyData) {
    const finalSellRebuy = sellAndRebuyData[sellAndRebuyData.length - 1];
    rankings.push({
      key: 'sellAndRebuy',
      label: SCENARIO_LABELS.sellAndRebuy,
      netWealth: finalSellRebuy?.netWealth ?? 0,
      color: SCENARIO_COLORS.sellAndRebuy,
    });
  }

  if (toggles.keepAndRentOut && keepAndRentOutData) {
    const finalKeepRent = keepAndRentOutData[keepAndRentOutData.length - 1];
    rankings.push({
      key: 'keepAndRentOut',
      label: SCENARIO_LABELS.keepAndRentOut,
      netWealth: finalKeepRent?.netWealth ?? 0,
      color: SCENARIO_COLORS.keepAndRentOut,
    });
  }

  // Sort descending by net wealth
  rankings.sort((a, b) => b.netWealth - a.netWealth);

  return {
    baseResult,
    sellAndRebuyData,
    keepAndRentOutData,
    multiScenarioData,
    rankings,
    toggles,
    sellAfterYear: toggles.sellAndRebuy ? sellAndRebuyParams.sellAfterYear : undefined,
    switchYear: toggles.keepAndRentOut ? keepAndRentOutParams.switchYear : undefined,
  };
}
