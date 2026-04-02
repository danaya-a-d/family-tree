import { PropsWithChildren, MouseEvent, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

type OverlaySize = 'big' | 'small';

type ModalProps = PropsWithChildren<{
    onClose: () => void;
    className?: string;
    overlaySize?: OverlaySize;
    btnClose?: boolean;
    inline?: boolean;
    target?: HTMLElement | null;
}>;

const getDefaultTarget = () => {
    if (typeof document === 'undefined') return null;
    let el = document.getElementById('modal-root') as HTMLElement | null;
    if (!el) {
        el = document.createElement('div');
        el.id = 'modal-root';
        document.body.appendChild(el);
    }
    return el;
};

const Modal = ({
                   children,
                   onClose,
                   className,
                   overlaySize = 'small',
                   btnClose = false,
                   inline = false,
                   target,
               }: ModalProps) => {

    const portalTarget = target ?? getDefaultTarget();

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, [onClose]);

    const handleOverlayClick = (e: MouseEvent<HTMLDivElement>): void => {
        if (e.target === e.currentTarget) onClose(); // Close on the overlay
    };

    const content = (
        <div className={`
                        ${styles.overlay}
                        ${styles[overlaySize]} 
                        `.trim()}
             onClick={handleOverlayClick}>
            <div className={styles.backdrop} />

            <div className={styles.modal} role='dialog' aria-modal='true'>
                {btnClose && (
                    <button className={styles.modalClose} onClick={onClose} aria-label='Close'>
                        Close
                    </button>
                )}

                <div className={`
                        ${styles.modalContent}
                        ${className} 
                        `.trim()}>{children}</div>
            </div>
        </div>
    );

    if (inline || !portalTarget) return content;
    return createPortal(content, portalTarget);
};

export default Modal;
