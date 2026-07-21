import { sparkline } from '@services/renderers/sparkline';

const createSeries = (
  length: number,
  valueAt: (index: number) => number | null,
): readonly (number | null)[] => Array.from({ length }, (_, index) => valueAt(index));

const cpuLoad48Hours = createSeries(48, (index) => {
  const hour = index % 24;
  const businessLoad = hour >= 8 && hour <= 18 ? 48 : 12;
  return 18 + businessLoad + ((index * 7) % 17);
});

const memoryPressureAndRestart = createSeries(64, (index) => {
  const cycle = index % 32;
  return cycle === 31 ? 24 : 38 + cycle * 2 + (index % 4) * 3;
});

const queueDepthSawtooth = createSeries(72, (index) => (index % 12) * 9 + (index % 5) * 2);

const dualPeakTraffic = createSeries(96, (index) => {
  const hour = index % 24;
  const day = Math.floor(index / 24);
  const morningPeak = Math.max(0, 36 - Math.abs(hour - 9) * 9);
  const eveningPeak = Math.max(0, 48 - Math.abs(hour - 18) * 8);
  return 16 + day * 4 + morningPeak + eveningPeak;
});

const incidentErrorBurst = createSeries(64, (index) => {
  const distanceFromPeak = Math.abs(index - 32);
  return distanceFromPeak <= 6 ? 12 + (7 - distanceFromPeak) * 24 : 3 + ((index * 5) % 7);
});

const postDeployLatency = createSeries(72, (index) => {
  if (index < 12) return 78 + (index % 4) * 3;
  if (index < 48) return Math.max(86, 430 - (index - 12) * 11);
  return 82 + ((index * 3) % 13);
});

const weeklySeasonality = createSeries(84, (index) => {
  const day = Math.floor(index / 12);
  const sample = index % 12;
  const weekendMultiplier = day >= 5 ? 0.55 : 1;
  const dailyCurve = 30 + Math.max(0, 42 - Math.abs(sample - 7) * 9);
  return Math.round(dailyCurve * weekendMultiplier + day * 2);
});

const batchTelemetryGaps = createSeries(72, (index) => {
  const phase = index % 18;
  if (phase >= 13 && phase <= 15) return null;
  return 22 + phase * 5 + Math.floor(index / 18) * 8;
});

const coldStartFanOut = createSeries(60, (index) => {
  const phase = index % 15;
  if (phase === 0) return 190 + Math.floor(index / 15) * 18;
  return Math.max(24, 158 - phase * 11 + (index % 4) * 4);
});

const signedCashFlow = createSeries(70, (index) => {
  const periodic = ((index * 17) % 100) - 50;
  const settlement = index % 14 === 0 ? -75 : index % 14 === 7 ? 65 : 0;
  return periodic + settlement;
});

/**
 * Examples covering additional large sparkline behavior.
 */
export const additionalLargeSparklineExamples = [
  {
    helper: 'sparkline',
    title: '48-hour CPU load sparkline',
    code: 'sparkline(cpuLoad48Hours, { color: "ansiGreen" })',
    output: sparkline(cpuLoad48Hours, { color: 'ansiGreen' }),
    size: 'large',
  },
  {
    helper: 'sparkline',
    title: 'memory pressure and restart sparkline',
    code: 'sparkline(memoryPressureAndRestart, { color: "ansiYellow" })',
    output: sparkline(memoryPressureAndRestart, { color: 'ansiYellow' }),
    size: 'large',
  },
  {
    helper: 'sparkline',
    title: 'queue depth sawtooth sparkline',
    code: 'sparkline(queueDepthSawtooth, { color: "ansiCyan" })',
    output: sparkline(queueDepthSawtooth, { color: 'ansiCyan' }),
    size: 'large',
  },
  {
    helper: 'sparkline',
    title: 'dual-peak traffic sparkline',
    code: 'sparkline(dualPeakTraffic, { color: "ansiBrightBlue" })',
    output: sparkline(dualPeakTraffic, { color: 'ansiBrightBlue' }),
    size: 'large',
  },
  {
    helper: 'sparkline',
    title: 'incident error burst sparkline',
    code: 'sparkline(incidentErrorBurst, { color: "ansiBrightRed" })',
    output: sparkline(incidentErrorBurst, { color: 'ansiBrightRed' }),
    size: 'large',
  },
  {
    helper: 'sparkline',
    title: 'post-deploy latency sparkline',
    code: 'sparkline(postDeployLatency, { color: "ansiMagenta" })',
    output: sparkline(postDeployLatency, { color: 'ansiMagenta' }),
    size: 'large',
  },
  {
    helper: 'sparkline',
    title: 'weekly seasonality sparkline',
    code: 'sparkline(weeklySeasonality, { color: "ansiBrightGreen" })',
    output: sparkline(weeklySeasonality, { color: 'ansiBrightGreen' }),
    size: 'large',
  },
  {
    helper: 'sparkline',
    title: 'batch telemetry gaps sparkline',
    code: 'sparkline(batchTelemetryGaps, { color: "ansiBlue" })',
    output: sparkline(batchTelemetryGaps, { color: 'ansiBlue' }),
    size: 'large',
  },
  {
    helper: 'sparkline',
    title: 'cold-start fan-out sparkline',
    code: 'sparkline(coldStartFanOut, { color: "ansiRed" })',
    output: sparkline(coldStartFanOut, { color: 'ansiRed' }),
    size: 'large',
  },
  {
    helper: 'sparkline',
    title: 'signed cash-flow sparkline',
    code: 'sparkline(signedCashFlow, { color: "ansiBrightCyan" })',
    output: sparkline(signedCashFlow, { color: 'ansiBrightCyan' }),
    size: 'large',
  },
] satisfies readonly import('./helpers').HelperExample[];
