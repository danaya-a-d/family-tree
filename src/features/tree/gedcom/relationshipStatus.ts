import type { TreeNode } from 'read-gedcom';
import type { RelationshipStatus } from '@/features/tree/types';
import { childValue, firstChild } from './nodeHelpers';
import type { GedcomWarning } from './types';
import { createGedcomWarning } from './warnings';

export const GEDCOM_REL_STATUS_TAG = '_MYROOTS_REL_STATUS';

const APP_RELATIONSHIP_STATUSES: readonly RelationshipStatus[] = [
    'married',
    'divorced',
    'separated',
    'endedByDeath',
    'engaged',
    'dating',
    'annulled',
    'unknown',
    'other',
];

const isRelationshipStatus = (value: string | undefined): value is RelationshipStatus =>
    APP_RELATIONSHIP_STATUSES.includes(value as RelationshipStatus);

export const mapRelationshipStatus = (
    familyNode: TreeNode,
    warnings: GedcomWarning[],
    pointer?: string,
): RelationshipStatus => {
    const customStatus = childValue(familyNode, GEDCOM_REL_STATUS_TAG);
    if (customStatus) {
        if (isRelationshipStatus(customStatus)) return customStatus;

        warnings.push(
            createGedcomWarning({
                code: 'unsupported-relationship-status',
                message: `Unsupported ${GEDCOM_REL_STATUS_TAG} value ${customStatus} is ignored.`,
                recordKind: 'family',
                pointer,
                tag: GEDCOM_REL_STATUS_TAG,
            }),
        );
    }

    if (firstChild(familyNode, 'DIV')) return 'divorced';
    if (firstChild(familyNode, 'ANUL')) return 'annulled';
    if (firstChild(familyNode, 'MARR')) return 'married';
    if (firstChild(familyNode, 'ENGA')) return 'engaged';
    return 'unknown';
};
