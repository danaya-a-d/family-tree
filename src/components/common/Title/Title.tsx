import type { PropsWithChildren } from 'react';
import styles from './Title.module.css';

export type TitleLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
export type TitleSize = 'large' | 'medium' | 'small';

type TitleProps = PropsWithChildren<{
    level?: TitleLevel;
    size?: TitleSize;
    showDecoration?: boolean;
    highlightFirstLetter?: boolean;
}>;

const Title = ({
    children,
    level = 'h1',
    size = 'large',
    showDecoration = false,
    highlightFirstLetter = false,
}: TitleProps) => {
    const HeadingTag: TitleLevel = level;

    return (
        <div className={`${styles.titleWrapper} `}>
            <HeadingTag
                className={`${styles.title} 
                            ${styles[size]} 
                            ${highlightFirstLetter ? styles.highlightFirstLetter : ''}`}
            >
                {children}
            </HeadingTag>

            {showDecoration && <div className={styles.decoration}></div>}
        </div>
    );
};

export default Title;
