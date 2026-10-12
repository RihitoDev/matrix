import { toBoliviaTime } from '../../../common/utils/date-time.js';

export const ACADEMIC_PERIOD_PATTERN = /^(I|II)-\d{4}$/;

const FIRST_SEMESTER_LAST_MONTH = 6;

export function getAcademicPeriod(isoDate: string): string | undefined {
  if (Number.isNaN(new Date(isoDate).getTime())) {
    return undefined;
  }

  const { year, month } = toBoliviaTime(isoDate);
  const semester = month <= FIRST_SEMESTER_LAST_MONTH ? 'I' : 'II';

  return `${semester}-${year}`;
}
