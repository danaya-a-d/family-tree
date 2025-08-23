import type { PropsWithChildren } from 'react';
import styles from './Paragraph.module.css';

type ParagraphProps = PropsWithChildren<{
    className?: string;
}>;

const Paragraph = ({ children, className = '' }: ParagraphProps) => {
    return <p className={`${styles.text} ${className}`}>{children}</p>;
};

export default Paragraph;
