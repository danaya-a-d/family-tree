import type { TreeNode } from 'read-gedcom';
import { familiesAdapter, personsAdapter, type TreeState } from '@/features/tree/treeSlice';
import type { Family, Id, Person } from '@/features/tree/types';
import type { ImportContext } from './importTypes';
import { ensureUniqueId, makeGedcomId, normalizePointer } from './nodeHelpers';
import { createGedcomWarning } from './warnings';

export const buildPointerMaps = (
    records: TreeNode[],
    context: ImportContext,
): void => {
    const usedPersonIds = new Set<Id>();
    const usedFamilyIds = new Set<Id>();

    records.forEach((record) => {
        const pointer = normalizePointer(record.pointer);
        if (!pointer) return;

        if (record.tag === 'INDI') {
            context.personPointerToId.set(
                pointer,
                ensureUniqueId(makeGedcomId('p', pointer, record.indexSource), usedPersonIds),
            );
        }

        if (record.tag === 'FAM') {
            context.familyPointerToId.set(
                pointer,
                ensureUniqueId(makeGedcomId('f', pointer, record.indexSource), usedFamilyIds),
            );
        }
    });
};

const warnUnknownFamilyPointer = (
    context: ImportContext,
    personPointer: string | undefined,
    familyPointer: string,
    tag: 'FAMC' | 'FAMS',
): void => {
    context.warnings.push(
        createGedcomWarning({
            code: 'unknown-pointer',
            message: `GEDCOM individual references unknown family ${familyPointer}.`,
            recordKind: 'individual',
            pointer: personPointer,
            tag,
        }),
    );
};

export const linkFamiliesFromPersonPointers = (
    families: Family[],
    context: ImportContext,
): void => {
    const familiesById = new Map(families.map((family) => [family.id, family]));

    for (const [personId, links] of context.personLinksById.entries()) {
        for (const familyPointer of links.familyAsChildPointers) {
            const familyId = context.familyPointerToId.get(familyPointer);
            const family = familyId ? familiesById.get(familyId) : undefined;

            if (!family) {
                warnUnknownFamilyPointer(context, links.pointer, familyPointer, 'FAMC');
                continue;
            }

            if (!family.children.includes(personId)) {
                family.children.push(personId);
            }
        }

        for (const familyPointer of links.familyAsSpousePointers) {
            const familyId = context.familyPointerToId.get(familyPointer);
            const family = familyId ? familiesById.get(familyId) : undefined;

            if (!family) {
                warnUnknownFamilyPointer(context, links.pointer, familyPointer, 'FAMS');
                continue;
            }

            if (!family.spouses.includes(personId)) {
                family.spouses.push(personId);
            }
        }
    }
};

export const deriveParentFamilyIds = (persons: Person[], families: Family[]): Person[] => {
    const parentFamilyByChild = new Map<Id, Id>();

    for (const family of families) {
        for (const childId of family.children) {
            if (!parentFamilyByChild.has(childId)) {
                parentFamilyByChild.set(childId, family.id);
            }
        }
    }

    return persons.map((person) => ({
        ...person,
        parentFamilyId: parentFamilyByChild.get(person.id),
    }));
};

const deriveActiveSpouseFamily = (families: Family[]): Record<string, string | null> => {
    const activeSpouseFamily: Record<string, string | null> = {};

    for (const family of families) {
        for (const personId of family.spouses) {
            if (!(personId in activeSpouseFamily)) {
                activeSpouseFamily[personId] = family.id;
            }
        }
    }

    return activeSpouseFamily;
};

export const buildTreeState = (persons: Person[], families: Family[]): TreeState => ({
    persons: personsAdapter.setAll(personsAdapter.getInitialState(), persons),
    families: familiesAdapter.setAll(familiesAdapter.getInitialState(), families),
    rootPersonId: persons[0]?.id,
    activeSpouseFamily: deriveActiveSpouseFamily(families),
});
