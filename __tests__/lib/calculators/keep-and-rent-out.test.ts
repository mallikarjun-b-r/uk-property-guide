import { describe, it, expect } from 'vitest';
import { runKeepAndRentOutSimulation } from '../../../src/lib/calculators/keep-and-rent-out';
import { DEFAULT_PARAMS, DEFAULT_KEEP_AND_RENT_OUT_PARAMS } from '../../../src/types/buy-vs-rent';

describe('runKeepAndRentOutSimulation', () => {
  it('returns correct number of years', () => {
    const result = runKeepAndRentOutSimulation(DEFAULT_PARAMS, DEFAULT_KEEP_AND_RENT_OUT_PARAMS);
    expect(result).toHaveLength(DEFAULT_PARAMS.simulationYears);
  });

  it('before switch year, phase is live-in-a', () => {
    const result = runKeepAndRentOutSimulation(DEFAULT_PARAMS, DEFAULT_KEEP_AND_RENT_OUT_PARAMS);
    for (let i = 0; i < DEFAULT_KEEP_AND_RENT_OUT_PARAMS.switchYear - 1; i++) {
      expect(result[i].phase).toBe('live-in-a');
    }
  });

  it('from switch year onwards, phase is two-properties', () => {
    const result = runKeepAndRentOutSimulation(DEFAULT_PARAMS, DEFAULT_KEEP_AND_RENT_OUT_PARAMS);
    for (let i = DEFAULT_KEEP_AND_RENT_OUT_PARAMS.switchYear - 1; i < result.length; i++) {
      expect(result[i].phase).toBe('two-properties');
    }
  });

  it('property A value grows each year', () => {
    const result = runKeepAndRentOutSimulation(DEFAULT_PARAMS, DEFAULT_KEEP_AND_RENT_OUT_PARAMS);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].propertyAValue).toBeGreaterThan(result[i - 1].propertyAValue);
    }
  });

  it('property B value is 0 before switch year', () => {
    const result = runKeepAndRentOutSimulation(DEFAULT_PARAMS, DEFAULT_KEEP_AND_RENT_OUT_PARAMS);
    for (let i = 0; i < DEFAULT_KEEP_AND_RENT_OUT_PARAMS.switchYear - 1; i++) {
      expect(result[i].propertyBValue).toBe(0);
    }
  });

  it('property B value starts at propertyBPrice at switch year', () => {
    const result = runKeepAndRentOutSimulation(DEFAULT_PARAMS, DEFAULT_KEEP_AND_RENT_OUT_PARAMS);
    const switchIdx = DEFAULT_KEEP_AND_RENT_OUT_PARAMS.switchYear - 1;
    expect(result[switchIdx].propertyBValue).toBe(DEFAULT_KEEP_AND_RENT_OUT_PARAMS.propertyBPrice);
  });

  it('property B value grows after switch year', () => {
    const result = runKeepAndRentOutSimulation(DEFAULT_PARAMS, DEFAULT_KEEP_AND_RENT_OUT_PARAMS);
    for (let i = DEFAULT_KEEP_AND_RENT_OUT_PARAMS.switchYear; i < result.length; i++) {
      expect(result[i].propertyBValue).toBeGreaterThan(result[i - 1].propertyBValue);
    }
  });

  it('rental income is 0 before switch year', () => {
    const result = runKeepAndRentOutSimulation(DEFAULT_PARAMS, DEFAULT_KEEP_AND_RENT_OUT_PARAMS);
    for (let i = 0; i < DEFAULT_KEEP_AND_RENT_OUT_PARAMS.switchYear - 1; i++) {
      expect(result[i].rentalIncome).toBe(0);
    }
  });

  it('rental income is positive after switch year', () => {
    const result = runKeepAndRentOutSimulation(DEFAULT_PARAMS, DEFAULT_KEEP_AND_RENT_OUT_PARAMS);
    for (let i = DEFAULT_KEEP_AND_RENT_OUT_PARAMS.switchYear - 1; i < result.length; i++) {
      expect(result[i].rentalIncome).toBeGreaterThan(0);
    }
  });

  it('net wealth includes both properties after switch', () => {
    const result = runKeepAndRentOutSimulation(DEFAULT_PARAMS, DEFAULT_KEEP_AND_RENT_OUT_PARAMS);
    const lastYear = result[result.length - 1];
    // Net wealth should reflect both property equities
    expect(lastYear.propertyAEquity).toBeGreaterThan(0);
    expect(lastYear.propertyBEquity).toBeGreaterThan(0);
  });

  it('handles switch at year 1', () => {
    const result = runKeepAndRentOutSimulation(DEFAULT_PARAMS, {
      ...DEFAULT_KEEP_AND_RENT_OUT_PARAMS,
      switchYear: 1,
    });
    expect(result[0].phase).toBe('two-properties');
    expect(result).toHaveLength(DEFAULT_PARAMS.simulationYears);
  });

  it('net wealth is always defined', () => {
    const result = runKeepAndRentOutSimulation(DEFAULT_PARAMS, DEFAULT_KEEP_AND_RENT_OUT_PARAMS);
    for (const row of result) {
      expect(typeof row.netWealth).toBe('number');
      expect(Number.isFinite(row.netWealth)).toBe(true);
    }
  });
});
