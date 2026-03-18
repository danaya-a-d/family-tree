import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import styles from './TagsInput.module.css';

interface TagsInputProps {
    name: string;
    value?: string[];
    placeholder?: string;
    className?: string;
    setValue?: (name: string, value: string[]) => void;
    onError?: (msg: string) => void;
}

const TagsInput = ({
                       name,
                       value,
                       setValue,
                       placeholder,
                       className,
                       onError,
                   }: TagsInputProps) => {
    const [input, setInput] = useState<string>('');
    const [inputWidth, setInputWidth] = useState<number>(1);
    const spanRef = useRef<HTMLSpanElement | null>(null);
    const tags = value ?? [];

    const MAX_TAG_LENGTH = 20;

    useEffect(() => {
        if (spanRef.current) {
            setInputWidth(spanRef.current.offsetWidth);
        }
    }, [input]);

    const addTag = (): void => {
        const trimmed = input.trim();

        if (!trimmed) {
            onError?.(`Please enter a tag`);
            return;
        }

        if (tags.includes(trimmed)) {
            onError?.(`Tag already exists`);
            setInput('');
            return;
        }

        if (trimmed.length > MAX_TAG_LENGTH) {
            onError?.(`Tag must be no longer than ${MAX_TAG_LENGTH} characters`);
            return;
        }

        setValue(name, [...tags, trimmed]);
        setInput('');
    };

    const removeTag = (index: number): void => {
        const newTags = tags.filter((_, i) => i !== index);
        setValue(name, newTags);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
            e.preventDefault();
            addTag();
        }

        if (e.key === 'Escape') {
            e.preventDefault();
            setInput('');
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setInput(e.target.value);
    };

    return (
        <div className={styles.inputWrapper}>
            <div className={styles.inputContainer}>
                <div className={styles.inputHolder}>
                    {value &&
                        value.map((tag, i) => (
                            <div key={i} className={styles.tag}>
                                <div className={styles.tagContent}>
                                    <span className={styles.symbol}>#</span>
                                    {tag}
                                </div>

                                <button type='button' className={styles.close} onClick={() => removeTag(i)}>
                                    ×
                                </button>
                            </div>
                        ))}

                    <label className={styles.label}>
                        <input
                            name={name}
                            placeholder={placeholder}
                            value={input}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            className={`${styles.field} ${className}`}
                            style={{ width: `${inputWidth}px` }}
                        />
                    </label>

                    <span ref={spanRef} className={styles.mirror}>
                        {input || ''}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TagsInput;
