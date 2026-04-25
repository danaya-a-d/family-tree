import type { TreeNode } from 'read-gedcom';
import type { ImportContext } from './importTypes';
import type { GedcomMediaFile, GedcomPrimaryPhotoResult } from './types';
import { childTags, childValue, firstChild, normalizePointer } from './nodeHelpers';
import { createUnsupportedGedcomWarning } from './warnings';

const supportedImagePattern =
    /\.(avif|bmp|gif|jpe?g|png|svg|webp)(?:[?#].*)?$/i;

export const isSupportedPrimaryPhotoFile = (
    file: string | null | undefined,
): boolean => {
    const trimmed = file?.trim();
    if (!trimmed) return false;

    return trimmed.startsWith('data:image/') || supportedImagePattern.test(trimmed);
};

export const pickPrimaryPhoto = (
    mediaFiles: readonly GedcomMediaFile[],
): GedcomPrimaryPhotoResult => {
    let portrait: string | undefined;
    const warnings: GedcomPrimaryPhotoResult['warnings'] = [];

    for (const mediaFile of mediaFiles) {
        if (!isSupportedPrimaryPhotoFile(mediaFile.file)) {
            warnings.push(
                createUnsupportedGedcomWarning('media', {
                    message: 'Unsupported GEDCOM media file is ignored.',
                    tag: 'OBJE',
                }),
            );
            continue;
        }

        if (!portrait) {
            portrait = mediaFile.file;
            continue;
        }

        warnings.push(
            createUnsupportedGedcomWarning('extraMedia', {
                message: 'Additional supported GEDCOM image is ignored.',
                tag: 'OBJE',
            }),
        );
    }

    return { portrait, warnings };
};

export const mapGedcomMediaFile = (
    mediaNode: TreeNode,
    context: Pick<ImportContext, 'warnings'>,
    recordKind: 'individual' | 'multimedia',
    pointer?: string,
): GedcomMediaFile => {
    if (childTags(mediaNode, 'BLOB').length > 0) {
        context.warnings.push(
            createUnsupportedGedcomWarning('binaryMedia', {
                message: 'Binary GEDCOM media is ignored.',
                recordKind,
                pointer,
                tag: 'BLOB',
            }),
        );
    }

    return {
        file: childValue(mediaNode, 'FILE') ?? '',
        format: childValue(firstChild(mediaNode, 'FILE') ?? mediaNode, 'FORM'),
        title: childValue(mediaNode, 'TITL'),
    };
};

export const buildMediaMap = (
    records: TreeNode[],
    context: ImportContext,
): void => {
    for (const record of records) {
        const pointer = normalizePointer(record.pointer);
        if (record.tag !== 'OBJE' || !pointer) continue;

        context.mediaPointerToFile.set(
            pointer,
            mapGedcomMediaFile(record, context, 'multimedia', pointer),
        );
    }
};
