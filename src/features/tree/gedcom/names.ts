import type { GedcomNameMapping } from './types';

export const GEDCOM_MARRIED_NAME_TAG = '_MARNM';

export const parseGedcomName = (
    value: string | null | undefined,
): GedcomNameMapping => {
    const trimmed = value?.trim();
    if (!trimmed) return {};

    const surnameMatch = trimmed.match(/\/([^/]*)\//);
    const familyName = surnameMatch?.[1]?.trim() || undefined;
    const givenName = trimmed.replace(/\/[^/]*\//, '').trim() || undefined;

    return {
        givenName,
        familyName,
    };
};

export const formatGedcomName = ({
    givenName,
    familyName,
}: GedcomNameMapping): string => {
    const given = givenName?.trim() ?? '';
    const family = familyName?.trim() ?? '';

    if (!family) return given;
    if (!given) return `/${family}/`;

    return `${given} /${family}/`.trim();
};
