import styles from './FullWidthImage.module.css';

interface FullWidthImageProps {
    src: string;
    alt: string;
}

const FullWidthImage = ({ src, alt }: FullWidthImageProps) => {
    return (
        <div className={styles.wrapper}>
            <img src={src} alt={alt} className={styles.photo} />
        </div>
    );
};

export default FullWidthImage;
