import { describe, it, expect } from 'vitest';
import { runSimulation } from '../../../src/lib/calculators/buy-vs-rent';
import { DEFAULT_PARAMS } from '../../../src/types/buy-vs-rent';

describe('runSimulation', () => {
  it('returns correct number of years in breakdown', () => {
    const result = runSimulation(DEFAULT_PARAMS);
    expect(result.yearlyBreakdown).toHaveLength(DEFAULT_PARAMS.simulationYears);
  });

  it('calculates stamp duty for default params (£250k standard)', () => {
    const result = runSimulation(DEFAULT_PARAMS);
    expect(result.stampDuty).toBe(2500);
  });

  it('calculates stamp duty for FTB at £400k', () => {
    const result = runSimulation({
      ...DEFAULT_PARAMS,
      propertyPrice: 400000,
      isFirstTimeBuyer: true,
    });
    expect(result.stampDuty).toBe(5000);
  });

  it('property value increases each year', () => {
    const result = runSimulation(DEFAULT_PARAMS);
    for (let i = 1; i < result.yearlyBreakdown.length; i++) {
      expect(result.yearlyBreakdown[i].propertyValue).toBeGreaterThan(
        result.yearlyBreakdown[i - 1].propertyValue
      );
    }
  });

  it('mortgage balance decreases each year', () => {
    const result = runSimulation(DEFAULT_PARAMS);
    for (let i = 1; i < result.yearlyBreakdown.length; i++) {
      expect(result.yearlyBreakdown[i].mortgageBalance).toBeLessThan(
        result.yearlyBreakdown[i - 1].mortgageBalance
      );
    }
  });

  it('cumulative buying costs increase each year', () => {
    const result = runSimulation(DEFAULT_PARAMS);
    for (let i = 1; i < result.yearlyBreakdown.length; i++) {
      expect(result.yearlyBreakdown[i].buyingCostCumulative).toBeGreaterThan(
        result.yearlyBreakdown[i - 1].buyingCostCumulative
      );
    }
  });

  it('cumulative renting costs increase each year', () => {
    const result = runSimulation(DEFAULT_PARAMS);
    for (let i = 1; i < result.yearlyBreakdown.length; i++) {
      expect(result.yearlyBreakdown[i].rentCostCumulative).toBeGreaterThan(
        result.yearlyBreakdown[i - 1].rentCostCumulative
      );
    }
  });

  it('rent increases year over year', () => {
    const result = runSimulation(DEFAULT_PARAMS);
    for (let i = 1; i < result.yearlyBreakdown.length; i++) {
      expect(result.yearlyBreakdown[i].monthlyRentThisYear).toBeGreaterThan(
        result.yearlyBreakdown[i - 1].monthlyRentThisYear
      );
    }
  });

  it('verdict is either buy or rent', () => {
    const result = runSimulation(DEFAULT_PARAMS);
    expect(['buy', 'rent']).toContain(result.verdict);
  });

  it('monthly mortgage payment is positive', () => {
    const result = runSimulation(DEFAULT_PARAMS);
    expect(result.monthlyMortgagePayment).toBeGreaterThan(0);
  });

  it('handles 1 year simulation', () => {
    const result = runSimulation({ ...DEFAULT_PARAMS, simulationYears: 1 });
    expect(result.yearlyBreakdown).toHaveLength(1);
  });

  it('handles very high property growth favouring buying', () => {
    const result = runSimulation({
      ...DEFAULT_PARAMS,
      annualPropertyGrowth: 15,
      investmentReturnRate: 2,
    });
    expect(result.verdict).toBe('buy');
  });

  it('handles very high investment returns favouring renting', () => {
    const result = runSimulation({
      ...DEFAULT_PARAMS,
      annualPropertyGrowth: 0,
      investmentReturnRate: 15,
      monthlyRent: 500,
    });
    expect(result.verdict).toBe('rent');
  });
});
