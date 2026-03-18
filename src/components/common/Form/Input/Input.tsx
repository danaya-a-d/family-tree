import type { InputHTMLAttributes } from 'react';
import styles from './Input.module.css';

type InputProps = {
    name: string;
    className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'className'>;

const Input = ({ name, className, ...rest }: InputProps) => {
    return (
        <div className={styles.inputWrapper}>
            <label className={styles.label}>
                <input
                    name={name}
                    className={`${styles.field} ${className ?? ''}`}
                    {...rest}
                />
            </label>
        </div>
    );
};

export default Input;
