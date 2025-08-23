import styles from './Photo.module.css';

interface PhotoProps {
    path: string;
    alt: string;
    onClick: () => void;
}

const Photo = ({ path, alt, onClick }: PhotoProps) => {
    return <img className={styles.photo} alt={alt} src={path} onClick={onClick} />;
};

export default Photo;
