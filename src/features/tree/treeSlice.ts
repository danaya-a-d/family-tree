import { createSlice, createEntityAdapter, type PayloadAction, type EntityState, nanoid } from '@reduxjs/toolkit';
import { makeFamilyId, makePersonId } from './id';
import { Person, Family, Id, AddRelativeContext } from './types';
import { mockPersons, mockFamilies, mockRootPersonId } from '../../mock/tree';

export const personsAdapter = createEntityAdapter<Person>({});
export const familiesAdapter = createEntityAdapter<Family>({});

export interface TreeState {
    persons: EntityState<Person, Id>;
    families: EntityState<Family, Id>;
    rootPersonId?: Id;
    activeSpouseFamily: Record<string, string | null>;
}

const initialPersonsState = personsAdapter.setAll(
    personsAdapter.getInitialState(),
    mockPersons,
);

const initialFamiliesState = familiesAdapter.setAll(
    familiesAdapter.getInitialState(),
    mockFamilies,
);

const initialActiveSpouseFamily = mockFamilies.reduce<Record<string, string | null>>(
    (acc, family) => {
        family.spouses.forEach((personId) => {
            acc[personId] = family.id;
        });
        return acc;
    },
    {},
);

const initialState: TreeState = {
    persons: initialPersonsState,
    families: initialFamiliesState,
    rootPersonId: mockRootPersonId,
    activeSpouseFamily: initialActiveSpouseFamily,
};

type AddPersonWithRelationPayload = {
    person: Partial<Person>;
    family?: Partial<Family>;
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
                    lifeStatus: input.lifeStatus ?? 'unknown',
                } satisfies Person;

                return { payload };
            },
        },

        addPersonWithRelation: {
            reducer(state,
                    action: PayloadAction<{ person: Person; family?: Partial<Family>, ctx: AddRelativeContext }>) {
                const { person, family, ctx } = action.payload;
                personsAdapter.addOne(state.persons, person);

                const families = state.families;

                const findFamilyByChild = (id: Id) =>
                    Object.values(families.entities).find(f => f?.children.includes(id));

                const findSingleParentFamily = (parentId: Id) =>
                    Object.values(families.entities).find(
                        f => f && f.spouses.length === 1 && f.spouses[0] === parentId,
                    );

                const ensureSingleParentFamily = (parentId: Id) => {
                    let fam = findSingleParentFamily(parentId);
                    if (!fam) {
                        fam = { id: nanoid(), spouses: [parentId], children: [] };
                        familiesAdapter.addOne(families, fam);
                    }
                    return fam!;
                };

                const ensureParentsFamilyForChild = (c: Id) => {
                    const child = state.persons.entities[c];

                    let fam =
                        (child?.parentFamilyId ? families.entities[child.parentFamilyId] : undefined)
                        ?? findFamilyByChild(c);

                    if (!fam) {
                        fam = { id: nanoid(), spouses: [], children: [c] };
                        familiesAdapter.addOne(families, fam);
                    } else {
                        addUnique(fam.children, c);
                    }

                    if (child && !child.parentFamilyId) child.parentFamilyId = fam.id;
                    return fam!;
                };

                const a = ctx.anchorPersonId;
                const b = person.id;

                switch (ctx.kind) {
                    case 'spouse': {
                        const existFamily = ctx.familyId ? families.entities[ctx.familyId] : undefined;

                        if (existFamily && existFamily.spouses.includes(a)
                            && existFamily.spouses.length === 1) {

                            addUnique(existFamily.spouses, b);

                            existFamily.relationshipStatus = family?.relationshipStatus ?? existFamily.relationshipStatus;
                            existFamily.marriage = family?.marriage ?? existFamily.marriage;
                            existFamily.divorce = family?.divorce ?? existFamily.divorce;

                            state.activeSpouseFamily[a] = existFamily.id;
                            state.activeSpouseFamily[b] = existFamily.id;
                            break;
                        }

                        const fam: Family = {
                            id: nanoid(),
                            spouses: [a, b],
                            children: [],
                            relationshipStatus: family?.relationshipStatus,
                            marriage: family?.marriage,
                            divorce: family?.divorce,
                        };

                        familiesAdapter.addOne(families, fam);

                        state.activeSpouseFamily[a] = fam.id;
                        state.activeSpouseFamily[b] = fam.id;

                        break;
                    }
                    case 'son':
                    case 'daughter': {
                        let fam = ctx.familyId
                            ? families.entities[ctx.familyId]
                            : undefined;

                        if (!fam) {
                            fam = ensureSingleParentFamily(a);
                        }

                        addUnique(fam.children, b);

                        const child = state.persons.entities[b];
                        if (child) child.parentFamilyId = fam.id;
                        break;
                    }
                    case 'mother':
                    case 'father': {
                        const fam = ensureParentsFamilyForChild(a);
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
            prepare({ person, family, ctx }: AddPersonWithRelationPayload) {
                const normalized: Person = {
                    id: makePersonId(),
                    gender: person.gender ?? 'unknown',
                    givenName: person.givenName,
                    familyName: person.familyName,
                    maidenName: person.maidenName,
                    portrait: person.portrait,
                    lifeStatus: person.lifeStatus ?? 'unknown',
                    birth: person.birth,
                    death: person.death,
                };

                return { payload: { person: normalized, family, ctx } };
            },
        },

        updatePerson: (state, action: PayloadAction<{ id: Id; changes: Partial<Person> }>) => {
            personsAdapter.updateOne(state.persons, action.payload);
        },

        removePerson: (state, action: PayloadAction<Id>) => {
            const personId = action.payload;

            for (const fam of Object.values(state.families.entities)) {
                if (!fam) continue;

                const wasSpouse = fam.spouses.includes(personId);
                const wasChild = fam.children.includes(personId);

                if (!wasSpouse && !wasChild) continue;

                removeFrom(fam.spouses, personId);
                removeFrom(fam.children, personId);

                const hasChildren = fam.children.length > 0;
                const spousesCount = fam.spouses.length;

                if (!hasChildren && spousesCount <= 1) {
                    familiesAdapter.removeOne(state.families, fam.id);
                }
            }

            delete state.activeSpouseFamily[personId];

            for (const [pId, famId] of Object.entries(state.activeSpouseFamily)) {
                if (famId && !state.families.entities[famId]) {
                    state.activeSpouseFamily[pId as Id] = null;
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
            familiesAdapter.removeOne(state.families, action.payload);
        },

        setRootPerson: (state, action: PayloadAction<Id | undefined>) => {
            state.rootPersonId = action.payload;
        },

        //Family and Person
        setActiveSpouseFamily: (state, action: PayloadAction<{ personId: string; familyId: string | null }>) => {
            const { personId, familyId } = action.payload;

            if (!state.persons.entities[personId]) {
                return;
            }

            if (!familyId) {
                state.activeSpouseFamily[personId] = null;
                return;
            }

            const fam = state.families.entities[familyId];
            if (!fam || !fam.spouses.includes(personId)) {
                state.activeSpouseFamily[personId] = null;
                return;
            }

            state.activeSpouseFamily[personId] = familyId;
        },

        linkSpouses: (
            state,
            action: PayloadAction<{ familyId: Id; spouseIds: Id[] }>
        ) => {
            const { familyId, spouseIds } = action.payload;

            const fam = state.families.entities[familyId];
            if (!fam) return;

            const nextSpouses: Id[] = [...new Set(spouseIds)].filter(
                (id) => Boolean(state.persons.entities[id])
            );

            fam.spouses = nextSpouses;

            for (const pid of nextSpouses) {
                state.activeSpouseFamily[pid] = familyId;
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

        replaceTree: (_state, action: PayloadAction<TreeState>) => {
            return action.payload;
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
    setActiveSpouseFamily,
    linkSpouses,
    linkChild,
    replaceTree
} = treeSlice.actions;

export default treeSlice.reducer;