import type { Id, Person, Family } from '@/features/tree/types';
import big1 from '../assets/img/album-preview-photo-2.jpg';

export const mockPersons: Person[] = [
    {
        id: 'p1',
        givenName: 'Alexandr',
        familyName: 'Davidenko',
        gender: 'male',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1990, m: 8, d: 21 },
            }
        },
        death: {
            date: {
                mod: 'exact',
                from: { y: 2020, m: 1, d: 11 },
            },
        },
        portrait: big1,
    },
    {
        id: 'p2',
        givenName: 'Anna',
        familyName: 'Ivanova',
        gender: 'female',
        birth: {
            date: {
                mod: 'abt',
                from: { y: 1880 } }
        },
        death: {
            date: {
                mod: 'exact',
                from: { y: 1955, m: 1, d: 11 },
            },
        },
        portrait: big1,
    },
    {
        id: 'p3',
        givenName: 'Vasya',
        familyName: 'Davidenko',
        gender: 'male',
        birth: {
            date: {
                mod: 'between',
                from: { y: 1890 },
                to:   { y: 1900 },
            }
        },
        death: null,
        portrait: big1,
    },
    {
        id: 'p4',
        givenName: 'Vera',
        familyName: 'Davidenko',
        maidenName: 'Ivanova',
        gender: 'female',
        death: null,
        portrait: big1,
    },
    {
        id: 'p5',
        givenName: 'Child Oleg',
        familyName: 'Davidenko',
        gender: 'male',
        death: null,
        portrait: big1,
    },
    {
        id: 'p6',
        givenName: 'Child Luba',
        familyName: 'Davidenko',
        gender: 'female',
        death: null,
        portrait: big1,
    },

    {
        id: 'p7',
        givenName: 'Child Kira',
        familyName: 'Davidenko',
        gender: 'female',
        death: null,
        portrait: big1,
    },
    {
        id: 'p8',
        givenName: 'Child Nick',
        familyName: 'Davidenko',
        gender: 'male',
        death: null,
        portrait: big1,
    },
    {
        id: 'p9',
        givenName: 'Olga',
        familyName: 'Volkova',
        maidenName: 'Ivanova',
        gender: 'female',
        death: null,
        portrait: big1,
    },

    {
        id: 'p10',
        givenName: 'Child Olga',
        familyName: 'Volkova',
        gender: 'female',
        death: null,
        portrait: big1,
    },
];

export const mockFamilies: Family[] = [
    { id: 'f1', spouses: [], children: [] }, // p3 + p4 → ребёнок p1
    { id: 'f2', spouses: [], children: [] }, // p1 + p2 → дети p5, p6
    { id: 'f3', spouses: [], children: [] },
];

export const mockRootPersonId: Id = 'p1';