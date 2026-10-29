import { describe, it, expect } from 'vitest';
import {
  calculateAverageDailyKM,
  calculateDistanceSinceService,
  calculateRemainingKM,
  calculateNextServiceOdometer,
  calculateDaysUntilExpiry,
  calculateEstimatedServiceDate,
  calculateMaintenanceStatus,
  calculateOilUsagePercentage,
  calculateExpenseAnalytics,
} from './maintenance';

describe('Maintenance Calculations Engine', () => {
  it('calculates average daily KM correctly with timestamp deduplication and sorting', () => {
    const readings = [
      { reading: 10000, recordedAt: '2026-10-01T00:00:00Z' },
      { reading: 10300, recordedAt: '2026-10-11T00:00:00Z' }, // 300 KM in 10 days = 30 KM/day
    ];
    const res = calculateAverageDailyKM(readings);
    expect(res.averageDailyKM).toBe(30);
    expect(res.confidence).toBe('medium');
  });

  it('handles empty or single reading safely', () => {
    expect(calculateAverageDailyKM([])).toEqual({ averageDailyKM: 0, confidence: 'none' });
    expect(
      calculateAverageDailyKM([{ reading: 5000, recordedAt: '2026-10-01' }])
    ).toEqual({ averageDailyKM: 0, confidence: 'none' });
  });

  it('calculates distance driven and remaining KM accurately', () => {
    expect(calculateDistanceSinceService(11500, 10000)).toBe(1500);
    expect(calculateRemainingKM(11500, 10000, 3000)).toBe(1500);
    expect(calculateNextServiceOdometer(10000, 3000)).toBe(13000);
  });

  it('calculates oil usage percentage', () => {
    // 1500 KM driven out of 3000 KM interval = 50%
    expect(calculateOilUsagePercentage(11500, 10000, 3000)).toBe(50);
    // Over interval clamps to 100
    expect(calculateOilUsagePercentage(14000, 10000, 3000)).toBe(100);
  });

  it('predicts estimated service date by picking the earliest limit', () => {
    // Case 1: Calendar limit is earlier
    // Distance limit: 1500 KM remaining at 30 KM/day = 50 days
    // Calendar limit: Last service was 2026-10-01, interval 2 months = 2026-12-01 (33 days from 2026-10-29)
    const now = new Date('2026-10-29T00:00:00Z');
    const resultCal = calculateEstimatedServiceDate({
      currentOdometer: 11500,
      lastServiceOdometer: 10000,
      intervalKM: 3000,
      lastServiceDate: '2026-10-01T00:00:00Z',
      intervalMonths: 2,
      averageDailyKM: 30,
      now,
    });

    expect(resultCal.limitedBy).toBe('calendar');
    expect(resultCal.daysRemaining).toBe(33);
    expect(resultCal.isEstimate).toBe(false);

    // Case 2: Distance limit is earlier
    // Distance limit: 300 KM remaining at 30 KM/day = 10 days
    // Calendar limit: 33 days
    const resultDist = calculateEstimatedServiceDate({
      currentOdometer: 12700,
      lastServiceOdometer: 10000,
      intervalKM: 3000,
      lastServiceDate: '2026-10-01T00:00:00Z',
      intervalMonths: 2,
      averageDailyKM: 30,
      now,
    });

    expect(resultDist.limitedBy).toBe('distance');
    expect(resultDist.daysRemaining).toBe(10);
    expect(resultDist.isEstimate).toBe(true);
  });

  it('evaluates maintenance status correctly (GREEN, YELLOW, RED)', () => {
    // Overdue by KM
    expect(calculateMaintenanceStatus({ remainingKM: -50 })).toBe('RED');
    // Overdue by days
    expect(calculateMaintenanceStatus({ remainingDays: -1 })).toBe('RED');
    // Approaching
    expect(calculateMaintenanceStatus({ remainingKM: 200, remainingDays: 20 })).toBe('YELLOW');
    // Good
    expect(calculateMaintenanceStatus({ remainingKM: 1500, remainingDays: 60 })).toBe('GREEN');
    // Unknown
    expect(calculateMaintenanceStatus({})).toBe('GRAY');
  });

  it('calculates monthly and category expense analytics', () => {
    const records = [
      { totalCost: 1200, partsCost: 1000, laborCost: 200, category: 'Engine', serviceDate: '2026-10-10' },
      { totalCost: 500, partsCost: 400, laborCost: 100, category: 'Brakes', serviceDate: '2026-10-15' },
    ];
    const analytics = calculateExpenseAnalytics(records);
    expect(analytics.totalExpense).toBe(1700);
    expect(analytics.totalPartsExpense).toBe(1400);
    expect(analytics.totalLaborExpense).toBe(300);
    expect(analytics.categoryExpenses.length).toBe(2);
  });
});
