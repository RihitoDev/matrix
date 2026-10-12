import { MINUTE_MS } from '../../../common/constants/date-time.constants.js';
import { ACCESS_REQUEST_STATUS } from '../types/access-request.enum.js';

export const PENDING_ALERT_HOURS = 24;
export const REVIEW_TIME_WINDOW_DAYS = 30;
export const REVIEW_TIME_GOAL_HOURS = 48;

export const HOUR_MS = 60 * MINUTE_MS;

export const DECIDED_STATUSES: string[] = [ACCESS_REQUEST_STATUS.APPROVED, ACCESS_REQUEST_STATUS.REJECTED];
