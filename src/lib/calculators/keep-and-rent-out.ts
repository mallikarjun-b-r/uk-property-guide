import type {
  BuyVsRentParams,
  KeepAndRentOutParams,
  KeepAndRentOutYearlyData,
} from '@/types/buy-vs-rent';
import { calculateStampDutyAdditionalProperty } from './stamp-duty';
import { calculateMonthlyPayment, calculateMortgageBalanceAfterYear } from './mortgage';
import { FIXED_COSTS } from '@/lib/data/tax-rates';

export function runKeepAndRentOutSimulation(
  baseParams: BuyVsRentParams,
  keepParams: KeepAndRentOutParams
): KeepAndRentOutYearlyData[] {
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
    switchYear,
    monthlyRentalIncome,
    annualRentalIncrease,
    lettingAgentFeePercent,
    voidWeeksPerYear,
    landlordInsurance,
    propertyBPrice,
    propertyBDepositPercent,
    propertyBMortgageRate,
    propertyBMortgageTerm,
  } = keepParams;

  // Property A mortgage
  const depositA = propertyPrice * (depositPercent / 100);
  const mortgagePrincipalA = propertyPrice - depositA;

  // Property B mortgage
  const depositB = propertyBPrice * (propertyBDepositPercent / 100);
  const mortgagePrincipalB = propertyBPrice - depositB;
  const monthlyMortgagePaymentB = calculateMonthlyPayment(
    mortgagePrincipalB,
    propertyBMortgageRate,
    propertyBMortgageTerm
  );

  // Stamp duty for property B uses additional property surcharge (owning 2 properties)
  const stampDutyB = calculateStampDutyAdditionalProperty(propertyBPrice);
  const upfrontCostsB = depositB + stampDutyB + FIXED_COSTS.legalFees + FIXED_COSTS.surveyFees;

  const monthlyInvestmentReturn = investmentReturnRate / 100 / 12;

  const result: KeepAndRentOutYearlyData[] = [];

  // cashPosition tracks the cumulative financial impact of buying property B.
  // It starts at -upfrontCostsB (money spent on deposit + stamp duty + fees)
  // and each month is adjusted by rental income minus the extra costs of owning B.
  // It compounds at the investment return rate (opportunity cost of capital).
  let cashPosition = 0;

  for (let year = 1; year <= simulationYears; year++) {
    // Property A always grows and its mortgage always decreases
    const propertyAValue = propertyPrice * Math.pow(1 + annualPropertyGrowth / 100, year);
    const mortgageBalanceA = year <= mortgageTerm
      ? calculateMortgageBalanceAfterYear(mortgagePrincipalA, mortgageRate, mortgageTerm, year)
      : 0;
    const equityA = propertyAValue - mortgageBalanceA;

    if (year < switchYear) {
      // Phase: live-in-a — identical to Buy & Hold, no extra cash flows
      result.push({
        year,
        netWealth: equityA,
        propertyAValue,
        propertyAMortgageBalance: mortgageBalanceA,
        propertyAEquity: equityA,
        propertyBValue: 0,
        propertyBMortgageBalance: 0,
        propertyBEquity: 0,
        rentalIncome: 0,
        cashPosition: 0,
        phase: 'live-in-a',
      });
    } else {
      // Phase: two-properties
      const yearsSinceSwitchForB = year - switchYear;

      // At switch year, spend upfront costs for B
      if (year === switchYear) {
        cashPosition = -upfrontCostsB;
      }

      // Property B grows from its purchase time
      const propertyBValue = propertyBPrice * Math.pow(1 + annualPropertyGrowth / 100, yearsSinceSwitchForB);
      const mortgageBalanceB = yearsSinceSwitchForB <= propertyBMortgageTerm
        ? calculateMortgageBalanceAfterYear(
            mortgagePrincipalB,
            propertyBMortgageRate,
            propertyBMortgageTerm,
            yearsSinceSwitchForB
          )
        : 0;
      const equityB = propertyBValue - mortgageBalanceB;

      // Rental income from property A (net of agent fees, voids, landlord insurance)
      const yearsSinceRenting = year - switchYear;
      const monthlyRent = monthlyRentalIncome * Math.pow(1 + annualRentalIncrease / 100, yearsSinceRenting);
      const occupiedWeeks = 52 - voidWeeksPerYear;
      const grossRentalIncome = monthlyRent * 12 * (occupiedWeeks / 52);
      const agentFee = grossRentalIncome * (lettingAgentFeePercent / 100);
      const netRentalIncomeYearly = grossRentalIncome - agentFee - landlordInsurance;

      // Monthly costs of owning property B (these are ADDITIONAL costs beyond Buy & Hold)
      const currentPropertyBValue = yearsSinceSwitchForB > 0
        ? propertyBPrice * Math.pow(1 + annualPropertyGrowth / 100, yearsSinceSwitchForB - 1)
        : propertyBPrice;
      const maintenanceCostB = currentPropertyBValue * (annualMaintenancePercent / 100);
      const monthlyMortgageB = yearsSinceSwitchForB <= propertyBMortgageTerm ? monthlyMortgagePaymentB : 0;

      // Each month: compound cash position, add rental income, subtract property B costs
      for (let m = 0; m < 12; m++) {
        cashPosition *= 1 + monthlyInvestmentReturn;
        cashPosition += netRentalIncomeYearly / 12;
        cashPosition -= monthlyMortgageB + maintenanceCostB / 12 + FIXED_COSTS.annualInsurance / 12;
      }

      // Net wealth = equity in both properties + cash position
      // (cash position is typically negative, reflecting the true cost of owning 2 properties)
      const netWealth = equityA + equityB + cashPosition;

      result.push({
        year,
        netWealth,
        propertyAValue,
        propertyAMortgageBalance: mortgageBalanceA,
        propertyAEquity: equityA,
        propertyBValue,
        propertyBMortgageBalance: mortgageBalanceB,
        propertyBEquity: equityB,
        rentalIncome: netRentalIncomeYearly,
        cashPosition,
        phase: 'two-properties',
      });
    }
  }

  return result;
}
