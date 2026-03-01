export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  if (principal <= 0) return 0;
  if (annualRate <= 0) return principal / (termYears * 12);

  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  return payment;
}

export function calculateMortgageBalanceAfterYear(
  principal: number,
  annualRate: number,
  termYears: number,
  yearsElapsed: number
): number {
  if (principal <= 0 || yearsElapsed <= 0) return principal;
  if (yearsElapsed >= termYears) return 0;

  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears);

  if (annualRate <= 0) {
    const paymentsMade = yearsElapsed * 12;
    return principal - monthlyPayment * paymentsMade;
  }

  let balance = principal;
  const monthsElapsed = yearsElapsed * 12;

  for (let m = 0; m < monthsElapsed; m++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
  }

  return Math.max(0, balance);
}

export function calculateYearlyMortgageInterest(
  principal: number,
  annualRate: number,
  termYears: number,
  year: number
): number {
  if (annualRate <= 0) return 0;

  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears);

  // Get balance at start of the year
  let balance = principal;
  const monthsBeforeYear = (year - 1) * 12;

  for (let m = 0; m < monthsBeforeYear; m++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
  }

  // Sum interest for the 12 months of this year
  let yearlyInterest = 0;
  for (let m = 0; m < 12; m++) {
    if (balance <= 0) break;
    const interestPayment = balance * monthlyRate;
    yearlyInterest += interestPayment;
    const principalPayment = monthlyPayment - interestPayment;
    balance -= principalPayment;
  }

  return yearlyInterest;
}
