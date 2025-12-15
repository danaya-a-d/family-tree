import { Gender, LifeEvent, LifeEventDate, PartialDate } from '@/features/tree/types';

export type FormFieldType =
    | 'text'
    | 'textarea'
    | 'tags'
    | 'file'
    | 'radio'
    | 'date'
    | 'event';

export type RadioOption = { value: string; label: string; disabled?: boolean };

export type VisibilityPredicate = (values: FormValues) => boolean;

export interface FormField {
    name: string;
    type: FormFieldType;
    placeholder?: string;
    options?: ReadonlyArray<RadioOption>;
    visible?: boolean | VisibilityPredicate;
}

export type FormValue =
    | string
    | string[]
    | PartialDate
    | LifeEventDate
    | undefined;

export type FormValues = Record<string, FormValue>;

export type ErrorsMap = Record<string, string[]>;

export type Validate = (values: FormValues) => ErrorsMap;