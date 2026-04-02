import * as React from 'react';
import { useMemo, useState } from 'react';
import { useForm } from '@/hooks/useForm';
import type { ButtonConfig, Validate, ErrorsMap, FormField, FormValues, FormValue } from '../ui.types';
import { LifeEventDate, PartialDate } from '@/features/tree/types';
import Input from './Input/Input';
import Textarea from './Textarea/Textarea';
import TagsInput from './TagsInput/TagsInput';
import PhotoUploader from './PhotoUploader/PhotoUploader';
import RadioGroup from './RadioGroup/RadioGroup';
import Button from '../Button/Button';
import Errors from './Errors/Errors';
import DateInput from '@/components/common/Form/DateInput/DateInput';
import LifeEventDateField from '@/components/common/Form/LifeEventDateField/LifeEventDateField';
import Select from '@/components/common/Form/Select/Select';
import SelectPerson from '@/components/common/Form/SelectPerson/SelectPerson';
import styles from './Form.module.css';

interface FormProps<TValues extends FormValues = FormValues> {
    initialValues: TValues;
    fields: ReadonlyArray<FormField<TValues>>;
    buttons?: ReadonlyArray<ButtonConfig>;
    onSubmit: (values: TValues) => void;
    formLayout?: string | ((values: TValues) => string);
    className?: string;
    externalLocalErrors?: ErrorsMap;
    validate?: Validate<TValues>;
}

const Form = <TValues extends FormValues = FormValues>({
                                                           initialValues,
                                                           fields,
                                                           buttons,
                                                           onSubmit,
                                                           formLayout,
                                                           className,
                                                           externalLocalErrors,
                                                           validate,
                                                       }: FormProps<TValues>) => {
    const { values, handleSubmit, setCustomValue, submitCount, globalErrors } = useForm({
        initialValues,
        onSubmit,
        validate,
    });

    const nextValues = (name: keyof TValues & string, value: FormValue) =>
        ({ ...values, [name]: value } as TValues);

    const setValue = (name: keyof TValues & string, value: FormValue) => setCustomValue(name, value);

    const [localErrors, setLocalErrors] = useState<ErrorsMap>({});

    const resLayout = typeof formLayout === 'function' ? formLayout(values) : formLayout;

    const layoutStyle = useMemo(
        () => ({
            gridTemplateAreas: resLayout,
        }),
        [resLayout],
    );

    const renderField = (field: FormField<TValues>): JSX.Element => {
        if (field.type === 'custom') {
            return <>{field.render({ values })}</>;
        }

        const commonProps = {
            name: field.name,
            placeholder: field.placeholder ?? '',
            className: styles[`input-${field.name}`],
        };

        const assertNever = (x: never): never => {
            throw new Error('Unknown field type');
        };

        switch (field.type) {
            case 'text': {
                const handleTextChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
                    setCustomValue(field.name, e.target.value);
                    field.onValueChange?.({
                        name: field.name,
                        value: e.target.value,
                        values: nextValues(field.name, e.target.value),
                        setValue: setValue,
                    });
                };

                return <Input {...commonProps} value={(values[field.name] as string) ?? ''}
                              onChange={handleTextChange}
                />;
            }

            case 'textarea': {
                const handleTextareaChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
                    setCustomValue(field.name, e.target.value);
                    field.onValueChange?.({
                        name: field.name,
                        value: e.target.value,
                        values: nextValues(field.name, e.target.value),
                        setValue: setValue,
                    });
                };

                return (
                    <Textarea {...commonProps} value={(values[field.name] as string) ?? ''}
                              onChange={handleTextareaChange}
                    />
                );
            }

            case 'date': {
                return (
                    <DateInput {...commonProps}
                               value={(values[field.name] as PartialDate | undefined)}
                               setValue={setCustomValue}
                               onError={(msg: string) => (setLocalErrors(() => ({ [field.name]: [msg] })))}
                    />
                );
            }

            case 'event': {
                return (
                    <LifeEventDateField {...commonProps}
                                        value={values[field.name] as LifeEventDate | undefined}
                                        onError={(msg: string) => setLocalErrors(() => ({ [field.name]: [msg] }))}
                                        onChange={(v) => {
                                            setCustomValue(field.name, v);
                                            field.onValueChange?.({
                                                name: field.name,
                                                value: v,
                                                values: nextValues(field.name, v),
                                                setValue: setValue,
                                            });
                                        }}
                    />
                );
            }

            case 'tags': {
                return (
                    <TagsInput
                        {...commonProps}
                        value={(values[field.name] as string[]) ?? []}
                        setValue={setCustomValue}
                        onError={(msg: string) => setLocalErrors(() => ({ [field.name]: [msg] }))}
                    />
                );
            }

            case 'radio': {
                return (
                    <RadioGroup
                        {...commonProps}
                        options={field.options}
                        value={(values[field.name] as string) ?? ''}
                        onChange={(v) => {
                            setCustomValue(field.name, v);
                            field.onValueChange?.({
                                name: field.name,
                                value: v,
                                values: nextValues(field.name, v),
                                setValue: setValue,
                            });
                        }}
                    />
                );
            }

            case 'select': {
                return (
                    <Select
                        {...commonProps}
                        selectors={field.selectors}
                        value={(values[field.name] as string) ?? ''}
                        onChange={(v) => {
                            setCustomValue(field.name, v);
                            field.onValueChange?.({
                                name: field.name,
                                value: v,
                                values: nextValues(field.name, v),
                                setValue: setValue,
                            });
                        }}
                    />
                );
            }

            case 'personsel': {
                return (
                    <SelectPerson
                        {...commonProps}
                        selectors={field.selectors}
                        value={(values[field.name] as string) ?? ''}
                        onChange={(v) => {
                            setCustomValue(field.name, v);
                            field.onValueChange?.({
                                name: field.name,
                                value: v,
                                values: nextValues(field.name, v),
                                setValue: setValue,
                            });
                        }}
                    />
                );
            }

            case 'file': {
                return (
                    <PhotoUploader
                        {...commonProps}
                        value={(values[field.name] as string) || null}
                        onChange={(base64: string) => setCustomValue(field.name, base64)}
                    />
                );
            }

            default:
                return assertNever(field);
        }
    };

    const isFieldVisible = (field: FormField<TValues>) =>
        typeof field.visible === 'function'
            ? field.visible(values)
            : field.visible !== false;


    return (
        <form onSubmit={handleSubmit} className={`${styles.form} ${className ?? ''}`.trim()} style={layoutStyle}>
            {fields.map((field) => {
                if (!isFieldVisible(field)) return null;

                return (
                    <div key={field.name} className={styles[`input-${field.name}`]}>
                        {renderField(field)}
                    </div>
                );
            })}

            {buttons && buttons.length > 0 && (
                <div className={styles.buttons}>
                    {buttons.map((button, index) => (
                        <Button
                            key={`${button.type}-${button.label}`}
                            type={button.type}
                            actionType={button.actionType}
                            style={button.style}
                            onClick={button.onClick}
                        >
                            {button.label}
                        </Button>
                    ))}
                </div>
            )}

            <Errors submitCount={submitCount}
                    globalErrors={globalErrors}
                    localErrors={localErrors}
                    externalLocalErrors={externalLocalErrors} />
        </form>
    );
};

export default Form;
