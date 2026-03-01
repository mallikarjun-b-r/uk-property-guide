import type {
  BuyVsRentParams,
  SellAndRebuyParams,
  SellAndRebuyYearlyData,
} from '@/types/buy-vs-rent';
import { calculateStampDuty } from './stamp-duty';
import { calculateMonthlyPayment, calculateMortgageBalanceAfterYear } from './mortgage';
import { FIXED_COSTS } from '@/lib/data/tax-rates';

export function runSellAndRebuySimulation(
  baseParams: BuyVsRentParams,
  sellParams: SellAndRebuyParams
): SellAndRebuyYearlyData[] {
  const {
    propertyPrice,
    depositPercent,
    mortgageRate,
    mortgageTerm,
    annualPropertyGrowth,
    annualMaintenancePercent,
    investmentReturnRate,
    simulationYears,
  } = baseParams;

  const {
    sellAfterYear,
    newPropertyPrice,
    sellingCostsPercent,
    newDepositPercent,
    newMortgageRate,
    newMortgageTerm,
  } = sellParams;

  // Property A mortgage
  const depositA = propertyPrice * (depositPercent / 100);
  const mortgagePrincipalA = propertyPrice - depositA;
  const monthlyMortgagePaymentA = calculateMonthlyPayment(mortgagePrincipalA, mortgageRate, mortgageTerm);

  const result: SellAndRebuyYearlyData[] = [];
  const monthlyInvestmentReturn = investmentReturnRate / 100 / 12;

  // Track property B state
  let propertyBMortgagePrincipal = 0;
  let monthlyMortgagePaymentB = 0;
  let cashReserve = 0;

  for (let year = 1; year <= simulationYears; year++) {
    if (year < sellAfterYear) {
      // Phase: hold-a — identical to Buy & Hold
      const propertyValue = propertyPrice * Math.pow(1 + annualPropertyGrowth / 100, year);
      const mortgageBalance = year <= mortgageTerm
        ? calculateMortgageBalanceAfterYear(mortgagePrincipalA, mortgageRate, mortgageTerm, year)
        : 0;
      const equity = propertyValue - mortgageBalance;

      result.push({
        year,
        netWealth: equity,
        propertyValue,
        mortgageBalance,
        equity,
        cashReserve: 0,
        phase: 'hold-a',
      });
    } else if (year === sellAfterYear) {
      // Phase: sold-buying-b — sell property A, buy property B
      const propertyAValue = propertyPrice * Math.pow(1 + annualPropertyGrowth / 100, year);
      const mortgageBalanceA = year <= mortgageTerm
        ? calculateMortgageBalanceAfterYear(mortgagePrincipalA, mortgageRate, mortgageTerm, year)
        : 0;
      const equityA = propertyAValue - mortgageBalanceA;

      // Selling costs
      const sellingCosts = propertyAValue * (sellingCostsPercent / 100);
      const saleProceeds = equityA - sellingCosts;

      // Buy property B — stamp duty at standard rates (not FTB since they already owned)
      const stampDutyB = calculateStampDuty(newPropertyPrice, false);
      const depositB = newPropertyPrice * (newDepositPercent / 100);
      const upfrontCostsB = depositB + stampDutyB + FIXED_COSTS.legalFees + FIXED_COSTS.surveyFees;

      propertyBMortgagePrincipal = newPropertyPrice - depositB;
      monthlyMortgagePaymentB = calculateMonthlyPayment(
        propertyBMortgagePrincipal,
        newMortgageRate,
        newMortgageTerm
      );

      // Leftover cash after buying B
      cashReserve = saleProceeds - upfrontCostsB;

      // Property B value at end of sell year
      const propertyBValue = newPropertyPrice;
      const equityB = propertyBValue - propertyBMortgagePrincipal;

      result.push({
        year,
        netWealth: equityB + cashReserve,
        propertyValue: propertyBValue,
        mortgageBalance: propertyBMortgagePrincipal,
        equity: equityB,
        cashReserve,
        phase: 'sold-buying-b',
      });
    } else {
      // Phase: hold-b — property B grows, mortgage decreases, cash reserve earns returns
      const yearsSincePurchaseB = year - sellAfterYear;
      const propertyBValue = newPropertyPrice * Math.pow(1 + annualPropertyGrowth / 100, yearsSincePurchaseB);
      const mortgageBalanceB = yearsSincePurchaseB <= newMortgageTerm
        ? calculateMortgageBalanceAfterYear(
            propertyBMortgagePrincipal,
            newMortgageRate,
            newMortgageTerm,
            yearsSincePurchaseB
          )
        : 0;
      const equityB = propertyBValue - mortgageBalanceB;

      // Cost differential: what would property A have cost this year vs. property B?
      // If B costs more to own, the person has less disposable income → reduces cash reserve.
      // If B costs less, surplus flows into cash reserve.
      const currentPropertyAValue = propertyPrice * Math.pow(1 + annualPropertyGrowth / 100, year - 1);
      const maintenanceCostA = currentPropertyAValue * (annualMaintenancePercent / 100);
      const monthlyCostA =
        (year <= mortgageTerm ? monthlyMortgagePaymentA : 0) +
        maintenanceCostA / 12 +
        FIXED_COSTS.annualInsurance / 12;

      const currentPropertyBValue = newPropertyPrice * Math.pow(1 + annualPropertyGrowth / 100, yearsSincePurchaseB - 1);
      const maintenanceCostB = currentPropertyBValue * (annualMaintenancePercent / 100);
      const monthlyCostB =
        (yearsSincePurchaseB <= newMortgageTerm ? monthlyMortgagePaymentB : 0) +
        maintenanceCostB / 12 +
        FIXED_COSTS.annualInsurance / 12;

      for (let m = 0; m < 12; m++) {
        // Cash reserve compounds at investment rate
        cashReserve *= 1 + monthlyInvestmentReturn;
        // Surplus/deficit from cost difference flows into cash reserve
        // If A would have cost more → positive surplus saved
        // If B costs more → negative deficit spent from reserve
        cashReserve += monthlyCostA - monthlyCostB;
      }

      result.push({
        year,
        netWealth: equityB + cashReserve,
        propertyValue: propertyBValue,
        mortgageBalance: mortgageBalanceB,
        equity: equityB,
        cashReserve,
        phase: 'hold-b',
      });
    }
  }

  return result;
}
