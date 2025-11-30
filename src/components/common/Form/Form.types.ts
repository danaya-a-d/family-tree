export type FormFieldType = 'text' | 'textarea' | 'tagsinput' | 'file' | 'radio' | 'date';

export type RadioOption = { value: string; label: string; disabled?: boolean };

export type VisibilityPredicate = (values: FormValues) => boolean;

export interface FormField {
    name: string;
    type: FormFieldType;
    placeholder?: string;
    options?: ReadonlyArray<RadioOption>;
    visible?: boolean | VisibilityPredicate;
}

export type FormValues = Record<string, string | string[] | null>;

export type ErrorsMap = Record<string, string[]>;

export type Validate = (values: FormValues) => ErrorsMap;