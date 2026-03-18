import { useEffect, useRef, useState } from 'react';
import type { ToastProps } from './Toast.types';
import styles from './Toast.module.css';

const Toast = ({ id, message, onClose }: ToastProps) => {
    const [show, setShow] = useState<boolean>(true);
    const [hide, setHide] = useState<boolean>(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const nodeRef = useRef<HTMLLIElement | null>(null);

    const startTimer = () => {
        if (timerRef.current) return;
        timerRef.current = setTimeout(() => {
            setShow(false);
            timerRef.current = null;
        }, 4000);
    };

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    useEffect(() => {
        requestAnimationFrame(() => setHide(true));
        startTimer();
        return () => clearTimer();
    }, []);

    useEffect(() => {
        if (show) return;

        const node = nodeRef.current;
        if (!node) return;

        const handleTransitionEnd = (e) => {
            onClose(id);
        };

        node.addEventListener('transitionend', handleTransitionEnd);
        return () => node.removeEventListener('transitionend', handleTransitionEnd);
    }, [show, id, onClose]);

    const handleClose = () => {
        clearTimer();
        setHide(true);
        requestAnimationFrame(() => {
            setShow(false);
        });
    };

    const handleMouseEnter = () => clearTimer();
    const handleMouseLeave = () => startTimer();

    return (
        <li
            ref={nodeRef}
            className={`
            ${styles.toast}
            ${hide ? styles.show : ''}
            ${!show ? styles.hide : ''}
            `}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className={styles.content}>
                <span className={styles.title}>{message}</span>
                <button type="button" className={styles.close} onClick={handleClose}>
                    ×
                </button>
            </div>
        </li>
    );
};

export default Toast;
