import type { TreeNode } from 'read-gedcom';
import type { Family, Id } from '@/features/tree/types';
import type { ImportContext } from './importTypes';
import { mapLifeEvent } from './lifeEvents';
import {
    childTags,
    childValue,
    collectUnsupportedWarnings,
    firstChild,
    makeGedcomId,
    normalizePointer,
} from './nodeHelpers';
import { GEDCOM_REL_STATUS_TAG, mapRelationshipStatus } from './relationshipStatus';
import { createGedcomWarning } from './warnings';

const UNSUPPORTED_FAMILY_EVENT_TAGS = [
    'MARB',
    'MARC',
    'MARL',
    'MARS',
    'DIVF',
    'RESI',
    'EVEN',
    'CENS',
] as const;

const STATUS_ONLY_FAMILY_EVENT_TAGS = ['ANUL', 'ENGA'] as const;

const resolvePersonPointer = (
    pointer: string | null | undefined,
    context: ImportContext,
    familyPointer: string | undefined,
    tag: string,
): Id | undefined => {
    const normalized = normalizePointer(pointer);
    if (!normalized) return undefined;

    const id = context.personPointerToId.get(normalized);
    if (!id) {
        context.warnings.push(
            createGedcomWarning({
                code: 'unknown-pointer',
                message: `GEDCOM family references unknown individual ${normalized}.`,
                recordKind: 'family',
                pointer: familyPointer,
                tag,
            }),
        );
    }

    return id;
};

const warnUnsupportedFamilyEvents = (
    node: TreeNode,
    context: ImportContext,
    pointer?: string,
): void => {
    for (const tag of UNSUPPORTED_FAMILY_EVENT_TAGS) {
        if (firstChild(node, tag)) {
            context.warnings.push(
                createGedcomWarning({
                    code: 'unsupported-relationship-status',
                    message: `GEDCOM family event ${tag} is ignored.`,
                    recordKind: 'family',
                    pointer,
                    tag,
                }),
            );
        }
    }

    for (const tag of STATUS_ONLY_FAMILY_EVENT_TAGS) {
        const eventNode = firstChild(node, tag);
        if (eventNode && (childValue(eventNode, 'DATE') || childValue(eventNode, 'PLAC'))) {
            context.warnings.push(
                createGedcomWarning({
                    code: 'unsupported-relationship-status',
                    message: `GEDCOM family event ${tag} date/place details are ignored.`,
                    recordKind: 'family',
                    pointer,
                    tag,
                }),
            );
        }
    }
};

export const mapFamily = (node: TreeNode, context: ImportContext): Family | undefined => {
    const pointer = normalizePointer(node.pointer);
    const id = pointer
        ? context.familyPointerToId.get(pointer)
        : makeGedcomId('f', pointer, node.indexSource);

    if (!id) return undefined;

    collectUnsupportedWarnings(node, context.warnings, 'family', pointer, {
        allowedFamilyCustomTags: [GEDCOM_REL_STATUS_TAG],
    });
    warnUnsupportedFamilyEvents(node, context, pointer);

    const spousePointers = [
        ...childTags(node, 'HUSB').map((child) => ({ tag: child.tag ?? 'HUSB', value: child.value })),
        ...childTags(node, 'WIFE').map((child) => ({ tag: child.tag ?? 'WIFE', value: child.value })),
    ];

    const spouses = spousePointers
        .map((spousePointer) =>
            resolvePersonPointer(spousePointer.value, context, pointer, spousePointer.tag))
        .filter(Boolean) as Id[];

    const children = childTags(node, 'CHIL')
        .map((child) => resolvePersonPointer(child.value, context, pointer, child.tag ?? 'CHIL'))
        .filter(Boolean) as Id[];

    const marriage = mapLifeEvent(firstChild(node, 'MARR'), context.warnings);
    const divorce = mapLifeEvent(firstChild(node, 'DIV'), context.warnings);

    return {
        id,
        spouses: [...new Set(spouses)],
        children: [...new Set(children)],
        relationshipStatus: mapRelationshipStatus(node, context.warnings, pointer),
        marriage,
        divorce,
    };
};
