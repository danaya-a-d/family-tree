export type Id = string;

export type Gender = 'female' | 'male' | 'unknown';

export type LifeState = 'living' | 'deceased' | 'unknown';

export type RelativeKind =
    | 'mother' | 'father'
    | 'spouse'
    | 'son' | 'daughter'
    | 'brother' | 'sister';

export type AddRelativeContext = {
    anchorPersonId: Id;
    kind: RelativeKind;

    familyId?: Id;
    partnerId?: Id;
};

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

    portrait?: string;

    birth?: LifeEvent;
    death?: LifeEvent | null;
}

export interface Family {
    id: Id;
    spouses: Id[];
    children: Id[];
}
