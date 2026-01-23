import * as React from 'react';
import { JSX, useMemo, useState } from 'react';
import { useForm } from '@/hooks/useForm';
import type { ErrorsMap, FormField, FormValues } from '../ui.types';
import { ButtonConfig, Validate } from '../ui.types';
import Input from './Input/Input';
import Textarea from './Textarea/Textarea';
import TagsInput from './TagsInput/TagsInput';
import PhotoUploader from './PhotoUploader/PhotoUploader';
// import Checkbox from './Checkbox/Checkbox';
import RadioGroup from './RadioGroup/RadioGroup';
import Button from '../Button/Button';
import Errors from './Errors/Errors';
import styles from './Form.module.css';
import DateInput from '@/components/common/Form/DateInput/DateInput';
import LifeEventDateField from '@/components/common/Form/LifeEventDateField/LifeEventDateField';
import { LifeEventDate, PartialDate } from '@/features/tree/types';
import Select from '@/components/common/Form/Select/Select';
import SelectPerson from '@/components/common/Form/SelectPerson/SelectPerson';

interface FormProps {
    initialValues: FormValues;
    fields: ReadonlyArray<FormField>;
    buttons?: ReadonlyArray<ButtonConfig>;
    onSubmit: (values: FormValues) => void;
    formLayout?: string | ((values: FormValues) => string);
    formColumns?: string;
    formRows?: string;
    className?: string;
    externalLocalErrors?: ErrorsMap;
    validate?: Validate;
}

const Form = ({
                  initialValues,
                  fields,
                  buttons,
                  onSubmit,
                  formLayout,
                  formColumns,
                  formRows,
                  className,
                  externalLocalErrors,
                  validate,
              }: FormProps) => {
    const { values, globalErrors, submitCount, handleChange, handleSubmit, setCustomValue } = useForm({
        initialValues,
        onSubmit,
        validate,
    });

    const [localErrors, setLocalErrors] = useState<ErrorsMap>({});

    const resLayout = typeof formLayout === 'function' ? formLayout(values) : formLayout;

    const layoutStyle = useMemo(
        () => ({
            gridTemplateAreas: resLayout,
            gridTemplateColumns: formColumns,
            gridTemplateRows: formRows,
        }),
        [resLayout, formColumns, formRows],
    );

    const renderField = (field: FormField): JSX.Element => {
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
                        values: { ...values, [field.name]: e.target.value },
                        setValue: setCustomValue,
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
                        values: { ...values, [field.name]: e.target.value },
                        setValue: setCustomValue,
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
                                                values: { ...values, [field.name]: v },
                                                setValue: setCustomValue,
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
                                values: { ...values, [field.name]: v },
                                setValue: setCustomValue,
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
                                values: { ...values, [field.name]: v },
                                setValue: setCustomValue,
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
                                values: { ...values, [field.name]: v },
                                setValue: setCustomValue,
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

    const isFieldVisible = (field: FormField) =>
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
