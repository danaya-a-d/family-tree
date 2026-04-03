import styles from './LifeEventDateField.module.css';
import DateInput from '@/components/common/Form/DateInput/DateInput';
import RadioGroup from '@/components/common/Form/RadioGroup/RadioGroup';
import { RadioOption } from '@/components/common/Form/Form.types';
import { DateModifier, LifeEventDate, PartialDate } from '@/features/tree/types';
import { useEffect, useState } from 'react';
import Title from '@/components/common/Title/Title';

interface LifeEventDateFieldProps {
    name: string;
    placeholder?: string;
    onChange: (next: LifeEventDate | undefined) => void;
    className?: string;
    value?: LifeEventDate;
    onError?: (msg: string) => void;
}

const DATE_MODIFIER_OPTIONS: RadioOption[] = [
    { value: 'exact', label: 'Exact' },
    { value: 'abt', label: 'About' },
    { value: 'bef', label: 'Before' },
    { value: 'aft', label: 'After' },
    { value: 'between', label: 'Between' },
] as const;

const LifeEventDateField = ({
                                name,
                                value,
                                placeholder,
                                onChange,
                                onError,
                            }: LifeEventDateFieldProps) => {

    const currentMod: DateModifier = value?.mod ?? 'exact';

    const [cachedTo, setCachedTo] = useState<PartialDate | undefined>(
        () => value && value.mod === 'between' ? value.to : undefined,
    );

    useEffect(() => {
        if (value && value.mod === 'between') {
            setCachedTo(value.to);
        }
    }, [value?.mod === 'between' ? value?.to : undefined]);

    const handleModifierChange = (nextValue: string) => {
        const mod = nextValue as DateModifier;
        const from = value?.from ?? {};

        if (mod === 'between') {
            const to = cachedTo ?? (value && 'to' in value ? value.to : undefined);
            const next: LifeEventDate = { mod: 'between', from, to };
            onChange(next);
        } else {
            const next: LifeEventDate = { mod, from };
            onChange(next);
        }
    };

    const handleFromChange = (_fieldName: string, inputValue: PartialDate) => {
        const from = inputValue;

        if (!value) {
            onChange({ mod: 'exact', from });
            return;
        }

        if (value.mod === 'between') {
            onChange({ ...value, from });
        } else {
            onChange({ ...value, from });
        }
    };

    const handleToChange = (_fieldName: string, inputValue: PartialDate) => {
        setCachedTo(inputValue);
        if (!value || value.mod !== 'between') return;
        onChange({ ...value, to: inputValue });
    };

    const fromInputValue = value?.from;
    const toInputValue = value && value.mod === 'between' ? value.to : cachedTo;

    return (
        <div className={styles.inputContainer}>
            <Title level={'h3'} size={'extraSmall'} className={styles.title}>
                {placeholder}
            </Title>

            <RadioGroup
                name={`${name}-mod`}
                value={currentMod}
                onChange={handleModifierChange}
                options={DATE_MODIFIER_OPTIONS}
                size='small'
            />

            <div className={styles.inputs}>
                <DateInput
                    name={`${name}-from`}
                    value={fromInputValue}
                    setValue={handleFromChange}
                    className={styles.input}
                    onError={(msg) => onError?.(msg)}
                />

                {currentMod === 'between' &&
                    <DateInput
                        name={`${name}-to`}
                        value={toInputValue}
                        setValue={handleToChange}
                        className={styles.input}
                        onError={(msg) => onError?.(msg)}
                    />
                }
            </div>
        </div>
    );
};

export default LifeEventDateField;
