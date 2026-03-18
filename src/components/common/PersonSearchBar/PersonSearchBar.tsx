import styles from './PersonSearchBar.module.css';
import Input from '@/components/common/Form/Input/Input';
import { useSelector } from 'react-redux';
import { selectPersonSearch } from '@/features/tree/selectors';
import { normalizeSearch } from '@/features/tree/lib/normalizeSearch';
import { RootState } from '@/app/store';
import React, { useEffect, useMemo, useRef, useState } from 'react';

type PersonSearchBarProps = {
    onPickPerson: (personId: string) => void;
    className?: string;
};

const PersonSearchBar = ({ onPickPerson, className }: PersonSearchBarProps) => {
    const persons = useSelector((s: RootState) => selectPersonSearch(s));

    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [activeId, setActiveId] = useState(0);

    const wrapRef = useRef<HTMLDivElement | null>(null);

    const results = useMemo(() => {
        const q = normalizeSearch(query);
        if (!q) return [];

        const filtered = persons.filter((p) => p.searchKey.includes(q));

        filtered.sort((a, b) => {
            const aStart = a.searchKey.startsWith(q) ? 0 : 1;
            const bStart = b.searchKey.startsWith(q) ? 0 : 1;
            if (aStart !== bStart) return aStart - bStart;
            return a.label.localeCompare(b.label);
        });

        return filtered.slice(0, 10);
    }, [persons, query]);

    const pick = (personId: string) => {
        onPickPerson(personId);
        setOpen(false);
        setQuery('');
        setActiveId(0);
    };

    const handleBlurCapture = (e: React.FocusEvent<HTMLDivElement>) => {
        const next = e.relatedTarget as Node | null;

        if (next && wrapRef.current?.contains(next)) return;

        setOpen(false);
    };

    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => {
            if (!wrapRef.current) return;
            if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, [open]);

    useEffect(() => {
        if (!query.trim()) setOpen(false);
    }, [query]);

    return (
        <div className={`${styles.wrapper} ${className ?? ''}`}
             ref={wrapRef}
             onBlurCapture={handleBlurCapture}>
            <Input
                name='personSearch'
                placeholder='Search for a person'
                className={styles.input}
                value={query}
                autoComplete='off'
                onFocus={() => query.trim() && setOpen(true)}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setOpen(true);
                    setActiveId(0);
                }}
                onKeyDown={(e) => {
                    if (!open) return;

                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setActiveId((i) => Math.min(i + 1, results.length - 1));
                    } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setActiveId((i) => Math.max(i - 1, 0));
                    } else if (e.key === 'Enter') {
                        e.preventDefault();
                        const item = results[activeId];
                        if (item) pick(item.id);
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        setOpen(false);
                    }
                }}
            />

            {open && (
                <ul className={styles.persons}>
                    {results.length > 0 ? (
                        results.map((p) => (
                            <li
                                key={p.id}
                                tabIndex={0}
                                role='button'
                                className={styles.person}
                                onClick={() => pick(p.id)}
                                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && pick(p.id)}
                            >
                                <div className={styles.photo}>
                                    {p.photo ? <img src={p.photo} alt={p.label} /> : null}
                                </div>
                                <div className={styles.about}>
                                    <p className={styles.name}>{p.label}</p>
                                    {p.years ? <div className={styles.dates}>{p.years}</div> : null}
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className={styles.noResult}>No persons found</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default PersonSearchBar;
