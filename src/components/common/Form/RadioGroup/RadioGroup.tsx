import { ReactNode } from 'react';
import styles from './RadioGroup.module.css';

export type RadioOption = {
    value: string;
    label: ReactNode;
    disabled?: boolean;
};

type RadioGroupProps = {
    name: string;
    value: string;
    onChange: (nextValue: string) => void;
    options: ReadonlyArray<RadioOption>;
    disabled?: boolean;
};

const RadioGroup = ({
                        name, value, onChange, options,
                        disabled = false,
                    }: RadioGroupProps) => {
    return (
        <div role='radiogroup' className={styles.group}>
            {options.map(opt => {
                const id = `${name}-${String(opt.value)}`;
                const isDisabled = disabled || !!opt.disabled;
                const checked = value === opt.value;

                return (
                    <label
                        key={id}
                        htmlFor={id}
                        className={[
                            styles.option,
                            checked ? styles.checked : '',
                            isDisabled ? styles.disabled : '',
                        ].join(' ')}
                    >
                        <input
                            id={id}
                            type='radio'
                            name={name}
                            value={opt.value}
                            checked={checked}
                            onChange={() => !isDisabled && onChange(opt.value)}
                            disabled={isDisabled}
                            className={styles.input}
                        />
                        <span className={styles.control} aria-hidden='true' />
                        <span className={styles.text}>{opt.label}</span>
                    </label>
                );
            })}
        </div>
    );
};

export default RadioGroup;