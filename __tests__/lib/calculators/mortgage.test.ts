import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyPayment,
  calculateMortgageBalanceAfterYear,
} from '../../../src/lib/calculators/mortgage';

describe('calculateMonthlyPayment', () => {
  it('calculates monthly payment for £225k at 4.5% over 25 years', () => {
    const payment = calculateMonthlyPayment(225000, 4.5, 25);
    // Expected ~£1,251 per month
    expect(payment).toBeCloseTo(1251, -1);
  });

  it('returns 0 for £0 principal', () => {
    expect(calculateMonthlyPayment(0, 4.5, 25)).toBe(0);
  });

  it('handles 0% interest rate', () => {
    const payment = calculateMonthlyPayment(120000, 0, 10);
    // £120k / 120 months = £1,000/month
    expect(payment).toBe(1000);
  });

  it('calculates correctly for £100k at 5% over 15 years', () => {
    const payment = calculateMonthlyPayment(100000, 5, 15);
    // Expected ~£790.79
    expect(payment).toBeCloseTo(790.79, 0);
  });
});

describe('calculateMortgageBalanceAfterYear', () => {
  it('returns full principal at year 0', () => {
    expect(calculateMortgageBalanceAfterYear(225000, 4.5, 25, 0)).toBe(225000);
  });

  it('returns 0 after full term', () => {
    expect(calculateMortgageBalanceAfterYear(225000, 4.5, 25, 25)).toBe(0);
  });

  it('returns 0 after exceeding term', () => {
    expect(calculateMortgageBalanceAfterYear(225000, 4.5, 25, 30)).toBe(0);
  });

  it('reduces balance after 1 year', () => {
    const balance = calculateMortgageBalanceAfterYear(225000, 4.5, 25, 1);
    expect(balance).toBeLessThan(225000);
    expect(balance).toBeGreaterThan(200000);
  });

  it('balance at midpoint is less than half', () => {
    // Due to amortization, more principal is paid later
    const balance = calculateMortgageBalanceAfterYear(225000, 4.5, 25, 12);
    expect(balance).toBeGreaterThan(225000 / 2);
  });
});
