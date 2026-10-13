export function calculateGap(score: number, average: number): number {
  const difference = score - average;

  return (Math.sign(difference) * Math.round(Math.abs(difference) * 10)) / 10;
}
