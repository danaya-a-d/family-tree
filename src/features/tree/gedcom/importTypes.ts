import type { Id } from '@/features/tree/types';
import type { GedcomMediaFile, GedcomWarning } from './types';

export type PersonLinks = {
    pointer?: string;
    familyAsChildPointers: string[];
    familyAsSpousePointers: string[];
};

export type ImportContext = {
    warnings: GedcomWarning[];
    personPointerToId: Map<string, Id>;
    familyPointerToId: Map<string, Id>;
    mediaPointerToFile: Map<string, GedcomMediaFile>;
    personLinksById: Map<Id, PersonLinks>;
};

export const createImportContext = (): ImportContext => ({
    warnings: [],
    personPointerToId: new Map(),
    familyPointerToId: new Map(),
    mediaPointerToFile: new Map(),
    personLinksById: new Map(),
});
