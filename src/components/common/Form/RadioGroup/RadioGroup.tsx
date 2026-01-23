import styles from './RadioGroup.module.css';
import { RadioOption } from '@/components/common/Form/Form.types';

type RadioGroupProps = {
    name: string;
    value: string;
    onChange: (nextValue: string) => void;
    options: ReadonlyArray<RadioOption>;
    size?: 'big' | 'small';
    disabled?: boolean;
};

const RadioGroup = ({
                        name, value, onChange, options,
                        size = 'big', disabled = false,
                    }: RadioGroupProps) => {
    return (
        <div role='radiogroup'
             className={
                 size !== 'small' ? styles.group : styles.groupSmall
             }
        >
            {options.map(opt => {
                const id = `${name}-${String(opt.value)}`;
                const isDisabled = disabled || !!opt.disabled;
                const checked = value === opt.value;

                return (
                    <label
                        key={id}
                        htmlFor={id}
                        className={[
                            size !== 'small' ? styles.option : styles.optionSmall,
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
                        <span
                            className={
                                size !== 'small' ? styles.control : styles.controlSmall
                            } aria-hidden='true'
                        />

                        <span
                            className={
                                size !== 'small' ? styles.text : styles.textSmall
                            }>{opt.label}
                        </span>
                    </label>
                );
            })}
        </div>
    );
};

export default RadioGroup;