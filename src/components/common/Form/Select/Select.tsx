import { ChangeEventHandler } from 'react';
import styles from './Select.module.css';
import { SelectOption } from '@/components/common/Form/Form.types';

interface SelectProps {
    name: string;
    selectors: ReadonlyArray<SelectOption>,
    onChange: (nextValue: string) => void;
    value?: string;
    placeholder?: string;
    className?: string;
}

const Select = ({ name, selectors, value, placeholder, className, onChange }: SelectProps) => {
    const handleChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
        onChange?.(e.target.value);
    };

    return (
        <div className={styles.inputWrapper}>
            <label className={styles.label}>
                <select
                    name={name}
                    value={value ?? ''}
                    className={`${styles.field} ${className ?? ''}`.trim()}
                    onChange={handleChange}
                >
                    <option disabled hidden value=''>{placeholder}</option>

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

export default Select;
