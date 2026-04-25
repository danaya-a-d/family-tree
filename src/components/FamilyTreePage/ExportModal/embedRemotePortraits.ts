import type { TreeState } from '@/features/tree/treeSlice';
import type { Id } from '@/features/tree/types';

export type RemotePortraitEmbeddingWarning = {
    personId: Id;
    url: string;
    message: string;
};

export type RemotePortraitEmbeddingResult = {
    tree: TreeState;
    warnings: RemotePortraitEmbeddingWarning[];
    embeddedCount: number;
};

const REMOTE_PORTRAIT_PATTERN = /^https?:\/\//i;

const isRemotePortrait = (portrait: string | undefined): portrait is string =>
    Boolean(portrait && REMOTE_PORTRAIT_PATTERN.test(portrait.trim()));

const getErrorMessage = (error: unknown): string =>
    error instanceof Error ? error.message : 'Remote portrait fetch failed';

const getImageContentType = (response: Response, blob: Blob): string | undefined => {
    const rawContentType = response.headers.get('content-type') || blob.type;
    const contentType = rawContentType.split(';')[0]?.trim();
    return contentType?.toLowerCase().startsWith('image/') ? contentType : undefined;
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    const chunkSize = 0x8000;
    let binary = '';

    for (let index = 0; index < bytes.length; index += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    }

    return btoa(binary);
};

const fetchPortraitAsDataUrl = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();
    const contentType = getImageContentType(response, blob);
    if (!contentType) throw new Error('Remote portrait is not an image');

    return `data:${contentType};base64,${arrayBufferToBase64(await blob.arrayBuffer())}`;
};

export const embedRemotePortraits = async (
    tree: TreeState,
): Promise<RemotePortraitEmbeddingResult> => {
    const warnings: RemotePortraitEmbeddingWarning[] = [];
    let nextEntities: TreeState['persons']['entities'] | undefined;
    let embeddedCount = 0;

    for (const personId of tree.persons.ids) {
        const person = tree.persons.entities[personId];
        if (!person || !isRemotePortrait(person.portrait)) continue;

        const url = person.portrait.trim();

        try {
            const portrait = await fetchPortraitAsDataUrl(url);
            nextEntities ??= { ...tree.persons.entities };
            nextEntities[person.id] = { ...person, portrait };
            embeddedCount += 1;
        } catch (error) {
            warnings.push({
                personId: person.id,
                url,
                message: getErrorMessage(error),
            });
        }
    }

    return {
        tree: nextEntities
            ? {
                ...tree,
                persons: {
                    ...tree.persons,
                    entities: nextEntities,
                },
            }
            : tree,
        warnings,
        embeddedCount,
    };
};
