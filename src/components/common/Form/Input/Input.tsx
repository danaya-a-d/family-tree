import type { ChangeEventHandler } from 'react';
import styles from './Input.module.css';

interface InputProps {
    name: string;
    value?: string;
    placeholder?: string;
    className?: string;
    onChange?: ChangeEventHandler<HTMLInputElement>;
}

const Input = ({ name, value, placeholder, className, onChange }: InputProps) => {
    return (
        <div className={styles.inputWrapper}>
            <label className={styles.label}>
                <input
                    name={name}
                    value={value ?? ''}
                    placeholder={placeholder}
                    className={`${styles.field} ${className ?? ''}`}
                    onChange={onChange}
                />
            </label>
        </div>
    );
};

export default Input;
