import type { BuyVsRentParams, YearlyBreakdown, SimulationResult } from '@/types/buy-vs-rent';
import { calculateStampDuty } from './stamp-duty';
import { calculateMonthlyPayment, calculateMortgageBalanceAfterYear } from './mortgage';
import { FIXED_COSTS } from '@/lib/data/tax-rates';

export function runSimulation(params: BuyVsRentParams): SimulationResult {
  const {
    propertyPrice,
    depositPercent,
    mortgageRate,
    mortgageTerm,
    monthlyRent,
    annualRentIncrease,
    annualPropertyGrowth,
    annualMaintenancePercent,
    investmentReturnRate,
    simulationYears,
    isFirstTimeBuyer,
  } = params;

  const deposit = propertyPrice * (depositPercent / 100);
  const mortgagePrincipal = propertyPrice - deposit;
  const stampDuty = calculateStampDuty(propertyPrice, isFirstTimeBuyer);
  const totalUpfrontCosts = deposit + stampDuty + FIXED_COSTS.legalFees + FIXED_COSTS.surveyFees;
  const monthlyMortgagePayment = calculateMonthlyPayment(
    mortgagePrincipal,
    mortgageRate,
    mortgageTerm
  );

  const yearlyBreakdown: YearlyBreakdown[] = [];
  let buyingCostCumulative = totalUpfrontCosts;
  let rentCostCumulative = 0;

  // The renter invests the deposit + upfront costs (minus deposit since buyer uses it)
  // Actually: renter has the full amount that the buyer spent upfront, invested
  let investmentPot = totalUpfrontCosts;

  const monthlyInvestmentReturn = investmentReturnRate / 100 / 12;

  for (let year = 1; year <= simulationYears; year++) {
    // --- BUYING ---
    const propertyValue = propertyPrice * Math.pow(1 + annualPropertyGrowth / 100, year);

    // Mortgage balance: if simulation year exceeds mortgage term, balance is 0
    const mortgageBalance =
      year <= mortgageTerm
        ? calculateMortgageBalanceAfterYear(mortgagePrincipal, mortgageRate, mortgageTerm, year)
        : 0;

    const equity = propertyValue - mortgageBalance;

    // Yearly mortgage payment (could be less in final year or if term ended)
    const mortgagePaymentYearly =
      year <= mortgageTerm ? monthlyMortgagePayment * 12 : 0;

    const currentPropertyValue = propertyPrice * Math.pow(1 + annualPropertyGrowth / 100, year - 1);
    const maintenanceCost = currentPropertyValue * (annualMaintenancePercent / 100);

    buyingCostCumulative += mortgagePaymentYearly + maintenanceCost + FIXED_COSTS.annualInsurance;

    // --- RENTING ---
    const monthlyRentThisYear = monthlyRent * Math.pow(1 + annualRentIncrease / 100, year - 1);
    const rentCostYearly = monthlyRentThisYear * 12;
    rentCostCumulative += rentCostYearly;

    // Investment: renter invests monthly savings (mortgage payment + maintenance + insurance - rent)
    // Apply monthly compounding
    for (let m = 0; m < 12; m++) {
      // Compound existing pot
      investmentPot *= 1 + monthlyInvestmentReturn;

      // Monthly saving = what the buyer pays minus what the renter pays
      const buyerMonthlySpend =
        (year <= mortgageTerm ? monthlyMortgagePayment : 0) +
        maintenanceCost / 12 +
        FIXED_COSTS.annualInsurance / 12;
      const monthlySaving = buyerMonthlySpend - monthlyRentThisYear;

      // Only invest positive savings (if renting is cheaper than buying)
      if (monthlySaving > 0) {
        investmentPot += monthlySaving;
      }
    }

    // --- COMPARISON ---
    // Buy net wealth: equity (property value - mortgage) already accounts for the deposit
    // We subtract cumulative costs beyond the deposit (which converted to equity)
    const buyNetWealth = equity;

    // Rent net wealth: investment pot
    const rentNetWealth = investmentPot;

    const netDifference = buyNetWealth - rentNetWealth;

    yearlyBreakdown.push({
      year,
      propertyValue,
      mortgageBalance,
      equity,
      mortgagePaymentYearly,
      maintenanceCost,
      buyingCostCumulative,
      monthlyRentThisYear,
      rentCostYearly,
      rentCostCumulative,
      investmentPot,
      buyNetWealth,
      rentNetWealth,
      netDifference,
    });
  }

  const finalYear = yearlyBreakdown[yearlyBreakdown.length - 1];
  const netDifference = finalYear ? finalYear.netDifference : 0;

  return {
    params,
    stampDuty,
    totalUpfrontCosts,
    monthlyMortgagePayment,
    yearlyBreakdown,
    verdict: netDifference >= 0 ? 'buy' : 'rent',
    netDifference,
  };
}
