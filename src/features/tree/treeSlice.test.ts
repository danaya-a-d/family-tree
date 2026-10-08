import { describe, expect, it } from 'vitest';
import reducer, {
    addPerson,
    addPersonWithRelation,
    setRootPerson,
    type TreeState,
} from './treeSlice';
import type { Person } from './types';

const createEmptyState = (): TreeState => ({
    persons: {
        ids: [],
        entities: {},
    },
    families: {
        ids: [],
        entities: {},
    },
    activeSpouseFamily: {},
});

const createStateWithPerson = (person: Person): TreeState => {
    const state = createEmptyState();

    state.persons.ids.push(person.id);
    state.persons.entities[person.id] = person;

    return state;
};

describe('treeSlice', () => {
    it('sets root person', () => {
        const state = createEmptyState();

        const action = setRootPerson('p:test');

        const newState = reducer(state, action);

        expect(newState.rootPersonId).toBe('p:test');
    });

    it('adds a person with default values', () => {
        const state = createEmptyState();

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
        const state = createEmptyState();

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
        const state = createStateWithPerson({
            id: 'p:anna',
            givenName: 'Anna',
            gender: 'female',
            lifeStatus: 'living',
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
        })

        const daughterId = action.payload.person.id;

        const newState = reducer(state, action);

        expect(newState.persons.entities[daughterId]).toBeDefined();
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
});