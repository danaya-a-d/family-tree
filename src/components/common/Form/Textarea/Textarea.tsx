import type { TextareaHTMLAttributes } from 'react';
import styles from './Textarea.module.css';

type TextareaProps = {
    name: string;
    className?: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name' | 'className'>;

const Textarea = ({ name, className, ...rest }: TextareaProps) => {
    return (
        <div className={styles.inputWrapper}>
            <label className={styles.label}>
                <textarea
                    name={name}
                    className={`${styles.field} ${className ?? ''}`.trim()}
                    {...rest}
                />
            </label>
        </div>
    );
};

export default Textarea;
