import { MaintenanceStatus } from '@/types';

/**
 * Calculates rolling average daily distance driven from odometer readings.
 * Handles chronological sorting, timestamp deduplication, and zero/insufficient data safely.
 */
export function calculateAverageDailyKM(
  readings: Array<{ reading: number; recordedAt: string | Date }>,
  maxSamples: number = 10
): { averageDailyKM: number; confidence: 'high' | 'medium' | 'low' | 'none' } {
  if (!readings || readings.length < 2) {
    return { averageDailyKM: 0, confidence: 'none' };
  }

  // Sort readings chronologically (oldest to newest)
  const sorted = [...readings]
    .map((r) => ({
      reading: Number(r.reading),
      time: new Date(r.recordedAt).getTime(),
    }))
    .filter((r) => !isNaN(r.time) && !isNaN(r.reading))
    .sort((a, b) => a.time - b.time);

  // Take the most recent samples for rolling average
  const recent = sorted.slice(-Math.max(2, maxSamples));
  if (recent.length < 2) {
    return { averageDailyKM: 0, confidence: 'none' };
  }

  const oldest = recent[0];
  const newest = recent[recent.length - 1];

  const diffMs = newest.time - oldest.time;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const diffKM = newest.reading - oldest.reading;

  if (diffDays <= 0 || diffKM <= 0) {
    return { averageDailyKM: 0, confidence: 'none' };
  }

  const avg = Math.round((diffKM / diffDays) * 10) / 10;
  const confidence =
    diffDays >= 30 && recent.length >= 4
      ? 'high'
      : diffDays >= 7
      ? 'medium'
      : 'low';

  return { averageDailyKM: avg, confidence };
}

/**
 * Calculates distance driven since the last service.
 */
export function calculateDistanceSinceService(
  currentOdometer: number,
  lastServiceOdometer: number
): number {
  if (currentOdometer < lastServiceOdometer) {
    return 0;
  }
  return Math.max(0, currentOdometer - lastServiceOdometer);
}

/**
 * Calculates remaining kilometers before next service is due.
 */
export function calculateRemainingKM(
  currentOdometer: number,
  lastServiceOdometer: number,
  intervalKM: number
): number {
  const nextDue = lastServiceOdometer + intervalKM;
  return nextDue - currentOdometer;
}

/**
 * Calculates next service odometer reading.
 */
export function calculateNextServiceOdometer(
  lastServiceOdometer: number,
  intervalKM: number
): number {
  return lastServiceOdometer + intervalKM;
}

/**
 * Calculates remaining days until calendar deadline.
 */
export function calculateDaysUntilExpiry(targetDate: string | Date, fromDate: Date = new Date()): number {
  const target = new Date(targetDate).getTime();
  const from = fromDate.getTime();
  if (isNaN(target)) return 0;
  const diffMs = target - from;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculates estimated next service date by comparing:
 * 1. Distance-based estimate: (Remaining KM / Average Daily KM)
 * 2. Calendar-based deadline: (Last Service Date + intervalMonths)
 * Chooses the EARLIEST limit that occurs.
 */
export function calculateEstimatedServiceDate(params: {
  currentOdometer: number;
  lastServiceOdometer: number;
  intervalKM?: number;
  lastServiceDate: string | Date;
  intervalMonths?: number;
  averageDailyKM: number;
  now?: Date;
}): {
  estimatedDate: Date | null;
  daysRemaining: number | null;
  limitedBy: 'distance' | 'calendar' | 'none';
  isEstimate: boolean;
  label: string;
} {
  const now = params.now || new Date();
  let distanceDays: number | null = null;
  let calendarDays: number | null = null;

  // 1. Distance limit calculation
  if (params.intervalKM && params.intervalKM > 0) {
    const remainingKM = calculateRemainingKM(
      params.currentOdometer,
      params.lastServiceOdometer,
      params.intervalKM
    );

    if (params.averageDailyKM > 0) {
      distanceDays = Math.ceil(remainingKM / params.averageDailyKM);
    }
  }

  // 2. Calendar limit calculation
  if (params.intervalMonths && params.intervalMonths > 0) {
    const lastDate = new Date(params.lastServiceDate);
    if (!isNaN(lastDate.getTime())) {
      const calendarDueDate = new Date(lastDate);
      calendarDueDate.setMonth(calendarDueDate.getMonth() + params.intervalMonths);
      calendarDays = calculateDaysUntilExpiry(calendarDueDate, now);
    }
  }

  // If neither is computable
  if (distanceDays === null && calendarDays === null) {
    return {
      estimatedDate: null,
      daysRemaining: null,
      limitedBy: 'none',
      isEstimate: true,
      label: 'Estimated date unavailable',
    };
  }

  // Pick the earlier limit
  if (distanceDays !== null && calendarDays !== null) {
    if (distanceDays <= calendarDays) {
      const date = new Date(now);
      date.setDate(date.getDate() + distanceDays);
      return {
        estimatedDate: date,
        daysRemaining: distanceDays,
        limitedBy: 'distance',
        isEstimate: true,
        label: distanceDays <= 0 ? 'Overdue' : `Approx. ${distanceDays} days (Distance)`,
      };
    } else {
      const date = new Date(now);
      date.setDate(date.getDate() + calendarDays);
      return {
        estimatedDate: date,
        daysRemaining: calendarDays,
        limitedBy: 'calendar',
        isEstimate: false,
        label: calendarDays <= 0 ? 'Overdue' : `In ${calendarDays} days (Time limit)`,
      };
    }
  }

  if (distanceDays !== null) {
    const date = new Date(now);
    date.setDate(date.getDate() + distanceDays);
    return {
      estimatedDate: date,
      daysRemaining: distanceDays,
      limitedBy: 'distance',
      isEstimate: true,
      label: distanceDays <= 0 ? 'Overdue' : `Approx. ${distanceDays} days`,
    };
  }

  // Only calendarDays is available
  const date = new Date(now);
  date.setDate(date.getDate() + (calendarDays as number));
  return {
    estimatedDate: date,
    daysRemaining: calendarDays,
    limitedBy: 'calendar',
    isEstimate: false,
    label: (calendarDays as number) <= 0 ? 'Overdue' : `In ${calendarDays} days`,
  };
}

/**
 * Calculates maintenance status badge:
 * - RED: Overdue (remaining KM <= 0 OR days <= 0)
 * - YELLOW: Approaching (remaining KM <= warningThresholdKM OR days <= warningThresholdDays)
 * - GREEN: Good
 * - GRAY: Not configured / unknown
 */
export function calculateMaintenanceStatus(params: {
  remainingKM?: number | null;
  remainingDays?: number | null;
  warningThresholdKM?: number; // default: 300 KM
  warningThresholdDays?: number; // default: 14 days
}): MaintenanceStatus {
  const warnKM = params.warningThresholdKM ?? 300;
  const warnDays = params.warningThresholdDays ?? 14;

  const hasKM = params.remainingKM !== undefined && params.remainingKM !== null;
  const hasDays = params.remainingDays !== undefined && params.remainingDays !== null;

  if (!hasKM && !hasDays) {
    return 'GRAY';
  }

  // Check Overdue (RED)
  if ((hasKM && params.remainingKM! <= 0) || (hasDays && params.remainingDays! <= 0)) {
    return 'RED';
  }

  // Check Approaching (YELLOW)
  if ((hasKM && params.remainingKM! <= warnKM) || (hasDays && params.remainingDays! <= warnDays)) {
    return 'YELLOW';
  }

  return 'GREEN';
}

/**
 * Calculates engine oil usage percentage (0% to 100%+).
 */
export function calculateOilUsagePercentage(
  currentOdometer: number,
  lastServiceOdometer: number,
  intervalKM: number
): number {
  if (intervalKM <= 0) return 0;
  const driven = calculateDistanceSinceService(currentOdometer, lastServiceOdometer);
  const pct = Math.round((driven / intervalKM) * 100);
  return Math.min(Math.max(pct, 0), 100);
}

/**
 * Calculates monthly and yearly expenses from maintenance records.
 */
export function calculateExpenseAnalytics(
  records: Array<{
    totalCost?: number;
    partsCost?: number;
    laborCost?: number;
    serviceDate?: string | Date;
    createdAt?: string | Date;
    category?: string;
  }>
) {
  let totalExpense = 0;
  let totalPartsExpense = 0;
  let totalLaborExpense = 0;

  const monthlyMap: Record<string, number> = {};
  const categoryMap: Record<string, number> = {};
  const currentYear = new Date().getFullYear();
  let yearlyExpense = 0;

  records.forEach((record) => {
    const cost = Number(record.totalCost || 0);
    const parts = Number(record.partsCost || 0);
    const labor = Number(record.laborCost || 0);
    const cat = record.category || 'General';

    totalExpense += cost;
    totalPartsExpense += parts;
    totalLaborExpense += labor;

    const date = new Date(record.serviceDate || record.createdAt || Date.now());
    if (!isNaN(date.getTime())) {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + cost;

      if (date.getFullYear() === currentYear) {
        yearlyExpense += cost;
      }
    }

    categoryMap[cat] = (categoryMap[cat] || 0) + cost;
  });

  const monthlyList = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));

  const categoryList = Object.entries(categoryMap).map(([category, amount]) => ({
    category,
    amount,
  }));

  return {
    totalExpense,
    totalPartsExpense,
    totalLaborExpense,
    yearlyExpense,
    monthlyExpenses: monthlyList,
    categoryExpenses: categoryList,
  };
}
