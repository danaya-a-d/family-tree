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

export type PartialDate = { y?: number; m?: number; d?: number };

export type DateModifier = 'exact' | 'abt' | 'bef' | 'aft' | 'between';

export type LifeEventDate =
    | { mod: 'exact' | 'abt' | 'bef' | 'aft'; from: PartialDate }
    | { mod: 'between'; from: PartialDate; to: PartialDate };

export interface LifeEvent {
    date?: LifeEventDate;
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

export type AnchorPerson = {
    id: Id,
    photo: string;
    name: string;
    surname: string;
    birth: string;
    death: string;
};

export interface Family {
    id: Id;
    spouses: Id[];
    children: Id[];
}
