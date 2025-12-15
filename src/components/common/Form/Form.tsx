import type { JSX } from 'react';
import { useMemo, useState } from 'react';
import { useForm } from '@/hooks/useForm';
import { ButtonConfig, Validate } from '../ui.types';
import Input from './Input/Input';
import Textarea from './Textarea/Textarea';
import TagsInput from './TagsInput/TagsInput';
import PhotoUploader from './PhotoUploader/PhotoUploader';
// import Checkbox from './Checkbox/Checkbox';
import RadioGroup from './RadioGroup/RadioGroup';
import Button from '../Button/Button';
import Errors from './Errors/Errors';
import type { FormField, FormValues, ErrorsMap } from '../ui.types';
import styles from './Form.module.css';
import DateInput from '@/components/common/Form/DateInput/DateInput';
import LifeEventDateField from '@/components/common/Form/LifeEventDateField/LifeEventDateField';
import { LifeEventDate, PartialDate } from '@/features/tree/types';

interface FormProps {
    initialValues: FormValues;
    fields: ReadonlyArray<FormField>;
    buttons?: ReadonlyArray<ButtonConfig>;
    onSubmit: (values: FormValues) => void;
    formLayout?: string;
    formColumns?: string;
    formRows?: string;
    className?: string;
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
                  validate,
              }: FormProps) => {
    const { values, globalErrors, submitCount, handleChange, handleSubmit, setCustomValue } = useForm({
        initialValues,
        onSubmit,
        validate,
    });

    const [localErrors, setLocalErrors] = useState<ErrorsMap>({});

    const layoutStyle = useMemo(
        () => ({
            gridTemplateAreas: formLayout,
            gridTemplateColumns: formColumns,
            gridTemplateRows: formRows,
        }),
        [formLayout, formColumns, formRows],
    );

    const renderField = (field: FormField): JSX.Element => {
        const isVisible =
            typeof field.visible === 'function'
                ? field.visible(values)
                : field.visible !== false;

        if (!isVisible) return null;

        const commonProps = {
            name: field.name,
            placeholder: field.placeholder ?? '',
            className: styles[`input-${field.name}`],
        };

        switch (field.type) {
            case 'text': {
                return <Input {...commonProps} value={(values[field.name] as string) ?? ''} onChange={handleChange} />;
            }

            case 'textarea': {
                return (
                    <Textarea {...commonProps} value={(values[field.name] as string) ?? ''} onChange={handleChange} />
                );
            }

            case 'date': {
                return (
                    <DateInput {...commonProps}
                               value={(values[field.name] as PartialDate | undefined)}
                               setValue={setCustomValue}
                               onError={(msg: string) => (setLocalErrors(() => ({  [field.name]: [msg] })))}
                    />
                );
            }

            case 'event': {
                return (
                    <LifeEventDateField {...commonProps}
                                        value={values[field.name] as LifeEventDate | undefined}
                                        onChange={(next) => setCustomValue(field.name, next)}
                                        onError={(msg: string) => setLocalErrors(() => ({[field.name]: [msg] }))}
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
                        onChange={(v) => setCustomValue(field.name, v)}
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

            default: {
                const _exhaustiveCheck: never = field.type;
                throw new Error(`Unknown field type: ${_exhaustiveCheck}`);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className={`${styles.form} ${className ?? ''}`.trim()} style={layoutStyle}>
            {fields.map((field) => {

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

            <Errors submitCount={submitCount} globalErrors={globalErrors} localErrors={localErrors} />
        </form>
    );
};

export default Form;
