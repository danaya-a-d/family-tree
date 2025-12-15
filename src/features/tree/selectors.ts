import type { RootState } from '@/app/store';
import { personsAdapter, familiesAdapter } from './treeSlice';
import { Id, Person } from '@/features/tree/types';

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

export const selectParentsOfChild = (state: RootState, childId: Id): Person[] => {
    const families = familiesSel.selectAll(state);
    const parentIds = new Set<Id>();

    // console.log(families);

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

    return {count, hasMother, hasFather};
};