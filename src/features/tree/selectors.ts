import type { RootState } from '@/app/store';
import { createSelector } from '@reduxjs/toolkit';
import { personsAdapter, familiesAdapter } from './treeSlice';
import { normalizeSearch } from '@/features/tree/lib/normalizeSearch';
import { formatPartialDate } from '@/features/tree/lib/formatPartialDate';
import { getDefaultPortrait } from '@/features/tree/lib/getDefaultPortrait';
import { buildGraph } from '@/features/tree/graph';
import { Id, Person, SpousesForPerson, PersonSearchItem } from '@/features/tree/types';

export const personsSel = personsAdapter.getSelectors<RootState>(
    (s) => s.tree.persons,
);

export const familiesSel = familiesAdapter.getSelectors<RootState>(
    (s) => s.tree.families,
);

export const selectPersonById = (state: RootState, id: string) => personsSel.selectById(state, id);

export const selectSpousesOfPerson = createSelector(
    [
        familiesSel.selectAll,
        personsSel.selectEntities,
        (_: RootState, personId: Id) => personId,
    ],
    (families, personsById, personId): SpousesForPerson[] => {
        const result: SpousesForPerson[] = [];

        for (const fam of families) {
            if (!fam.spouses?.includes(personId)) continue;

            const spouseId = (fam.spouses.find((id) => id !== personId) ?? null) as Id | null;

            if (!spouseId) {
                result.push({
                    familyId: fam.id,
                    spouseId: null,
                    spouseLabel: 'Single-parent family',
                    spousePortrait: getDefaultPortrait('unknown'),
                    relationshipStatus: fam.relationshipStatus ?? 'unknown',
                    marriage: fam.marriage,
                    divorce: fam.divorce,
                });
                continue;
            }

            const spouse = personsById[spouseId];
            const photo = spouse?.portrait || getDefaultPortrait(spouse?.gender);

            result.push({
                familyId: fam.id,
                spouseId,
                spouseLabel:
                    `${spouse?.givenName ?? ''} ${spouse?.familyName ?? ''}`.trim() || 'Unknown',
                spousePortrait: photo,
                relationshipStatus: fam.relationshipStatus ?? 'unknown',
                marriage: fam.marriage,
                divorce: fam.divorce,
            });
        }

        return result;
    },
);

export const selectParentsOfChild = createSelector(
    [
        familiesSel.selectAll,
        personsSel.selectEntities,
        (_: RootState, childId: Id) => childId,
    ],
    (families, personsById, childId): Person[] => {
        const parentIds = new Set<Id>();

        for (const fam of families) {
            if (!fam.children.includes(childId)) continue;

            for (const pid of fam.spouses) {
                parentIds.add(pid);
            }
        }

        const parents: Person[] = [];

        for (const pid of parentIds) {
            const p = personsById[pid];
            if (p) parents.push(p);
        }

        return parents;
    },
);

export const selectParentInfo = createSelector(
    [
        (state: RootState, childId: Id) => selectParentsOfChild(state, childId),
    ],
    (parents) => {
        const count = parents.length;
        const hasMother = parents.some((p) => p.gender === 'female');
        const hasFather = parents.some((p) => p.gender === 'male');

        return { count, hasMother, hasFather };
    },
);

export const selectSpouseFamilyIdsOfPerson = createSelector(
    [
        familiesSel.selectAll,
        (_: RootState, personId: Id) => personId,
    ],
    (families, personId) =>
        families
            .filter((f) => Array.isArray(f.spouses) && f.spouses.includes(personId))
            .map((f) => f.id),
);

export const selectActiveSpouseFamilyId = createSelector(
    [
        (state: RootState, personId: Id) => state.tree.activeSpouseFamily[personId] ?? null,
        selectSpouseFamilyIdsOfPerson,
    ],
    (activeFamilyId, spouseFamilyIds) => {
        if (activeFamilyId && spouseFamilyIds.includes(activeFamilyId)) return activeFamilyId;
        return spouseFamilyIds[0] ?? null;
    },
);

export const selectSpouseFamilyCountMap = createSelector(
    [familiesSel.selectAll],
    (families) => {
        const map: Record<Id, number> = {};

        for (const fam of families) {
            for (const pid of fam.spouses ?? []) {
                map[pid] = (map[pid] ?? 0) + 1;
            }
        }
        return map;
    },
);

export const selectAttachSpouseFamilies = createSelector(
    [
        familiesSel.selectAll,
        (_: RootState, personId: Id) => personId,
    ],
    (families, personId) =>
        families.filter((f) =>
            Array.isArray(f.spouses) &&
            f.spouses.includes(personId) &&
            f.spouses.length === 1,
        ),
);

export const selectPersonSearch = createSelector(
    [personsSel.selectAll],
    (persons): PersonSearchItem[] =>
        persons.map((p) => {
            const label =
                `${p.givenName ?? ''} ${p.familyName ?? ''}`.trim() +
                (p.maidenName ? ` (${p.maidenName})` : '') ||
                'Unknown';

            const by = formatPartialDate(p.birth?.date?.from);
            const dy = formatPartialDate(p.death?.date?.from);

            const years =
                p.lifeStatus === 'deceased'
                    ? by || dy
                        ? `${by || '?'}\u00A0–\u00A0${dy || '?'}`
                        : ''
                    : by || '';

            const photo =
                p.portrait ||
                (p.gender === 'male'
                    ? getDefaultPortrait('male')
                    : p.gender === 'female'
                        ? getDefaultPortrait('female')
                        : getDefaultPortrait('unknown'));

            const rawName: string = `${p.givenName ?? ''} ${p.familyName ?? ''} ${p.maidenName ?? ''}`.trim();
            const baseKey: string = normalizeSearch(rawName);

            const searchKey: string =
                baseKey.length > 0
                    ? baseKey
                    : normalizeSearch('unknown unnamed');

            return { id: p.id, label: label.trim() || 'Unknown', years, photo, searchKey };
        }),
);

export const selectGraph = createSelector(
    [
        (s: RootState) => s.tree.persons,
        (s: RootState) => s.tree.families,
        (s: RootState) => s.tree.rootPersonId,
        (s: RootState) => s.tree.activeSpouseFamily,
    ],
    (persons, families, rootPersonId, activeSpouseFamily) =>
        buildGraph({
            tree: {
                persons,
                families,
                rootPersonId,
                activeSpouseFamily,
            },
        } as RootState),
);