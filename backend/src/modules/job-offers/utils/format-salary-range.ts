const THOUSANDS_SEPARATOR_REGEX = /\B(?=(\d{3})+(?!\d))/g;

export function formatBolivianos(amount: number): string {
  return `Bs ${amount.toString().replace(THOUSANDS_SEPARATOR_REGEX, '.')}`;
}

export function formatSalaryRange(salaryMin: number, salaryMax?: number): string {
  if (salaryMax === undefined) return formatBolivianos(salaryMin);
  return `${formatBolivianos(salaryMin)} - ${formatBolivianos(salaryMax).replace('Bs ', '')}`;
}
