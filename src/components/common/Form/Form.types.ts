export type FormFieldType = 'text' | 'textarea' | 'tagsinput' | 'file' | 'radio';
export type RadioOption = { value: string; label: string; disabled?: boolean };

export interface FormField {
    name: string;
    type: FormFieldType;
    placeholder?: string;
    options?: ReadonlyArray<RadioOption>;
}

export type FormValues = Record<string, string | string[] | null>;

export type ErrorsMap = Record<string, string[]>;
