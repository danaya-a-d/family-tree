import type { PropsWithChildren, MouseEvent } from 'react';
import styles from './Modal.module.css';

type ModalProps = PropsWithChildren<{
    onClose: () => void;
    btnClose?: boolean;
}>;

const Modal = ({ children, onClose: externalOnClose, btnClose = false }: ModalProps) => {
    const close = () => {
        if (externalOnClose) externalOnClose(); // Если передана внешняя функция, вызываем её
    };

    const handleOverlayClick = (e: MouseEvent<HTMLDivElement>): void => {
        if (e.target === e.currentTarget) close(); // Закрытие при клике на оверлей
    };

    // const handleKeyDown = (e) => {
    //     if (e.key === "Escape") {
    //         close(); // Закрываем модалку при Escape
    //     }
    // };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                {btnClose && (
                    <button className={styles.modalClose} onClick={close}>
                        Close
                    </button>
                )}

                <div className={styles.modalContent}>{children}</div>
            </div>
        </div>
    );
};

export default Modal;
