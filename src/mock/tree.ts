import type { Id, Person, Family } from '../features/tree/types';

export const mockPersons: Person[] = [
    {
        id: 'p1',
        givenName: 'Alexandr',
        familyName: 'Davidenko',
        gender: 'male',
        birth: { date: '1990-08-21' },
        parentInFamilies: [],
        spouseInFamilies: [],
    },
    {
        id: 'p2',
        givenName: 'Anna',
        familyName: 'Ivanova',
        gender: 'female',
        birth: { date: '1990-08-21' },
        parentInFamilies: [],
        spouseInFamilies: [],
    },
    {
        id: 'p3',
        givenName: 'Alexandr',
        familyName: 'Davidenko',
        gender: 'male',
        parentInFamilies: [],
        spouseInFamilies: [],
    },
    {
        id: 'p4',
        givenName: 'Anna',
        familyName: 'Davidenko',
        maidenName: 'Ivanova',
        gender: 'female',
        parentInFamilies: [],
        spouseInFamilies: [],
    },
    {
        id: 'p5',
        givenName: 'Child',
        familyName: 'Davidenko',
        gender: 'male',
        parentInFamilies: [],
        spouseInFamilies: [],
    },
    {
        id: 'p6',
        givenName: 'Child',
        familyName: 'Davidenko',
        gender: 'female',
        parentInFamilies: [],
        spouseInFamilies: [],
    },
];

export const mockFamilies: Family[] = [
    { id: 'f1', spouses: [], children: [] }, // p3 + p4 → ребёнок p1
    { id: 'f2', spouses: [], children: [] }, // p1 + p2 → дети p5, p6
];

export const mockRootPersonId: Id = 'p1';