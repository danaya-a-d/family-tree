import type { PropsWithChildren } from 'react';
import styles from './Title.module.css';

export type TitleLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type TitleSize = 'large' | 'medium' | 'small' | 'extraSmall';

type TitleProps = PropsWithChildren<{
    level?: TitleLevel;
    size?: TitleSize;
    showDecoration?: boolean;
    highlightFirstLetter?: boolean;
    className?: string;
}>;

const Title = ({
    children,
    level = 'h1',
    size = 'large',
    showDecoration = false,
    highlightFirstLetter = false,
    className,
}: TitleProps) => {
    const HeadingTag: TitleLevel = level;
    return (
        <div className={`${styles.titleWrapper} `}>
            <HeadingTag
                className={`${styles.title} 
                            ${styles[size]} 
                            ${highlightFirstLetter ? styles.highlightFirstLetter : ''}
                            ${className ?? ''}`}
            >
                {children}
            </HeadingTag>

            {showDecoration && <div className={styles.decoration}></div>}
        </div>
    );
};

export default Title;
