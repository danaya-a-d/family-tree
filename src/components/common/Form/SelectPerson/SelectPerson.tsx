import { ChangeEventHandler } from 'react';
import { SelectPersonOption } from '@/components/common/Form/Form.types';
import styles from './SelectPerson.module.css';

interface SelectPersonProps {
    name: string;
    selectors: ReadonlyArray<SelectPersonOption>,
    onChange: (nextValue: string) => void;
    value?: string;
    placeholder?: string;
    className?: string;
}

const SelectPerson = ({ name, selectors, value, placeholder, className, onChange }: SelectPersonProps) => {

    const handleChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
        onChange?.(e.target.value);
    };

    const selectedOption = selectors.find(sel => sel.value === value) ?? selectors[0];

    return (

        <div className={styles.container}>
            {placeholder && <p className={styles.placeholder}>{placeholder}</p>}

            <div className={styles.inputWrapper}>
                <div className={styles.photo}>
                    {selectedOption?.photo && (
                        <img
                            src={selectedOption.photo}
                            alt={selectedOption.label}
                        />
                    )}
                </div>
                <label className={styles.label}>
                    <select
                        name={name}
                        value={value ?? ''}
                        className={`${styles.field} ${className ?? ''}`}
                        onChange={handleChange}
                    >
                        {selectors.map(sel => {
                            const id = `${name}-${String(sel.value)}`;
                            return (
                                <option key={id} value={sel.value}>{sel.label}</option>
                            );
                        })}
                    </select>
                </label>
            </div>
        </div>
    );
};

export default SelectPerson;
