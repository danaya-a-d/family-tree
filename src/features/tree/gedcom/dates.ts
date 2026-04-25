import type { LifeEventDate, PartialDate } from '@/features/tree/types';
import type { GedcomDateFormatResult, GedcomDateMappingResult } from './types';
import { createGedcomWarning } from './warnings';

const YEAR_MIN = 1000;
const YEAR_MAX = 2100;

const GEDCOM_MONTHS: Record<string, number> = {
    JAN: 1,
    FEB: 2,
    MAR: 3,
    APR: 4,
    MAY: 5,
    JUN: 6,
    JUL: 7,
    AUG: 8,
    SEP: 9,
    OCT: 10,
    NOV: 11,
    DEC: 12,
};

const GEDCOM_MONTH_BY_NUMBER = Object.entries(GEDCOM_MONTHS).reduce<Record<number, string>>(
    (acc, [monthName, monthNumber]) => {
        acc[monthNumber] = monthName;
        return acc;
    },
    {},
);

const DAYS_BY_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

const isLeapYear = (year: number): boolean =>
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

const getDaysInMonth = (year: number, month: number): number =>
    month === 2 && isLeapYear(year) ? 29 : DAYS_BY_MONTH[month - 1] ?? 0;

const isValidPartialDate = ({ y, m, d }: PartialDate): boolean => {
    if (y == null || y < YEAR_MIN || y > YEAR_MAX) return false;
    if (m == null) return d == null;
    if (m < 1 || m > 12) return false;
    if (d == null) return true;
    return d >= 1 && d <= getDaysInMonth(y, m);
};

const validPartialDate = (date: PartialDate): PartialDate | undefined =>
    isValidPartialDate(date) ? date : undefined;

const parsePartialDate = (value: string): PartialDate | undefined => {
    const parts = value.trim().toUpperCase().split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
        const y = Number(parts[0]);
        return Number.isInteger(y) ? validPartialDate({ y }) : undefined;
    }

    if (parts.length === 2) {
        const month = GEDCOM_MONTHS[parts[0]];
        const y = Number(parts[1]);
        return month && Number.isInteger(y) ? validPartialDate({ y, m: month }) : undefined;
    }

    if (parts.length === 3) {
        const d = Number(parts[0]);
        const month = GEDCOM_MONTHS[parts[1]];
        const y = Number(parts[2]);
        return Number.isInteger(d) && month && Number.isInteger(y)
            ? validPartialDate({ y, m: month, d })
            : undefined;
    }

    return undefined;
};

const formatPartialDateToGedcom = (date: PartialDate): string | undefined => {
    const valid = validPartialDate(date);
    if (!valid?.y) return undefined;

    if (valid.m && valid.d) return `${valid.d} ${GEDCOM_MONTH_BY_NUMBER[valid.m]} ${valid.y}`;
    if (valid.m) return `${GEDCOM_MONTH_BY_NUMBER[valid.m]} ${valid.y}`;
    return `${valid.y}`;
};

const unsupportedAppDateWarning = () =>
    createGedcomWarning({
        code: 'unsupported-date',
        message: 'App date cannot be exported to supported GEDCOM date format.',
        tag: 'DATE',
    });

export const mapGedcomDateToApp = (
    value: string | null | undefined,
): GedcomDateMappingResult => {
    const trimmed = value?.trim();
    if (!trimmed) return { date: undefined, warnings: [] };

    const normalized = trimmed.toUpperCase();
    const modMatch = normalized.match(/^(ABT|ABOUT|EST|CAL|BEF|AFT)\s+(.+)$/);
    if (modMatch) {
        const modByGedcom = {
            ABT: 'abt',
            ABOUT: 'abt',
            EST: 'abt',
            CAL: 'abt',
            BEF: 'bef',
            AFT: 'aft',
        } as const;
        const from = parsePartialDate(modMatch[2]);
        const gedcomMod = modMatch[1] as keyof typeof modByGedcom;

        if (!from) {
            return {
                date: undefined,
                warnings: [
                    createGedcomWarning({
                        code: 'unsupported-date',
                        message: `Unsupported GEDCOM date: ${trimmed}`,
                        tag: 'DATE',
                    }),
                ],
            };
        }

        const warnings = gedcomMod === 'EST' || gedcomMod === 'CAL'
            ? [
                createGedcomWarning({
                    code: 'date-semantics-changed',
                    message: `GEDCOM ${gedcomMod} date semantics are imported as About.`,
                    tag: 'DATE',
                }),
            ]
            : [];

        return {
            date: { mod: modByGedcom[gedcomMod], from },
            warnings,
        };
    }

    const betweenMatch = normalized.match(/^BET\s+(.+)\s+AND\s+(.+)$/);
    if (betweenMatch) {
        const from = parsePartialDate(betweenMatch[1]);
        const to = parsePartialDate(betweenMatch[2]);

        return from && to
            ? { date: { mod: 'between', from, to }, warnings: [] }
            : {
                date: undefined,
                warnings: [
                    createGedcomWarning({
                        code: 'unsupported-date',
                        message: `Unsupported GEDCOM date: ${trimmed}`,
                        tag: 'DATE',
                    }),
                ],
            };
    }

    const fromToMatch = normalized.match(/^FROM\s+(.+)\s+TO\s+(.+)$/);
    if (fromToMatch) {
        const from = parsePartialDate(fromToMatch[1]);
        const to = parsePartialDate(fromToMatch[2]);

        return from && to
            ? {
                date: { mod: 'between', from, to },
                warnings: [
                    createGedcomWarning({
                        code: 'date-semantics-changed',
                        message: 'GEDCOM period date semantics are imported as an app date range.',
                        tag: 'DATE',
                    }),
                ],
            }
            : {
                date: undefined,
                warnings: [
                    createGedcomWarning({
                        code: 'unsupported-date',
                        message: `Unsupported GEDCOM date: ${trimmed}`,
                        tag: 'DATE',
                    }),
                ],
            };
    }

    const fromMatch = normalized.match(/^FROM\s+(.+)$/);
    if (fromMatch) {
        const from = parsePartialDate(fromMatch[1]);

        return from
            ? {
                date: { mod: 'aft', from },
                warnings: [
                    createGedcomWarning({
                        code: 'date-semantics-changed',
                        message: 'GEDCOM period start date is imported as After.',
                        tag: 'DATE',
                    }),
                ],
            }
            : {
                date: undefined,
                warnings: [
                    createGedcomWarning({
                        code: 'unsupported-date',
                        message: `Unsupported GEDCOM date: ${trimmed}`,
                        tag: 'DATE',
                    }),
                ],
            };
    }

    const toMatch = normalized.match(/^TO\s+(.+)$/);
    if (toMatch) {
        const from = parsePartialDate(toMatch[1]);

        return from
            ? {
                date: { mod: 'bef', from },
                warnings: [
                    createGedcomWarning({
                        code: 'date-semantics-changed',
                        message: 'GEDCOM period end date is imported as Before.',
                        tag: 'DATE',
                    }),
                ],
            }
            : {
                date: undefined,
                warnings: [
                    createGedcomWarning({
                        code: 'unsupported-date',
                        message: `Unsupported GEDCOM date: ${trimmed}`,
                        tag: 'DATE',
                    }),
                ],
            };
    }

    const from = parsePartialDate(trimmed);
    if (from) {
        return { date: { mod: 'exact', from }, warnings: [] };
    }

    return {
        date: undefined,
        warnings: [
            createGedcomWarning({
                code: 'unsupported-date',
                message: `Unsupported GEDCOM date: ${trimmed}`,
                tag: 'DATE',
            }),
        ],
    };
};

export const mapAppDateToGedcom = (
    date: LifeEventDate | undefined,
): GedcomDateFormatResult => {
    if (!date) return { value: undefined, warnings: [] };

    if (date.mod === 'between') {
        const from = formatPartialDateToGedcom(date.from);
        const to = formatPartialDateToGedcom(date.to);

        return from && to
            ? { value: `BET ${from} AND ${to}`, warnings: [] }
            : { value: undefined, warnings: [unsupportedAppDateWarning()] };
    }

    const from = formatPartialDateToGedcom(date.from);
    if (!from) return { value: undefined, warnings: [unsupportedAppDateWarning()] };

    const prefixByMod = {
        exact: '',
        abt: 'ABT ',
        bef: 'BEF ',
        aft: 'AFT ',
    } as const;

    return {
        value: `${prefixByMod[date.mod]}${from}`,
        warnings: [],
    };
};
