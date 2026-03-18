import type { Id, Person, Family } from '@/features/tree/types';
import portrait1 from '../assets/img/portrait-1.jpg';
import portrait2 from '../assets/img/portrait-2.jpg';
import portrait3 from '../assets/img/portrait-3.jpg';
import portrait4 from '../assets/img/portrait-4.jpg';
import portrait5 from '../assets/img/portrait-5.jpg';
import portrait6 from '../assets/img/portrait-6.jpg';
import portrait7 from '../assets/img/portrait-7.jpg';
import portrait8 from '../assets/img/portrait-8.jpg';
import portrait9 from '../assets/img/portrait-9.jpg';
import portrait10 from '../assets/img/portrait-10.jpg';
import portrait11 from '../assets/img/portrait-11.jpg';
import portrait13 from '../assets/img/portrait-13.jpg';

export const mockPersons: Person[] = [
    // Центральная ветка
    {
        id: 'p1',
        givenName: 'Daniel',
        familyName: 'Carter',
        gender: 'male',
        lifeStatus: 'deceased',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1927, m: 4, d: 18 },
            },
            place: 'Leeds',
        },
        death: {
            date: {
                mod: 'exact',
                from: { y: 2001, m: 9, d: 3 },
            },
            place: 'Leeds',
        },
        portrait: portrait7,
    },
    {
        id: 'p2',
        givenName: 'Edward',
        familyName: 'Carter',
        gender: 'male',
        lifeStatus: 'deceased',
        birth: {
            date: {
                mod: 'abt',
                from: { y: 1898 },
            },
            place: 'York',
        },
        death: {
            date: {
                mod: 'exact',
                from: { y: 1964, m: 2, d: 11 },
            },
            place: 'Leeds',
        },
        portrait: portrait10,
    },
    {
        id: 'p3',
        givenName: 'Grace',
        familyName: 'Carter',
        maidenName: 'Hayes',
        gender: 'female',
        lifeStatus: 'deceased',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1902, m: 1 },
            },
            place: 'Leeds',
        },
        death: {
            date: {
                mod: 'aft',
                from: { y: 1989 },
            },
            place: 'York',
        },
        portrait: portrait11,
    },
    {
        id: 'p4',
        givenName: 'Oksana',
        familyName: 'Carter',
        maidenName: 'Hrytsenko',
        gender: 'female',
        lifeStatus: 'deceased',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1931, m: 6, d: 14 },
            },
            place: 'Kyiv',
        },
        death: {
            date: {
                mod: 'exact',
                from: { y: 1998, m: 10, d: 22 },
            },
            place: 'Kyiv',
        },
        portrait: portrait13,
    },
    {
        id: 'p5',
        givenName: 'Chloe',
        familyName: 'Carter',
        maidenName: 'Bennett',
        gender: 'female',
        lifeStatus: 'deceased',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1938 },
            },
            place: 'Bristol',
        },
        death: {
            date: {
                mod: 'bef',
                from: { y: 2013 },
            },
            place: 'Bath',
        },
        portrait: portrait8,
    },

    // Дети Daniel
    {
        id: 'p6',
        givenName: 'Mila',
        familyName: 'Carter',
        gender: 'female',
        lifeStatus: 'living',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1954, m: 3, d: 9 },
            },
            place: 'Kyiv',
        },
        death: null,
        portrait: null,
    },
    {
        id: 'p7',
        givenName: 'Luka',
        familyName: 'Carter',
        gender: 'male',
        lifeStatus: 'living',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1958, m: 12, d: 1 },
            },
            place: 'Kyiv',
        },
        death: null,
        portrait: null,
    },
    {
        id: 'p8',
        givenName: 'Nora',
        familyName: 'Carter',
        gender: 'female',
        lifeStatus: 'living',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1967, m: 8, d: 25 },
            },
            place: 'Bristol',
        },
        death: null,
        portrait: portrait9,
    },
    {
        id: 'p27',
        givenName: 'Simon',
        familyName: 'Carter',
        gender: 'male',
        lifeStatus: 'living',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1970, m: 2, d: 6 },
            },
            place: 'Bristol',
        },
        death: null,
        portrait: null,
    },

    // Украинская ветка Oksana
    {
        id: 'p9',
        givenName: 'Taras',
        familyName: 'Hrytsenko',
        gender: 'male',
        lifeStatus: 'deceased',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1901, m: 7 },
            },
            place: 'Poltava region',
        },
        death: {
            date: {
                mod: 'exact',
                from: { y: 1973, m: 5, d: 9 },
            },
            place: 'Kyiv',
        },
        portrait: null,
    },
    {
        id: 'p10',
        givenName: 'Iryna',
        familyName: 'Hrytsenko',
        maidenName: 'Marchenko',
        gender: 'female',
        lifeStatus: 'deceased',
        birth: {
            date: {
                mod: 'abt',
                from: { y: 1904 },
            },
            place: 'Cherkasy',
        },
        death: {
            date: {
                mod: 'bef',
                from: { y: 1995 },
            },
            place: 'Cherkasy',
        },
        portrait: portrait5,
    },
    {
        id: 'p11',
        givenName: 'Solomiya',
        familyName: 'Cole',
        maidenName: 'Hrytsenko',
        gender: 'female',
        lifeStatus: 'deceased',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1934, m: 11 },
            },
            place: 'Kyiv',
        },
        death: {
            date: {
                mod: 'aft',
                from: { y: 2011 },
            },
            place: 'Lviv',
        },
        portrait: portrait3,
    },
    {
        id: 'p12',
        givenName: 'Bohdan',
        familyName: 'Hrytsenko',
        gender: 'male',
        lifeStatus: 'deceased',
        birth: {
            date: {
                mod: 'abt',
                from: { y: 1938 },
            },
            place: 'Kyiv',
        },
        death: {
            date: {
                mod: 'exact',
                from: { y: 2010, m: 4, d: 17 },
            },
            place: 'Kyiv',
        },
        portrait: null,
    },
    {
        id: 'p13',
        givenName: 'Marko',
        familyName: 'Sydorenko',
        gender: 'male',
        lifeStatus: 'deceased',
        birth: {
            date: {
                mod: 'between',
                from: { y: 1932 },
                to: { y: 1934 },
            },
            place: 'Lviv',
        },
        death: {
            date: {
                mod: 'bef',
                from: { y: 2000 },
            },
            place: 'Lviv',
        },
        portrait: null,
    },
    {
        id: 'p14',
        givenName: 'Ethan',
        familyName: 'Cole',
        gender: 'male',
        lifeStatus: 'deceased',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1932, m: 9, d: 4 },
            },
            place: 'Manchester',
        },
        death: {
            date: {
                mod: 'aft',
                from: { y: 2007 },
            },
            place: 'Manchester',
        },
        portrait: portrait4,
    },
    {
        id: 'p15',
        givenName: 'Artem',
        familyName: 'Sydorenko',
        gender: 'male',
        lifeStatus: 'living',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1960, m: 6, d: 18 },
            },
            place: 'Kyiv',
        },
        death: null,
        portrait: null,
    },
    {
        id: 'p16',
        givenName: 'Nick',
        familyName: 'Cole',
        gender: 'male',
        lifeStatus: 'living',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1968, m: 1, d: 12 },
            },
            place: 'Lviv',
        },
        death: null,
        portrait: portrait6,
    },
    {
        id: 'p17',
        givenName: 'Danylo',
        familyName: 'Hrytsenko',
        gender: 'male',
        lifeStatus: 'living',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1971, m: 5, d: 30 },
            },
            place: 'Kyiv',
        },
        death: null,
        portrait: null,
    },
    {
        id: 'p25',
        givenName: 'Kateryna',
        familyName: 'Hrytsenko',
        gender: 'female',
        lifeStatus: 'deceased',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1924, m: 9, d: 21 },
            },
            place: 'Vinnytsia region',
        },
        death: {
            date: {
                mod: 'exact',
                from: { y: 2007, m: 3, d: 14 },
            },
            place: 'Vinnytsia',
        },
        portrait: null,
    },
    {
        id: 'p26',
        givenName: 'Larysa',
        familyName: 'Hrytsenko',
        maidenName: 'Dovhan',
        gender: 'female',
        lifeStatus: 'deceased',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1899, m: 12, d: 10 },
            },
            place: 'Vinnytsia region',
        },
        death: {
            date: {
                mod: 'bef',
                from: { y: 1920 },
            },
            place: 'Vinnytsia region',
        },
        portrait: null,
    },

    // Английская ветка Chloe
    {
        id: 'p18',
        givenName: 'Thomas',
        familyName: 'Bennett',
        gender: 'male',
        lifeStatus: 'deceased',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1910, m: 8, d: 15 },
            },
            place: 'Bristol',
        },
        death: {
            date: {
                mod: 'exact',
                from: { y: 1988, m: 6, d: 11 },
            },
            place: 'Bath',
        },
        portrait: null,
    },
    {
        id: 'p19',
        givenName: 'Alice',
        familyName: 'Bennett',
        maidenName: 'Brooks',
        gender: 'female',
        lifeStatus: 'deceased',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1913, m: 3, d: 22 },
            },
            place: 'Bath',
        },
        death: {
            date: {
                mod: 'exact',
                from: { y: 2004, m: 2, d: 19 },
            },
            place: 'Bath',
        },
        portrait: null,
    },
    {
        id: 'p20',
        givenName: 'Olivia',
        familyName: 'Turner',
        maidenName: 'Bennett',
        gender: 'female',
        lifeStatus: 'living',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1941, m: 1 },
            },
            place: 'Bristol',
        },
        death: null,
        portrait: portrait1,
    },
    {
        id: 'p21',
        givenName: 'Jack',
        familyName: 'Turner',
        gender: 'male',
        lifeStatus: 'deceased',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1940, m: 7, d: 11 },
            },
            place: 'Cardiff',
        },
        death: {
            date: {
                mod: 'bef',
                from: { y: 2007 },
            },
            place: 'Cardiff',
        },
        portrait: portrait2,
    },
    {
        id: 'p22',
        givenName: 'Ruby',
        familyName: 'Turner',
        gender: 'female',
        lifeStatus: 'living',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1970, m: 11, d: 3 },
            },
            place: 'Bristol',
        },
        death: null,
        portrait: null,
    },

    // Дополнительные связи
    {
        id: 'p23',
        givenName: 'Owen',
        familyName: 'Parker',
        gender: 'male',
        lifeStatus: 'deceased',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1904, m: 6, d: 1 },
            },
            place: 'York',
        },
        death: {
            date: {
                mod: 'aft',
                from: { y: 1984 },
            },
            place: 'York',
        },
        portrait: null,
    },
    {
        id: 'p24',
        givenName: 'Noah',
        familyName: 'Carter',
        gender: 'male',
        lifeStatus: 'living',
        birth: {
            date: {
                mod: 'exact',
                from: { y: 1982, m: 2, d: 14 },
            },
            place: 'Leeds',
        },
        death: null,
        portrait: null,
    },
];

export const mockFamilies: Family[] = [
    // Родители Daniel
    {
        id: 'f1',
        spouses: [],
        children: [],
        relationshipStatus: 'endedByDeath',
        marriage: {
            date: {
                mod: 'exact',
                from: { y: 1925, m: 5, d: 20 },
            },
            place: 'Leeds',
        },
    },

    // Второй брак Grace
    {
        id: 'f2',
        spouses: [],
        children: [],
        relationshipStatus: 'separated',
        marriage: {
            date: {
                mod: 'abt',
                from: { y: 1962 },
            },
            place: 'York',
        },
    },

    // Daniel + Oksana
    {
        id: 'f3',
        spouses: [],
        children: [],
        relationshipStatus: 'divorced',
        marriage: {
            date: {
                mod: 'exact',
                from: { y: 1952, m: 7, d: 27 },
            },
            place: 'Kyiv',
        },
        divorce: {
            date: {
                mod: 'exact',
                from: { y: 1965, m: 9 },
            },
            place: 'Kyiv',
        },
    },

    // Daniel + Chloe
    {
        id: 'f4',
        spouses: [],
        children: [],
        relationshipStatus: 'married',
        marriage: {
            date: {
                mod: 'exact',
                from: { y: 1966, m: 4, d: 9 },
            },
            place: 'Bristol',
        },
    },

    // Первый брак Taras
    {
        id: 'f5',
        spouses: [],
        children: [],
        relationshipStatus: 'endedByDeath',
        marriage: {
            date: {
                mod: 'exact',
                from: { y: 1923 },
            },
            place: 'Vinnytsia region',
        },
    },

    // Второй брак Taras
    {
        id: 'f6',
        spouses: [],
        children: [],
        relationshipStatus: 'married',
        marriage: {
            date: {
                mod: 'exact',
                from: { y: 1930, m: 10, d: 4 },
            },
            place: 'Kyiv',
        },
    },

    // Solomiya + Marko
    {
        id: 'f7',
        spouses: [],
        children: [],
        relationshipStatus: 'divorced',
        marriage: {
            date: {
                mod: 'exact',
                from: { y: 1958, m: 8, d: 30 },
            },
            place: 'Kyiv',
        },
        divorce: {
            date: {
                mod: 'aft',
                from: { y: 1968 },
            },
            place: 'Lviv',
        },
    },

    // Solomiya + Ethan
    {
        id: 'f8',
        spouses: [],
        children: [],
        relationshipStatus: 'married',
        marriage: {
            date: {
                mod: 'exact',
                from: { y: 1969, m: 5, d: 21 },
            },
            place: 'Lviv',
        },
    },

    // Bohdan single-parent
    {
        id: 'f9',
        spouses: [],
        children: [],
    },

    // Родители Chloe
    {
        id: 'f10',
        spouses: [],
        children: [],
        relationshipStatus: 'endedByDeath',
        marriage: {
            date: {
                mod: 'exact',
                from: { y: 1934 },
            },
            place: 'Bristol',
        },
    },

    // Olivia + Jack
    {
        id: 'f11',
        spouses: [],
        children: [],
        relationshipStatus: 'married',
        marriage: {
            date: {
                mod: 'exact',
                from: { y: 1968, m: 6, d: 7 },
            },
            place: 'Bristol',
        },
    },

    // Mila single-parent
    {
        id: 'f12',
        spouses: [],
        children: [],
    },
];

export const mockRootPersonId: Id = 'p1';