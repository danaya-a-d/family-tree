import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { FormValues, ErrorsMap } from '../components/common/ui.types';

type UseFormReturn = {
    values: FormValues;
    globalErrors: ErrorsMap;
    submitCount: number;

    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
    setCustomValue: (name: string, value: FormValues[string]) => void;
};

export const useForm = ({
    initialValues,
    onSubmit,
}: {
    initialValues: FormValues;
    onSubmit: (values: FormValues) => void;
}): UseFormReturn => {
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

    // Валидатор
    const validate = (values: FormValues) => {
        const errors: ErrorsMap = {};

        // Title
        const titleErrors: string[] = [];
        if (!values.title?.toString().trim()) {
            titleErrors.push("Don't forget to add a title");
        }
        if (titleErrors.length) {
            errors.title = titleErrors;
        }

        // Photo
        const photoErrors: string[] = [];
        if (!values.photo?.toString().trim()) {
            photoErrors.push("You'll need to upload a photo first");
        }
        if (photoErrors.length) {
            errors.photo = photoErrors;
        }

        return errors;
    };

    return { values, globalErrors, submitCount, handleChange, handleSubmit, setCustomValue };
};
