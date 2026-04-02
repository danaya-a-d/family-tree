import type { PropsWithChildren } from 'react';
import type { TextBlockProps } from '../TextBlock/TextBlock';
import TextBlock from '../TextBlock/TextBlock';
import styles from './ImageWithTextBlock.module.css';

interface ImageWithTextBlockOwnProps {
    reverse?: boolean;
    imageSrc: string;
    imageAlt: string;
}

type ImageWithTextBlockProps = PropsWithChildren<ImageWithTextBlockOwnProps & TextBlockProps>;

const ImageWithTextBlock = ({ reverse, imageSrc, imageAlt, children, ...props }: ImageWithTextBlockProps) => {
    return (
        <div className={`${styles.container} ${reverse ? styles.reverse : ''}`}>
            <img src={imageSrc} alt={imageAlt} className={styles.photo} />
            <TextBlock {...props}>{children}</TextBlock>
        </div>
    );
};

export default ImageWithTextBlock;
