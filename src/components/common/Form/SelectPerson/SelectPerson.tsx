import { ChangeEventHandler } from 'react';
import styles from './SelectPerson.module.css';
import { SelectPersonOption } from '@/components/common/Form/Form.types';

interface SelectPersonProps {
    name: string;
    selectors: ReadonlyArray<SelectPersonOption>,
    onChange: (nextValue: string) => void;
    value?: string;
    placeholder?: string;
    className?: string;
}

const SelectPerson = ({ name, selectors, value, className, onChange }: SelectPersonProps) => {

    const handleChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
        onChange?.(e.target.value);
    };

    const selectedOption = selectors.find(sel => sel.value === value) ?? selectors[0];

    return (
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
    );
};

export default SelectPerson;
