import { createRoot } from 'react-dom/client';
import Toasts from '@/components/common/Toast/Toasts';
import type { ErrorsMap } from '@/components/common/ui.types';

const TOAST_UNMOUNT_DELAY_MS = 5200;

export const showToastMessages = (messages: readonly string[]): void => {
    const cleanMessages = messages.filter((message) => message.trim());
    if (cleanMessages.length === 0 || typeof document === 'undefined') return;

    const container = document.createElement('div');
    document.body.appendChild(container);

    const root = createRoot(container);
    const errors: ErrorsMap = { gedcom: [...cleanMessages] };

    root.render(<Toasts errors={errors} />);

    window.setTimeout(() => {
        root.unmount();
        container.remove();
    }, TOAST_UNMOUNT_DELAY_MS);
};
