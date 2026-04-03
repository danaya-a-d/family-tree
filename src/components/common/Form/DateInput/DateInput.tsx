import { ChangeEventHandler, FocusEventHandler, useEffect, useState } from 'react';
import styles from './DateInput.module.css';
import { PartialDate } from '@/features/tree/types';
import { DAY_MAX, DAY_MIN, MONTH_MAX, MONTH_MIN, YEAR_MAX, YEAR_MIN } from '@/components/common/constants';

interface DateInputProps {
    name: string;
    className?: string;
    value?: PartialDate;
    setValue?: (name: string, value: PartialDate) => void;
    onError?: (msg: string) => void;
}

interface BlurConfig {
    maxLength: number;
    min: number;
    max: number;
    padding: boolean;
    errorMsg: string;
}

type FieldKey = 'y' | 'm' | 'd';

const onlyDigits = (n: string) => n.replace(/\D+/g, '');

const formatTwoDigits = (n?: number): string =>
    n == null ? '' : String(n).padStart(2, '0');

const addPadding = (n: string) => (n && n.length === 1 ? n.padStart(2, '0') : n);

const DateInput = ({
                       name,
                       value,
                       setValue,
                       className,
                       onError,
                   }: DateInputProps) => {
    const current: PartialDate = value ?? {};

    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');

    useEffect(() => {
        const v = value ?? {};
        setYear(v.y != null ? v.y.toString() : '');
        setMonth(formatTwoDigits(v.m));
        setDay(formatTwoDigits(v.d));
    }, [value?.y, value?.m, value?.d]);

    const update = (patch: Partial<PartialDate>) => {
        setValue(name, { ...current, ...patch });
    };

    const blurHandler = (
        field: FieldKey,
        config: BlurConfig,
        setText: (v: string) => void,
    ): FocusEventHandler<HTMLInputElement> => {
        return (e) => {
            const { maxLength, min, max, padding, errorMsg } = config;
            const raw = onlyDigits(e.currentTarget.value).slice(0, maxLength);

            if (!raw) {
                setText('');
                const patch = { [field]: undefined } as Partial<PartialDate>;
                update(patch);
                onError?.('');
                return;
            }

            const text = padding ? addPadding(raw) : raw;
            const num = Number(text);

            if (!Number.isInteger(num) || num < min || num > max) {
                setText('');
                onError?.(errorMsg);
                const patch = { [field]: undefined } as Partial<PartialDate>;
                update(patch);
                return;
            }

            setText(text);
            const patch = { [field]: num } as Partial<PartialDate>;
            update(patch);
            onError?.('');
        };
    };

    const onYear: ChangeEventHandler<HTMLInputElement> = (e) => {
        const next = onlyDigits(e.target.value).slice(0, 4);
        setYear(next);
    };
    const onMonth: ChangeEventHandler<HTMLInputElement> = (e) => {
        const next = onlyDigits(e.target.value).slice(0, 2);
        setMonth(next);
    };
    const onDay: ChangeEventHandler<HTMLInputElement> = (e) => {
        const next = onlyDigits(e.target.value).slice(0, 2);
        setDay(next);
    };

    const onYearBlur = blurHandler(
        'y',
        {
            maxLength: 4,
            min: YEAR_MIN,
            max: YEAR_MAX,
            padding: false,
            errorMsg: `Year must be between ${YEAR_MIN} and ${YEAR_MAX}`,
        },
        setYear,
    );

    const onMonthBlur = blurHandler(
        'm',
        {
            maxLength: 2,
            min: MONTH_MIN,
            max: MONTH_MAX,
            padding: true,
            errorMsg: `Month must be between ${MONTH_MIN} and ${MONTH_MAX}`,
        },
        setMonth,
    );

    const onDayBlur = blurHandler(
        'd',
        {
            maxLength: 2,
            min: DAY_MIN,
            max: DAY_MAX,
            padding: true,
            errorMsg: `Day must be between ${DAY_MIN} and ${DAY_MAX}`,
        },
        setDay,
    );

    return (
        <div className={`${styles.inputContainer} ${className ?? ''}`.trim()}>
            <div className={styles.inputWrapper}>
                <label className={styles.label}>
                    <input
                        type='text'
                        inputMode='numeric'
                        pattern='\d*'
                        name={`${name}Day`}
                        placeholder='dd'
                        value={day}
                        className={styles.field}
                        onChange={onDay}
                        onBlur={onDayBlur}
                    />
                </label>

                <label className={styles.label}>
                    <input
                        type='text'
                        inputMode='numeric'
                        pattern='\d*'
                        name={`${name}Month`}
                        placeholder='mm'
                        value={month}
                        className={styles.field}
                        onChange={onMonth}
                        onBlur={onMonthBlur}
                    />
                </label>

                <label className={styles.labelYear}>
                    <input
                        type='text'
                        inputMode='numeric'
                        pattern='\d*'
                        name={`${name}Year`}
                        placeholder='yyyy'
                        value={year}
                        className={styles.field}
                        onChange={onYear}
                        onBlur={onYearBlur}
                    />
                </label>
            </div>
        </div>
    );
};

export default DateInput;
