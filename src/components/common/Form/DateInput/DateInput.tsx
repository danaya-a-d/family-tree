import { ChangeEventHandler, FocusEventHandler } from 'react';
import styles from './DateInput.module.css';

interface DateInputProps {
    name: string;
    value?: string;
    placeholder?: string;
    className?: string;
    setValue: (name: string, value: string) => void;
}

const onlyDigits = (date: string) => date.replace(/\D+/g, '');
const addPadding = (n: string) => (n && n.length === 1 ? n.padStart(2, '0') : n);

const splitYMD = (date: string): { y: string; m: string; d: string } => {
    if (!date) return { y: '', m: '', d: '' };
    const [y = '', m = '', d = ''] = date.split('-');
    return { y, m, d };
};

const joinYMD = (y: string, m: string, d: string) => {
    return `${y}-${m}-${d}`;
};

const DateInput = ({ placeholder, name, value, className, setValue }: DateInputProps) => {

    const { y, m, d } = splitYMD(value);

    const onYear: ChangeEventHandler<HTMLInputElement> = (e) => {
        const next = onlyDigits(e.target.value).slice(0, 4);
        setValue(name, joinYMD(next, m, d));
    };
    const onMonth: ChangeEventHandler<HTMLInputElement> = (e) => {
        const next = onlyDigits(e.target.value).slice(0, 2);
        setValue(name, joinYMD(y, next, d));
    };
    const onDay: ChangeEventHandler<HTMLInputElement> = (e) => {
        const next = onlyDigits(e.target.value).slice(0, 2);
        setValue(name, joinYMD(y, m, next));
    };

    const onDayBlur: FocusEventHandler<HTMLInputElement> = (e) => {
        const next = addPadding(onlyDigits(e.currentTarget.value).slice(0, 2));
        setValue(name, joinYMD(y, m, next));
    };
    const onMonthBlur: FocusEventHandler<HTMLInputElement> = (e) => {
        const next = addPadding(onlyDigits(e.currentTarget.value).slice(0, 2));
        setValue(name, joinYMD(y, next, d));
    };


    return (
        <div className={styles.inputContainer}>
            <p className={styles.placeholder}>{placeholder}</p>
            <div className={styles.inputWrapper}>
                <label className={styles.label}>
                    <input
                        inputMode='numeric'
                        pattern='\d*'
                        name={`${name}Day`}
                        placeholder='dd'
                        value={d}
                        className={`${styles.field} ${className ?? ''}`}
                        onChange={onDay}
                        onBlur={onDayBlur}
                    />
                </label>

                <label className={styles.label}>
                    <input
                        inputMode='numeric'
                        pattern='\d*'
                        name={`${name}Month`}
                        placeholder='mm'
                        value={m}
                        className={`${styles.field} ${className ?? ''}`}
                        onChange={onMonth}
                        onBlur={onMonthBlur}
                    />
                </label>

                <label className={styles.labelYear}>
                    <input
                        inputMode='numeric'
                        pattern='\d*'
                        name={`${name}Year`}
                        placeholder='yyyy'
                        value={y}
                        className={`${styles.field} ${className ?? ''}`}
                        onChange={onYear}
                    />
                </label>
            </div>
        </div>
    );
};

export default DateInput;
