import Title, { TitleLevel, TitleSize } from '../Title/Title';
import Paragraph from '../Paragraph/Paragraph';
import styles from './TextBlock.module.css';

export interface TextBlockProps {
    title: string;
    paragraph: string;
    textRight?: boolean;
    titleLevel?: TitleLevel;
    titleSize?: TitleSize;
    showDecoration?: boolean;
    highlightFirstLetter?: boolean;
    paragraphClassName?: string;
    className?: string;
}

const TextBlock = ({
                       title,
                       paragraph,
                       textRight = false,
                       titleLevel = 'h1',
                       titleSize = 'large',
                       showDecoration = false,
                       highlightFirstLetter = false,
                       paragraphClassName,
                       className,
                   }: TextBlockProps) => {
    return (
        <div
            className={`${styles.textBlock} 
                         ${className}
                         ${textRight ? styles.textRight : ''}`.trim()}
        >
            <Title
                level={titleLevel}
                size={titleSize}
                showDecoration={showDecoration}
                highlightFirstLetter={highlightFirstLetter}
            >
                {title}
            </Title>

            <Paragraph className={paragraphClassName}>{paragraph}</Paragraph>
        </div>
    );
};

export default TextBlock;
