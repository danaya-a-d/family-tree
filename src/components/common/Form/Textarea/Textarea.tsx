import type { ChangeEventHandler } from 'react';
import styles from './Textarea.module.css';

interface TextareaProps {
    name: string;
    value?: string;
    placeholder?: string;
    className?: string;
    onChange?: ChangeEventHandler<HTMLTextAreaElement>;
}

const Textarea = ({ name, value, placeholder, className, onChange }: TextareaProps) => {
    return (
        <div className={styles.inputWrapper}>
            <label className={styles.label}>
                <textarea
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

export default Textarea;
