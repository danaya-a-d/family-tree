import { readGedcom, type TreeNode } from 'read-gedcom';
import type { Family, Person } from '@/features/tree/types';
import { mapFamily } from './familyMapping';
import { createImportContext } from './importTypes';
import { buildMediaMap } from './media';
import { mapPerson } from './personMapping';
import type { GedcomImportResult } from './types';
import { createGedcomWarning } from './warnings';
import {
    buildPointerMaps,
    buildTreeState,
    deriveParentFamilyIds,
    linkFamiliesFromPersonPointers,
} from './treeState';

const toArrayBuffer = (input: ArrayBuffer | string): ArrayBuffer =>
    typeof input === 'string' ? new TextEncoder().encode(input).buffer : input;

const getErrorMessage = (error: unknown): string =>
    error instanceof Error ? error.message : 'Unknown GEDCOM parse error';

export const importGedcom = (input: ArrayBuffer | string): GedcomImportResult => {
    const context = createImportContext();
    let records: TreeNode[];

    try {
        const gedcom = readGedcom(toArrayBuffer(input));
        records = gedcom.rootNode.children;
    } catch (error) {
        const message = getErrorMessage(error);

        return {
            data: buildTreeState([], []),
            warnings: [
                createGedcomWarning({
                    code: 'import-error',
                    message: `GEDCOM import failed: ${message}`,
                    severity: 'error',
                }),
            ],
            error: {
                code: 'parse-error',
                message,
            },
        };
    }

    buildPointerMaps(records, context);
    buildMediaMap(records, context);

    const persons = records
        .filter((record) => record.tag === 'INDI')
        .map((record) => mapPerson(record, context))
        .filter(Boolean) as Person[];

    const families = records
        .filter((record) => record.tag === 'FAM')
        .map((record) => mapFamily(record, context))
        .filter(Boolean) as Family[];

    linkFamiliesFromPersonPointers(families, context);

    return {
        data: buildTreeState(deriveParentFamilyIds(persons, families), families),
        warnings: context.warnings,
    };
};
