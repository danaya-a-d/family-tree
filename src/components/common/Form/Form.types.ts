import { LifeEventDate, PartialDate } from '@/features/tree/types';
import { ReactNode } from 'react';

export type FormFieldType =
    | 'text'
    | 'textarea'
    | 'tags'
    | 'file'
    | 'radio'
    | 'select'
    | 'date'
    | 'event'
    | 'personsel'
    | 'custom';

export type RadioOption = { value: string; label: string; disabled?: boolean };
export type SelectOption = { value: string; label: string; };
export type SelectPersonOption = { value: string; label: string; photo?: string; };

type BaseField = {
    name: string;
    visible?: boolean | ((values: FormValues) => boolean);
};

export type StandardFormField = BaseField & {
    type: Exclude<FormFieldType, 'custom'>;
    placeholder?: string;
    options?: ReadonlyArray<RadioOption>;
    selectors?: ReadonlyArray<SelectOption>;

    onValueChange?: (args: {
        name: string;
        value: unknown;
        values: FormValues;
        setValue: (name: string, value: unknown) => void;
    }) => void;
}

export type CustomFormField = BaseField & {
    type: 'custom';
    render: (args: { values: FormValues }) => ReactNode;
}

export type FormField = StandardFormField | CustomFormField;

export type FormValue =
    | string
    | string[]
    | PartialDate
    | LifeEventDate
    | undefined;

export type FormValues = Record<string, FormValue>;

export type ErrorsMap = Record<string, string[]>;

export type Validate = (values: FormValues) => ErrorsMap;