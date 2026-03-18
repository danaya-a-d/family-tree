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

type BaseField<TValues extends FormValues = FormValues> = {
    name: keyof TValues & string;
    visible?: boolean | ((values: TValues) => boolean);
};

export type StandardFormField<TValues extends FormValues = FormValues> = BaseField<TValues> & {
    type: Exclude<FormFieldType, 'custom'>;
    placeholder?: string;
    options?: ReadonlyArray<RadioOption>;
    selectors?: ReadonlyArray<SelectOption | SelectPersonOption>;

    onValueChange?: (args: {
        name: keyof TValues & string;
        value: unknown;
        values: TValues;
        setValue: (name: keyof TValues & string, value: FormValue) => void;
    }) => void;
}

export type CustomFormField<TValues extends FormValues = FormValues> = BaseField<TValues> & {
    type: 'custom';
    render: (args: { values: TValues }) => ReactNode;
}

export type FormField<TValues extends FormValues = FormValues> =
    | StandardFormField<TValues>
    | CustomFormField<TValues>;

export type FormValue =
    | string
    | string[]
    | PartialDate
    | LifeEventDate
    | null
    | undefined;

export type FormValues = Record<string, FormValue>;

export type ErrorsMap = Record<string, string[]>;

export type Validate<TValues extends FormValues = FormValues> = (values: TValues) => ErrorsMap;