import type { RootState } from '@/app/store';
import { personsAdapter, familiesAdapter } from './treeSlice';
import { Id, Person, SpousesForPerson } from '@/features/tree/types';
import malePlaceholder from '@/assets/img/pl-male.jpg';
import femalePlaceholder from '@/assets/img/pl-female.jpg';
import unknownPlaceholder from '@/assets/img/pl-unknown.jpg';
import * as constants from 'node:constants';

export const personsSel = personsAdapter.getSelectors<RootState>(
    (s) => s.tree.persons,
);

export const familiesSel = familiesAdapter.getSelectors<RootState>(
    (s) => s.tree.families,
);

export const selectPersonById = (state: RootState, id: string) => personsSel.selectById(state, id);

export const selectFamilyById = (state: RootState, id: string) => familiesSel.selectById(state, id);

export const selectFamilySpouseIds = (state: RootState, familyId: string) => familiesSel.selectById(state, familyId)?.spouses ?? [];

export const selectFamilyChildrenIds = (state: RootState, familyId: string) => familiesSel.selectById(state, familyId)?.children ?? [];

export const selectSpousesOfPerson = (state: RootState, personId: Id): SpousesForPerson[] => {
    const families = familiesSel.selectAll(state);

    const result: SpousesForPerson[] = [];

    for (const fam of families) {
        if (!fam.spouses?.includes(personId)) continue;

        const spouseId = fam.spouses.find(id => id !== personId);

        if (!spouseId) continue;

        const spouse = selectPersonById(state, spouseId);

        const getDefaultPortrait = (gender?: 'male' | 'female' | 'unknown') =>
            gender === 'male' ? malePlaceholder : gender === 'female' ? femalePlaceholder : unknownPlaceholder;

        const photo = spouse?.portrait || getDefaultPortrait(spouse?.gender);

        result.push({
            familyId: fam.id,
            spouseId: spouseId,
            spouseLabel:`${spouse?.givenName ?? ''} ${spouse?.familyName ?? ''}`.trim() || 'Unknown',
            spousePortrait: photo,
            relationshipStatus: fam.relationshipStatus ?? 'unknown',
            marriage: fam.marriage,
            divorce: fam.divorce,
        });
    }

    return result;
};

export const selectParentsOfChild = (state: RootState, childId: Id): Person[] => {
    const families = familiesSel.selectAll(state);
    const parentIds = new Set<Id>();

    for (const fam of families) {
        if (!fam.children.includes(childId)) continue;

        for (const pid of fam.spouses) {
            parentIds.add(pid);
        }
    }

    const parents: Person[] = [];

    for (const pid of parentIds) {
        const p = personsSel.selectById(state, pid);
        if (p) parents.push(p);
    }

    return parents;
};

export const selectParentInfo = (state: RootState, childId: Id) => {
    const parents = selectParentsOfChild(state, childId);

    const count = parents.length;
    const hasMother = parents.some(p => p.gender === 'female');
    const hasFather = parents.some(p => p.gender === 'male');

    return { count, hasMother, hasFather };
};