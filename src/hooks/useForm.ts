import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { FormValues, ErrorsMap, Validate, FormValue } from '../components/common/ui.types';

type UseFormReturn<TValues extends FormValues = FormValues> = {
    values: TValues;
    globalErrors: ErrorsMap;
    submitCount: number;

    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
    setCustomValue: (name: keyof TValues & string, value: FormValue) => void;
};

type UseFormArgs<TValues extends FormValues = FormValues> = {
    initialValues: TValues;
    onSubmit: (values: TValues) => void;
    validate?: Validate<TValues>;
};

export const useForm = <TValues extends FormValues = FormValues>({
                            initialValues,
                            onSubmit,
                            validate,
                        }: UseFormArgs<TValues>): UseFormReturn<TValues> => {
    const [values, setValues] = useState<TValues>(initialValues);
    const [submitCount, setSubmitCount] = useState<number>(0);
    const [globalErrors, setGlobalErrors] = useState<ErrorsMap>({});

    // Watch for changes in initialValues and update values
    useEffect(() => {
        setValues(initialValues);
    }, [JSON.stringify(initialValues)]);

    // Update text inputs
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!e.target) return;
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value } as TValues));
    };

    // Form submission
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setSubmitCount((prev) => prev + 1);

        const validationErrors: ErrorsMap = validate?.(values) || {};
        setGlobalErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        onSubmit(values);
    };

    const setCustomValue = (name: keyof TValues & string, value: FormValue) => {
        setValues((prev) => ({ ...prev, [name]: value } as TValues));
    };

    return { values, globalErrors, submitCount, handleChange, handleSubmit, setCustomValue };
};
