import type { RootState } from '@/app/store';
import { personsAdapter, familiesAdapter } from './treeSlice';

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

