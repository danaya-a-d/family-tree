import type { TreeNode } from 'read-gedcom';
import type { Id } from '@/features/tree/types';
import type { GedcomRecordKind, GedcomWarning } from './types';
import { createUnsupportedGedcomWarning } from './warnings';

type CollectUnsupportedOptions = {
    allowedFamilyCustomTags?: readonly string[];
    allowedIndividualCustomTags?: readonly string[];
    allowedNameCustomTags?: readonly string[];
};

export const childTags = (node: TreeNode, tag: string): TreeNode[] =>
    node.children.filter((child) => child.tag === tag);

export const firstChild = (node: TreeNode, tag: string): TreeNode | undefined =>
    childTags(node, tag)[0];

export const childValue = (node: TreeNode | undefined, tag: string): string | undefined =>
    firstChild(node, tag)?.value?.trim() || undefined;

export const normalizePointer = (pointer: string | null | undefined): string | undefined =>
    pointer?.trim() || undefined;

const pointerKey = (pointer: string): string =>
    pointer.replace(/^@|@$/g, '').trim() || 'UNKNOWN';

const sanitizeIdPart = (value: string): string =>
    value.replace(/[^A-Za-z0-9_-]/g, '_') || 'unknown';

export const makeGedcomId = (
    prefix: 'p' | 'f',
    pointer: string | null | undefined,
    fallbackIndex: number,
): Id => `${prefix}:${sanitizeIdPart(pointer ? pointerKey(pointer) : `row-${fallbackIndex}`)}`;

export const ensureUniqueId = (baseId: Id, usedIds: Set<Id>): Id => {
    if (!usedIds.has(baseId)) {
        usedIds.add(baseId);
        return baseId;
    }

    let suffix = 2;
    let nextId = `${baseId}-${suffix}`;
    while (usedIds.has(nextId)) {
        suffix += 1;
        nextId = `${baseId}-${suffix}`;
    }

    usedIds.add(nextId);
    return nextId;
};

export const collectUnsupportedWarnings = (
    node: TreeNode,
    warnings: GedcomWarning[],
    recordKind: GedcomRecordKind = 'unknown',
    pointer = node.pointer ?? undefined,
    options: CollectUnsupportedOptions = {},
): void => {
    for (const child of node.children) {
        if (child.tag === 'NOTE') {
            warnings.push(
                createUnsupportedGedcomWarning('note', {
                    message: 'GEDCOM notes are ignored.',
                    recordKind,
                    pointer,
                    tag: child.tag,
                }),
            );
        } else if (child.tag === 'SOUR') {
            warnings.push(
                createUnsupportedGedcomWarning('source', {
                    message: 'GEDCOM sources are ignored.',
                    recordKind,
                    pointer,
                    tag: child.tag,
                }),
            );
        } else if (child.tag?.startsWith('_')) {
            const allowedFamilyTag =
                node.tag === 'FAM' &&
                options.allowedFamilyCustomTags?.includes(child.tag);
            const allowedIndividualTag =
                node.tag === 'INDI' &&
                options.allowedIndividualCustomTags?.includes(child.tag);
            const allowedNameTag =
                node.tag === 'NAME' &&
                options.allowedNameCustomTags?.includes(child.tag);

            if (!allowedFamilyTag && !allowedIndividualTag && !allowedNameTag) {
                warnings.push(
                    createUnsupportedGedcomWarning('customTag', {
                        message: `Custom GEDCOM tag ${child.tag} is ignored.`,
                        recordKind,
                        pointer,
                        tag: child.tag,
                    }),
                );
            }
        }

        collectUnsupportedWarnings(child, warnings, recordKind, pointer, options);
    }
};
