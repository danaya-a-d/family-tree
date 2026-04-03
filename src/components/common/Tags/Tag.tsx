import type { PropsWithChildren } from 'react';
import styles from './Tag.module.css';

type TagProps = PropsWithChildren<{
    isActive?: boolean;
    onClick?: () => void;
}>;

const Tag = ({ children, isActive, onClick }: TagProps) => {
    return (
        <li className={`${styles.tag} ${isActive ? styles.active : ''}`.trim()} onClick={onClick}>
            #{children}
        </li>
    );
};

export default Tag;
