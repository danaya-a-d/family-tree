export type FormFieldType = 'text' | 'textarea' | 'tagsinput' | 'file';

export interface FormField {
    name: string;
    type: FormFieldType;
    placeholder?: string;
}

export type FormValues = Record<string, string | string[] | null>;

export type ErrorsMap = Record<string, string[]>;
