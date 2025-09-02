import { createSlice, createEntityAdapter, type PayloadAction, type EntityState } from '@reduxjs/toolkit';
import { Person, Family, Id } from './types';

export const personsAdapter = createEntityAdapter<Person>({});
export const familiesAdapter = createEntityAdapter<Family>({});

export interface TreeState {
    persons: EntityState<Person, Id>;
    families: EntityState<Family, Id>;
    rootPersonId?: Id;
}

const initialState: TreeState = {
    persons: personsAdapter.getInitialState(),
    families: familiesAdapter.getInitialState(),
    rootPersonId: undefined,
};

const addUnique = (arr: Id[], id: Id) => {
    if (!arr.includes(id)) arr.push(id);
};

const addManyUnique = (arr: Id[], ids: Id[]) => {
    for (const id of ids) if (!arr.includes(id)) arr.push(id);
};

const removeFrom = (arr: Id[], id: Id) => {
    const i = arr.indexOf(id);
    if (i >= 0) arr.splice(i, 1);
};


const treeSlice = createSlice({
    name: 'tree',
    initialState,
    reducers: {

        //Person
        addPerson: (state, action: PayloadAction<Person>) => {
            personsAdapter.addOne(state.persons, action.payload);
        },

        updatePerson: (state, action: PayloadAction<{ id: Id; changes: Partial<Person> }>) => {
            personsAdapter.updateOne(state.persons, action.payload);
        },

        removePerson: (state, action: PayloadAction<Id>) => {
            const personId = action.payload;

            for (const fam of Object.values(state.families.entities)) {
                if (!fam) continue;

                removeFrom(fam.spouses, personId);
                removeFrom(fam.children, personId);
            }

            for (const fam of Object.values(state.families.entities)) {
                if (!fam) continue;

                if (fam.spouses.length === 0 && fam.children.length === 0) {
                    familiesAdapter.removeOne(state.families, fam.id);
                }
            }

            personsAdapter.removeOne(state.persons, action.payload);
            if (state.rootPersonId === action.payload) state.rootPersonId = undefined;
        },

        //Family
        addFamily: (state, action: PayloadAction<Family>) => {
            familiesAdapter.addOne(state.families, action.payload);
        },

        updateFamily: (state, action: PayloadAction<{ id: Id; changes: Partial<Family> }>) => {
            familiesAdapter.updateOne(state.families, action.payload);
        },

        removeFamily: (state, action: PayloadAction<Id>) => {
            const fam = state.families.entities[action.payload];

            for (const sid of fam.spouses) {
                const p = state.persons.entities[sid];
                if (p) removeFrom(p.spouseInFamilies, fam.id);
            }

            for (const cid of fam.children) {
                const c = state.persons.entities[cid];
                if (c) removeFrom(c.parentInFamilies, fam.id);
            }

            familiesAdapter.removeOne(state.families, action.payload);
        },

        setRootPerson: (state, action: PayloadAction<Id | undefined>) => {
            state.rootPersonId = action.payload;
        },

        //Family and Person
        linkSpouses: (state,
                      action: PayloadAction<{ familyId: Id; spouseIds: Id[] }>) => {

            const { familyId, spouseIds } = action.payload;
            const fam = state.families.entities[familyId];
            if (!fam) return;

            for (const oldSpouseId of fam.spouses) {
                const p = state.persons.entities[oldSpouseId];
                if (p) removeFrom(p.spouseInFamilies, familyId);
            }

            const nextSpouses = [...new Set(spouseIds)].filter(
                id => Boolean(state.persons.entities[id]),
            );

            fam.spouses = nextSpouses;

            for (const sid of nextSpouses) {
                const p = state.persons.entities[sid];
                if (p) addUnique(p.spouseInFamilies, familyId);
            }
        },

        linkChild: (state,
                    action: PayloadAction<{ familyId: Id; childId: Id }>) => {

            const { familyId, childId } = action.payload;

            const fam = state.families.entities[familyId];
            const child = state.persons.entities[childId];
            if (!fam || !child) return;

            addUnique(fam.children, childId);
            addUnique(child.parentInFamilies, familyId);
        },

        unlinkChild: (state,
                      action: PayloadAction<{ familyId: Id; childId: Id }>) => {

            const { familyId, childId } = action.payload;

            const fam = state.families.entities[familyId];
            const child = state.persons.entities[childId];
            if (!fam || !child) return;

            removeFrom(fam.children, childId);
            removeFrom(child.parentInFamilies, familyId);
        },
    },
});

export const {
    addPerson,
    updatePerson,
    removePerson,
    addFamily,
    updateFamily,
    removeFamily,
    setRootPerson,
    linkSpouses,
    linkChild,
    unlinkChild,
} = treeSlice.actions;

export default treeSlice.reducer;