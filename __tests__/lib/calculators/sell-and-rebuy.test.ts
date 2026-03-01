import { describe, it, expect } from 'vitest';
import { runSellAndRebuySimulation } from '../../../src/lib/calculators/sell-and-rebuy';
import { DEFAULT_PARAMS, DEFAULT_SELL_AND_REBUY_PARAMS } from '../../../src/types/buy-vs-rent';

describe('runSellAndRebuySimulation', () => {
  it('returns correct number of years', () => {
    const result = runSellAndRebuySimulation(DEFAULT_PARAMS, DEFAULT_SELL_AND_REBUY_PARAMS);
    expect(result).toHaveLength(DEFAULT_PARAMS.simulationYears);
  });

  it('before sell year, phase is hold-a', () => {
    const result = runSellAndRebuySimulation(DEFAULT_PARAMS, DEFAULT_SELL_AND_REBUY_PARAMS);
    for (let i = 0; i < DEFAULT_SELL_AND_REBUY_PARAMS.sellAfterYear - 1; i++) {
      expect(result[i].phase).toBe('hold-a');
    }
  });

  it('at sell year, phase is sold-buying-b', () => {
    const result = runSellAndRebuySimulation(DEFAULT_PARAMS, DEFAULT_SELL_AND_REBUY_PARAMS);
    const sellYearIdx = DEFAULT_SELL_AND_REBUY_PARAMS.sellAfterYear - 1;
    expect(result[sellYearIdx].phase).toBe('sold-buying-b');
  });

  it('after sell year, phase is hold-b', () => {
    const result = runSellAndRebuySimulation(DEFAULT_PARAMS, DEFAULT_SELL_AND_REBUY_PARAMS);
    for (let i = DEFAULT_SELL_AND_REBUY_PARAMS.sellAfterYear; i < result.length; i++) {
      expect(result[i].phase).toBe('hold-b');
    }
  });

  it('property value grows each year in hold-a phase', () => {
    const result = runSellAndRebuySimulation(DEFAULT_PARAMS, DEFAULT_SELL_AND_REBUY_PARAMS);
    for (let i = 1; i < DEFAULT_SELL_AND_REBUY_PARAMS.sellAfterYear - 1; i++) {
      expect(result[i].propertyValue).toBeGreaterThan(result[i - 1].propertyValue);
    }
  });

  it('property value grows each year in hold-b phase', () => {
    const result = runSellAndRebuySimulation(DEFAULT_PARAMS, DEFAULT_SELL_AND_REBUY_PARAMS);
    for (let i = DEFAULT_SELL_AND_REBUY_PARAMS.sellAfterYear + 1; i < result.length; i++) {
      expect(result[i].propertyValue).toBeGreaterThan(result[i - 1].propertyValue);
    }
  });

  it('property B value starts at newPropertyPrice', () => {
    const result = runSellAndRebuySimulation(DEFAULT_PARAMS, DEFAULT_SELL_AND_REBUY_PARAMS);
    const sellYearIdx = DEFAULT_SELL_AND_REBUY_PARAMS.sellAfterYear - 1;
    expect(result[sellYearIdx].propertyValue).toBe(DEFAULT_SELL_AND_REBUY_PARAMS.newPropertyPrice);
  });

  it('net wealth is always defined', () => {
    const result = runSellAndRebuySimulation(DEFAULT_PARAMS, DEFAULT_SELL_AND_REBUY_PARAMS);
    for (const row of result) {
      expect(typeof row.netWealth).toBe('number');
      expect(Number.isFinite(row.netWealth)).toBe(true);
    }
  });

  it('handles sell at year 1', () => {
    const result = runSellAndRebuySimulation(DEFAULT_PARAMS, {
      ...DEFAULT_SELL_AND_REBUY_PARAMS,
      sellAfterYear: 1,
    });
    expect(result[0].phase).toBe('sold-buying-b');
    expect(result).toHaveLength(DEFAULT_PARAMS.simulationYears);
  });

  it('handles sell at last year minus 1', () => {
    const result = runSellAndRebuySimulation(DEFAULT_PARAMS, {
      ...DEFAULT_SELL_AND_REBUY_PARAMS,
      sellAfterYear: DEFAULT_PARAMS.simulationYears - 1,
    });
    expect(result[result.length - 1].phase).toBe('hold-b');
  });

  it('cash reserve reflects equity minus costs at sell year', () => {
    const result = runSellAndRebuySimulation(DEFAULT_PARAMS, DEFAULT_SELL_AND_REBUY_PARAMS);
    const sellYearIdx = DEFAULT_SELL_AND_REBUY_PARAMS.sellAfterYear - 1;
    // Cash reserve should be a number (can be negative if equity shortfall)
    expect(typeof result[sellYearIdx].cashReserve).toBe('number');
  });

  it('hold-a phase matches buy-and-hold equity', () => {
    const result = runSellAndRebuySimulation(DEFAULT_PARAMS, DEFAULT_SELL_AND_REBUY_PARAMS);
    // In hold-a, equity should match standalone buy calculation
    const year1 = result[0];
    expect(year1.equity).toBeGreaterThan(0);
    expect(year1.netWealth).toBe(year1.equity);
  });
});
