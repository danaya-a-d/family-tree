import { createSlice, createEntityAdapter, type PayloadAction, type EntityState, nanoid } from '@reduxjs/toolkit';
import { makeFamilyId, makePersonId } from './id';
import { Person, Family, Id, AddRelativeContext } from './types';

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

type AddPersonWithRelationPayload = {
    person: Partial<Person>;
    ctx: AddRelativeContext;
}

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
        addPerson: {
            reducer(state, action: PayloadAction<Person>) {
                personsAdapter.addOne(state.persons, action.payload);
            },
            prepare(input: Partial<Omit<Person, 'id'>> & { id?: Id }) {
                const payload = {
                    id: input.id ?? makePersonId(),
                    ...input,
                    gender: input.gender ?? 'unknown',
                } satisfies Person;

                return { payload };
            },
        },

        addPersonWithRelation: {
            reducer(state,
                    action: PayloadAction<{ person: Person; ctx: AddRelativeContext }>) {
                const { person, ctx } = action.payload;
                personsAdapter.addOne(state.persons, person);

                //for search & create families
                const families = state.families;
                const findFamilyBySpouse = (id: Id) =>
                    Object.values(families.entities).find(f => f?.spouses.includes(id));
                const findFamilyByChild = (id: Id) =>
                    Object.values(families.entities).find(f => f?.children.includes(id));

                const ensureSpouseFamily = (s: Id) => {
                    let fam = findFamilyBySpouse(s);
                    if (!fam) {
                        fam = { id: nanoid(), spouses: [s], children: [] };
                        familiesAdapter.addOne(families, fam);
                    }
                    return fam!;
                };

                const ensureParentsFamilyForChild = (c: Id) => {
                    let fam = findFamilyByChild(c);
                    if (!fam) {
                        fam = { id: nanoid(), spouses: [], children: [c] };
                        familiesAdapter.addOne(families, fam);
                    } else if (!fam.children.includes(c)) {
                        fam.children.push(c);
                    }
                    return fam!;
                };

                const a = ctx.anchorPersonId;
                const b = person.id;

                switch (ctx.kind) {
                    case 'spouse': {
                        const fam = ensureSpouseFamily(a);
                        if (!fam.spouses.includes(b)) fam.spouses.push(b);
                        break;
                    }
                    case 'son':
                    case 'daughter': {
                        const fam = ensureSpouseFamily(a);         // якорь — родитель
                        if (!fam.children.includes(b)) fam.children.push(b);
                        break;
                    }
                    case 'mother':
                    case 'father': {
                        const fam = ensureParentsFamilyForChild(a); // якорь — ребёнок
                        if (!fam.spouses.includes(b)) fam.spouses.push(b);
                        break;
                    }
                    case 'brother':
                    case 'sister': {
                        const fam = ensureParentsFamilyForChild(a);
                        if (!fam.children.includes(b)) fam.children.push(b);
                        break;
                    }
                }
            },
            prepare({ person, ctx }: AddPersonWithRelationPayload) {
                const normalized: Person = {
                    id: makePersonId(),
                    gender: person.gender ?? 'unknown',
                    givenName: person.givenName,
                    familyName: person.familyName,
                    maidenName: person.maidenName,
                    portrait: person.portrait,
                    birth: person.birth,
                    death: person.death,
                };

                return { payload: { ctx, person: normalized } };
            },
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
        addFamily: {
            reducer(state, action: PayloadAction<Family>) {
                familiesAdapter.addOne(state.families, action.payload);
            },
            prepare(family: Omit<Family, 'id'> & { id?: Id }) {
                const id = family.id ?? makeFamilyId();
                return { payload: { ...family, id } as Family };
            },
        },

        updateFamily: (state, action: PayloadAction<{ id: Id; changes: Partial<Family> }>) => {
            familiesAdapter.updateOne(state.families, action.payload);
        },

        removeFamily: (state, action: PayloadAction<Id>) => {
            const fam = state.families.entities[action.payload];

            for (const sid of fam.spouses) {
                const p = state.persons.entities[sid];
                // if (p) removeFrom(p.spouseInFamilies, fam.id);
            }

            for (const cid of fam.children) {
                const c = state.persons.entities[cid];
                // if (c) removeFrom(c.parentInFamilies, fam.id);
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
                // if (p) removeFrom(p.spouseInFamilies, familyId);
            }

            const nextSpouses = [...new Set(spouseIds)].filter(
                id => Boolean(state.persons.entities[id]),
            );

            fam.spouses = nextSpouses;

            for (const sid of nextSpouses) {
                const p = state.persons.entities[sid];
                // if (p) addUnique(p.spouseInFamilies, familyId);
            }
        },

        linkChild: (state,
                    action: PayloadAction<{ familyId: Id; childId: Id }>) => {

            const { familyId, childId } = action.payload;

            const fam = state.families.entities[familyId];
            const child = state.persons.entities[childId];
            if (!fam || !child) return;

            addUnique(fam.children, childId);
            // addUnique(child.parentInFamilies, familyId);
        },

        unlinkChild: (state,
                      action: PayloadAction<{ familyId: Id; childId: Id }>) => {

            const { familyId, childId } = action.payload;

            const fam = state.families.entities[familyId];
            const child = state.persons.entities[childId];
            if (!fam || !child) return;

            removeFrom(fam.children, childId);
            // removeFrom(child.parentInFamilies, familyId);
        },
    },
});

export const {
    addPerson,
    addPersonWithRelation,
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