import { PartialDate } from '@/features/tree/types';

export const formatPartialDate = (date?: PartialDate) => {
    if (!date) return '';

    const y = date.y?.toString() ?? '';
    const m = date.m?.toString().padStart(2, '0') ?? '';
    const d = date.d?.toString().padStart(2, '0') ?? '';

    if (y && m && d) return `${d}.${m}.${y}`;
    if (y && m) return `${m}.${y}`;
    return y;
};
