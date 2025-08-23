import type { PropsWithChildren, MouseEventHandler } from 'react';

interface _ButtonBase {
    type: 'link' | 'button';
    style?: 'black' | 'trans' | 'red';
    to?: string;
    actionType?: 'button' | 'submit' | 'reset';
}

export interface ButtonConfig extends _ButtonBase {
    label: string;
    onClick?: () => void;
}

export type ButtonProps = PropsWithChildren<_ButtonBase> & {
    onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
};
