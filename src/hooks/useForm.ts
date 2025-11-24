import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { FormValues, ErrorsMap, Validate } from '../components/common/ui.types';

type UseFormReturn = {
    values: FormValues;
    globalErrors: ErrorsMap;
    submitCount: number;

    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
    setCustomValue: (name: string, value: FormValues[string]) => void;
};

type UseFormArgs = {
    initialValues: FormValues;
    onSubmit: (values: FormValues) => void;
    validate?: Validate;
};

export const useForm = ({
                            initialValues,
                            onSubmit,
                            validate,
                        }: UseFormArgs): UseFormReturn => {
    const [values, setValues] = useState<FormValues>(initialValues);
    const [submitCount, setSubmitCount] = useState<number>(0);
    const [globalErrors, setGlobalErrors] = useState<ErrorsMap>({});

    // Следим за изменениями initialValues и обновляем values
    useEffect(() => {
        setValues(initialValues);
    }, [JSON.stringify(initialValues)]); // Чтобы избежать бесконечных ререндеров

    // Обновление текстовых инпутов
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!e.target) return;
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    // Отправка формы
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setSubmitCount((prev) => prev + 1);

        const validationErrors: ErrorsMap = validate?.(values) || {};
        setGlobalErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        onSubmit(values);
    };

    const setCustomValue = (name: string, value: FormValues[string]) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    return { values, globalErrors, submitCount, handleChange, handleSubmit, setCustomValue };
};
