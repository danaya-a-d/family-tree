import { LifeEventDate, PartialDate } from '@/features/tree/types';
import { DAY_MAX, DAY_MIN, MONTH_MAX, MONTH_MIN, YEAR_MAX, YEAR_MIN } from '@/components/common/constants';

export const validatePartialDate = (date?: PartialDate): string | null => {
    if (!date) return null;

    const { y, m, d } = date;

    if ((m != null || d != null) && y == null) {
        return 'Year is required if month or day is filled';
    }

    if (d != null && m == null) {
        return 'Month is required if day is filled';
    }

    if (y != null && (y < YEAR_MIN || y > YEAR_MAX)) {
        return `Year must be between ${YEAR_MIN} and ${YEAR_MAX}`;
    }

    if (m != null && (m < MONTH_MIN || m > MONTH_MAX)) {
        return `Month must be between ${MONTH_MIN} and ${MONTH_MAX}`;
    }

    if (d != null && (d < DAY_MIN || d > DAY_MAX)) {
        return `Day must be between ${DAY_MIN} and ${DAY_MAX}`;
    }

    return null;
};

export const isEmptyPartial = (date?: PartialDate): boolean => {
    if (!date) return true;
    const { y, m, d } = date;
    return y == null && m == null && d == null;
};

export const partialDateToKey = (date: PartialDate): number => {
    const y = date.y ?? 0;
    const m = date.m ?? 0;
    const d = date.d ?? 0;

    return y * 10000 + m * 100 + d;
};

export const validateLifeEventDate = (date?: LifeEventDate): string | null => {
    if (!date) return null;

    if (date.mod === 'between') {
        const { from, to } = date;
        if (isEmptyPartial(from) && isEmptyPartial(to)) {
            return null;
        }

        const fromError = validatePartialDate(from);
        if (fromError) return fromError;

        const toError = validatePartialDate(to);
        if (toError) return toError;

        if (from.y != null && to.y != null) {
            const fromKey = partialDateToKey(from);
            const toKey = partialDateToKey(to);

            if (fromKey > toKey) {
                return 'The start date must not be later than the end date';
            }
        }
    }

    const { from } = date;
    if (isEmptyPartial(from)) {
        return null;
    }

    return validatePartialDate(from);
};