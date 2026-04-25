import type { TreeNode } from 'read-gedcom';
import type { LifeEvent } from '@/features/tree/types';
import { mapGedcomDateToApp } from './dates';
import type { GedcomWarning } from './types';
import { childValue } from './nodeHelpers';

export const mapLifeEvent = (
    eventNode: TreeNode | undefined,
    warnings: GedcomWarning[],
): LifeEvent | undefined => {
    if (!eventNode) return undefined;

    const dateResult = mapGedcomDateToApp(childValue(eventNode, 'DATE'));
    warnings.push(...dateResult.warnings);

    const place = childValue(eventNode, 'PLAC');

    return dateResult.date || place
        ? {
            date: dateResult.date,
            place,
        }
        : undefined;
};
