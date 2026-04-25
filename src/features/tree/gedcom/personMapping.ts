import type { TreeNode } from 'read-gedcom';
import type { Gender, Person } from '@/features/tree/types';
import type { ImportContext } from './importTypes';
import { mapLifeEvent } from './lifeEvents';
import { mapGedcomMediaFile, pickPrimaryPhoto } from './media';
import {
    childTags,
    childValue,
    collectUnsupportedWarnings,
    firstChild,
    makeGedcomId,
    normalizePointer,
} from './nodeHelpers';
import { GEDCOM_LIFE_STATUS_TAG, mapLifeStatus } from './lifeStatus';
import { GEDCOM_MARRIED_NAME_TAG, parseGedcomName } from './names';
import type { GedcomMediaFile } from './types';

const mapGender = (value: string | undefined): Gender => {
    switch (value?.trim().toUpperCase()) {
        case 'F':
            return 'female';
        case 'M':
            return 'male';
        default:
            return 'unknown';
    }
};

const mapName = (node: TreeNode) => {
    const names = childTags(node, 'NAME');
    const primaryName = names[0];
    const parsed = parseGedcomName(primaryName?.value);
    const surname = childValue(primaryName ?? node, 'SURN');
    const marriedName = primaryName
        ? childValue(primaryName, GEDCOM_MARRIED_NAME_TAG)
        : undefined;

    const givenName = childValue(primaryName ?? node, 'GIVN') ?? parsed.givenName;
    const secondaryMaidenName = names
        .slice(1)
        .find((name) => childValue(name, 'TYPE')?.toLowerCase().includes('maiden'));

    return {
        givenName,
        familyName: marriedName ?? surname ?? parsed.familyName,
        maidenName: marriedName
            ? surname
            : secondaryMaidenName
                ? childValue(secondaryMaidenName, 'SURN') ??
                    parseGedcomName(secondaryMaidenName.value).familyName
                : undefined,
    };
};

const collectPersonMediaFiles = (
    node: TreeNode,
    context: ImportContext,
): GedcomMediaFile[] =>
    childTags(node, 'OBJE').map((mediaNode) => {
        const mediaPointer = normalizePointer(mediaNode.value);
        const referencedMedia = mediaPointer
            ? context.mediaPointerToFile.get(mediaPointer)
            : undefined;

        if (referencedMedia) return referencedMedia;

        return mapGedcomMediaFile(mediaNode, context, 'individual', node.pointer ?? undefined);
    });

export const mapPerson = (node: TreeNode, context: ImportContext): Person | undefined => {
    const pointer = normalizePointer(node.pointer);
    const id = pointer
        ? context.personPointerToId.get(pointer)
        : makeGedcomId('p', pointer, node.indexSource);

    if (!id) return undefined;

    collectUnsupportedWarnings(node, context.warnings, 'individual', pointer, {
        allowedIndividualCustomTags: [GEDCOM_LIFE_STATUS_TAG],
        allowedNameCustomTags: [GEDCOM_MARRIED_NAME_TAG],
    });

    const mediaResult = pickPrimaryPhoto(collectPersonMediaFiles(node, context));
    context.warnings.push(
        ...mediaResult.warnings.map((warning) => ({
            ...warning,
            recordKind: 'individual' as const,
            pointer,
        })),
    );

    const birth = mapLifeEvent(firstChild(node, 'BIRT'), context.warnings);
    const deathNode = firstChild(node, 'DEAT');
    const death = mapLifeEvent(deathNode, context.warnings);
    const names = mapName(node);

    context.personLinksById.set(id, {
        pointer,
        familyAsChildPointers: childTags(node, 'FAMC')
            .map((link) => normalizePointer(link.value))
            .filter(Boolean) as string[],
        familyAsSpousePointers: childTags(node, 'FAMS')
            .map((link) => normalizePointer(link.value))
            .filter(Boolean) as string[],
    });

    return {
        id,
        ...names,
        gender: mapGender(childValue(node, 'SEX')),
        portrait: mediaResult.portrait,
        lifeStatus: mapLifeStatus(node, deathNode, context.warnings, pointer),
        birth,
        death: deathNode ? death ?? undefined : undefined,
    };
};
