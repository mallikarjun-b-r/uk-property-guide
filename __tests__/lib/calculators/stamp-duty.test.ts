import { describe, it, expect } from 'vitest';
import { calculateStampDuty, calculateStampDutyAdditionalProperty } from '../../../src/lib/calculators/stamp-duty';

describe('calculateStampDuty', () => {
  describe('standard rates', () => {
    it('returns 0 for property at £125,000', () => {
      expect(calculateStampDuty(125000, false)).toBe(0);
    });

    it('calculates correctly for £250,000 property', () => {
      // £0-£125k: 0%, £125k-£250k: 2% = £2,500
      expect(calculateStampDuty(250000, false)).toBe(2500);
    });

    it('calculates correctly for £400,000 property', () => {
      // £0-£125k: 0%, £125k-£250k: 2% (£2,500), £250k-£400k: 5% (£7,500) = £10,000
      expect(calculateStampDuty(400000, false)).toBe(10000);
    });

    it('calculates correctly for £1,000,000 property', () => {
      // £0-£125k: 0%, £125k-£250k: 2% (£2,500), £250k-£925k: 5% (£33,750), £925k-£1m: 10% (£7,500)
      expect(calculateStampDuty(1000000, false)).toBe(43750);
    });

    it('calculates correctly for £2,000,000 property', () => {
      // £0-£125k: 0%, £125k-£250k: 2% (£2,500), £250k-£925k: 5% (£33,750),
      // £925k-£1.5m: 10% (£57,500), £1.5m-£2m: 12% (£60,000) = £153,750
      expect(calculateStampDuty(2000000, false)).toBe(153750);
    });

    it('returns 0 for £0', () => {
      expect(calculateStampDuty(0, false)).toBe(0);
    });
  });

  describe('first-time buyer rates', () => {
    it('returns 0 for £300,000 property (FTB)', () => {
      // FTB: £0-£300k: 0%
      expect(calculateStampDuty(300000, true)).toBe(0);
    });

    it('calculates correctly for £400,000 property (FTB)', () => {
      // FTB: £0-£300k: 0%, £300k-£400k: 5% = £5,000
      expect(calculateStampDuty(400000, true)).toBe(5000);
    });

    it('calculates correctly for £500,000 property (FTB)', () => {
      // FTB: £0-£300k: 0%, £300k-£500k: 5% = £10,000
      expect(calculateStampDuty(500000, true)).toBe(10000);
    });

    it('uses standard rates for FTB above £500,000', () => {
      // Above £500k, FTB relief doesn't apply — use standard rates
      const ftbResult = calculateStampDuty(600000, true);
      const standardResult = calculateStampDuty(600000, false);
      expect(ftbResult).toBe(standardResult);
    });
  });

  describe('additional property surcharge', () => {
    it('returns 0 for £0', () => {
      expect(calculateStampDutyAdditionalProperty(0)).toBe(0);
    });

    it('calculates surcharge for £125,000 property', () => {
      // Standard: £0, Surcharge: £125k × 3% = £3,750
      expect(calculateStampDutyAdditionalProperty(125000)).toBe(3750);
    });

    it('calculates surcharge for £250,000 property', () => {
      // Standard: £2,500, Surcharge: £250k × 3% = £7,500, Total: £10,000
      expect(calculateStampDutyAdditionalProperty(250000)).toBe(10000);
    });

    it('calculates surcharge for £350,000 property', () => {
      // Standard: £0-£125k: 0%, £125k-£250k: 2% (£2,500), £250k-£350k: 5% (£5,000) = £7,500
      // Surcharge: £350k × 3% = £10,500, Total: £18,000
      expect(calculateStampDutyAdditionalProperty(350000)).toBe(18000);
    });

    it('is always more than standard duty for same price', () => {
      const prices = [200000, 300000, 500000, 1000000];
      for (const price of prices) {
        expect(calculateStampDutyAdditionalProperty(price)).toBeGreaterThan(
          calculateStampDuty(price, false)
        );
      }
    });
  });
});
