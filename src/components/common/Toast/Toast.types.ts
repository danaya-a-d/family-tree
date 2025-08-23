export interface ToastData {
    id: string;
    message: string;
}

export interface ToastProps extends ToastData {
    onClose: (id: string) => void;
}
