import { useEffect, useState } from 'react';
import Toast from './Toast';
import type { ErrorsMap } from '../ui.types';
import type { ToastData } from './Toast.types';
import styles from './Toasts.module.css';

interface ToastsProps {
    errors: ErrorsMap;
}

const Toasts = ({ errors }: ToastsProps) => {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    useEffect(() => {
        const flat = Object
            .values(errors ?? {})
            .flat()
            .filter((msg): msg is string => Boolean(msg && msg.trim()));

        const structured: ToastData[] = flat.map((msg, index) => ({
            id: `${Date.now()}-${index}`,
            message: msg,
        }));
        setToasts(structured);
    }, [errors]);

    const handleClose = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return toasts.length > 0 ? (
        <ul className={styles.list}>
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} onClose={handleClose} />
            ))}
        </ul>
    ) : null;
};

export default Toasts;
