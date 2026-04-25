import type { TreeNode } from 'read-gedcom';
import type { LifeStatus } from '@/features/tree/types';
import { childValue } from './nodeHelpers';
import type { GedcomWarning } from './types';
import { createGedcomWarning } from './warnings';

export const GEDCOM_LIFE_STATUS_TAG = '_MYROOTS_LIFE_STATUS';

const APP_LIFE_STATUSES: readonly LifeStatus[] = [
    'living',
    'deceased',
    'unknown',
];

const isLifeStatus = (value: string | undefined): value is LifeStatus =>
    APP_LIFE_STATUSES.includes(value as LifeStatus);

export const mapLifeStatus = (
    individualNode: TreeNode,
    deathNode: TreeNode | undefined,
    warnings: GedcomWarning[],
    pointer?: string,
): LifeStatus => {
    const customStatus = childValue(individualNode, GEDCOM_LIFE_STATUS_TAG);
    const validCustomStatus = isLifeStatus(customStatus) ? customStatus : undefined;

    if (customStatus && !validCustomStatus) {
        warnings.push(
            createGedcomWarning({
                code: 'unsupported-life-status',
                message: `Unsupported ${GEDCOM_LIFE_STATUS_TAG} value ${customStatus} is ignored.`,
                recordKind: 'individual',
                pointer,
                tag: GEDCOM_LIFE_STATUS_TAG,
            }),
        );
    }

    if (deathNode) {
        if (validCustomStatus && validCustomStatus !== 'deceased') {
            warnings.push(
                createGedcomWarning({
                    code: 'life-status-conflict',
                    message: `DEAT is present, so ${GEDCOM_LIFE_STATUS_TAG} ${validCustomStatus} is ignored.`,
                    recordKind: 'individual',
                    pointer,
                    tag: GEDCOM_LIFE_STATUS_TAG,
                }),
            );
        }

        return 'deceased';
    }

    return validCustomStatus ?? 'unknown';
};
