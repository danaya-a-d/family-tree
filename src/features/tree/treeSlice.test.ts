import { describe, expect, it } from 'vitest';
import reducer, {
    addPerson,
    addPersonWithRelation,
    setRootPerson,
    type TreeState,
} from './treeSlice';
import type { Family, Person } from './types';


const createPerson = (
    overrides: Pick<Person, 'id'> & Partial<Omit<Person, 'id'>>,
): Person => ({
    gender: 'unknown',
    lifeStatus: 'unknown',
    ...overrides,
});

const createFamily = (
    overrides: Pick<Family, 'id'> & Partial<Omit<Family, 'id'>>,
): Family => ({
    spouses: [],
    children: [],
    ...overrides,
});

const createState = ({
                         persons = [],
                         families = [],
                     }: {
    persons?: Person[];
    families?: Family[];
} = {}): TreeState => ({
    persons: {
        ids: persons.map((person) => person.id),
        entities: Object.fromEntries(
            persons.map((person) => [person.id, person]),
        ),
    },

    families: {
        ids: families.map((family) => family.id),
        entities: Object.fromEntries(
            families.map((family) => [family.id, family]),
        ),
    },

    activeSpouseFamily: {},
});

describe('treeSlice', () => {
    it('sets root person', () => {
        const state = createState();

        const action = setRootPerson('p:test');

        const newState = reducer(state, action);

        expect(newState.rootPersonId).toBe('p:test');
    });

    it('adds a person with default values', () => {
        const state = createState();

        const action = addPerson({
            id: 'p:test',
            givenName: 'Anna',
        });

        const newState = reducer(state, action);

        expect(newState.persons.ids).toContain('p:test');

        expect(newState.persons.entities['p:test']).toEqual({
            id: 'p:test',
            givenName: 'Anna',
            gender: 'unknown',
            lifeStatus: 'unknown',
        });
    });

    it('does not replace provided values with defaults', () => {
        const state = createState();

        const action = addPerson({
            id: 'p:anna',
            givenName: 'Anna',
            familyName: 'Smith',
            gender: 'female',
            lifeStatus: 'living',
        });

        const newState = reducer(state, action);

        expect(newState.persons.entities['p:anna']).toEqual({
            id: 'p:anna',
            givenName: 'Anna',
            familyName: 'Smith',
            gender: 'female',
            lifeStatus: 'living',
        });
    });

    it('adds a daughter to a single parent and creates a family', () => {
        const state = createState({
            persons: [
                createPerson({
                    id: 'p:anna',
                    givenName: 'Anna',
                    gender: 'female',
                    lifeStatus: 'living',
                }),
            ],
        });

        const action = addPersonWithRelation({
            person: {
                givenName: 'Kate',
                gender: 'female',
            },
            ctx: {
                anchorPersonId: 'p:anna',
                kind: 'daughter',
            },
        });

        const daughterId = action.payload.person.id;

        const newState = reducer(state, action);

        expect(
            newState.persons.entities[daughterId],
        ).toBeDefined();

        expect(newState.families.ids).toHaveLength(1);

        const familyId = newState.families.ids[0];
        const family = newState.families.entities[familyId];

        expect(family).toBeDefined();
        expect(family?.spouses).toEqual(['p:anna']);
        expect(family?.children).toContain(daughterId);

        expect(
            newState.persons.entities[daughterId]?.parentFamilyId,
        ).toBe(familyId);
    });

    it('adds a second child to an existing family without creating a new family', () => {
        const state = createState({
            persons: [
                createPerson({
                    id: 'p:anna',
                    givenName: 'Anna',
                    gender: 'female',
                    lifeStatus: 'living',
                }),

                createPerson({
                    id: 'p:first-child',
                    givenName: 'Kate',
                    gender: 'female',
                    lifeStatus: 'living',
                    parentFamilyId: 'f:anna',
                }),
            ],

            families: [
                createFamily({
                    id: 'f:anna',
                    spouses: ['p:anna'],
                    children: ['p:first-child'],
                }),
            ],
        });

        const action = addPersonWithRelation({
            person: {
                givenName: 'Basil',
                gender: 'male',
            },
            ctx: {
                anchorPersonId: 'p:anna',
                kind: 'son',
                familyId: 'f:anna',
            },
        });

        const sonId = action.payload.person.id;

        const newState = reducer(state, action);

        expect(newState.families.ids).toHaveLength(1);
        expect(newState.families.ids).toContain('f:anna');

        const family = newState.families.entities['f:anna'];

        expect(family).toBeDefined();
        expect(family?.children).toContain('p:first-child');
        expect(family?.children).toContain(sonId);

        expect(
            newState.persons.entities[sonId]?.parentFamilyId,
        ).toBe('f:anna');
    });

    it('adds a first parent to a person without an existing parent family', () => {
        const state = createState({
            persons: [
                createPerson({
                    id: 'p:kate',
                    givenName: 'Kate',
                    gender: 'female',
                }),
            ],
        });

        const action = addPersonWithRelation({
            person: {
                givenName: 'Anna',
                gender: 'female',
            },
            ctx: {
                anchorPersonId: 'p:kate',
                kind: 'mother',
            },
        });

        const motherId = action.payload.person.id;

        const newState = reducer(state, action);

        expect(newState.persons.entities[motherId]).toBeDefined();

        expect(newState.families.ids).toHaveLength(1);

        const familyId = newState.families.ids[0];
        const family = newState.families.entities[familyId];

        expect(family).toBeDefined();
        expect(family?.spouses).toEqual([motherId]);
        expect(family?.children).toEqual(['p:kate']);

        expect(
            newState.persons.entities['p:kate']?.parentFamilyId,
        ).toBe(familyId);
    });

    it('adds a sibling to an existing parent family without creating a new family', () => {
        const state = createState({
            persons: [
                createPerson({
                    id: 'p:anna',
                    givenName: 'Anna',
                    gender: 'female',
                }),

                createPerson({
                    id: 'p:kate',
                    givenName: 'Kate',
                    gender: 'female',
                    parentFamilyId: 'f:anna',
                }),
            ],

            families: [
                createFamily({
                    id: 'f:anna',
                    spouses: ['p:anna'],
                    children: ['p:kate'],
                }),
            ],
        });

        const action = addPersonWithRelation({
            person: {
                givenName: 'Lily',
                gender: 'female',
            },
            ctx: {
                anchorPersonId: 'p:kate',
                kind: 'sister',
            },
        });

        const sisterId = action.payload.person.id;

        const newState = reducer(state, action);

        expect(newState.families.ids).toEqual(['f:anna']);

        const family = newState.families.entities['f:anna'];

        expect(family).toBeDefined();
        expect(family?.children).toContain('p:kate');
        expect(family?.children).toContain(sisterId);

        expect(
            newState.persons.entities[sisterId]?.parentFamilyId,
        ).toBe('f:anna');
    });

    it('adds a spouse to an existing single-parent family and sets it as active', () => {
        const state = createState({
            persons: [
                createPerson({
                    id: 'p:anna',
                    givenName: 'Anna',
                    gender: 'female',
                }),

                createPerson({
                    id: 'p:kate',
                    givenName: 'Kate',
                    gender: 'female',
                    parentFamilyId: 'f:anna',
                }),
            ],

            families: [
                createFamily({
                    id: 'f:anna',
                    spouses: ['p:anna'],
                    children: ['p:kate'],
                }),
            ],
        });

        const action = addPersonWithRelation({
            person: {
                givenName: 'Bob',
                gender: 'male',
            },
            ctx: {
                anchorPersonId: 'p:anna',
                kind: 'spouse',
                familyId: 'f:anna',
            },
        });

        const spouseId = action.payload.person.id;

        const newState = reducer(state, action);

        expect(newState.families.ids).toEqual(['f:anna']);

        const family = newState.families.entities['f:anna'];

        expect(family).toBeDefined();
        expect(family?.spouses).toEqual(['p:anna', spouseId]);
        expect(family?.children).toEqual(['p:kate']);

        expect(newState.activeSpouseFamily['p:anna']).toBe('f:anna');
        expect(newState.activeSpouseFamily[spouseId]).toBe('f:anna');
    });
});