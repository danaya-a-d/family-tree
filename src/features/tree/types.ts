export type Id = string;

export type Gender = 'female' | 'male' | 'unknown';

export interface LifeEvent {
    date?: string;
    place?: string;
}

export interface Person {
    id: Id;

    givenName?: string;
    familyName?: string;
    maidenName?: string;

    gender: Gender;

    photoUrl?: string;

    birth?: LifeEvent;
    death?: LifeEvent;

    parentInFamilies: Id[];
    spouseInFamilies: Id[];
}

export interface Family {
    id: Id;
    spouses: Id[];
    children: Id[];
}
