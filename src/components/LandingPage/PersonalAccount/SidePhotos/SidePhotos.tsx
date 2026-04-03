import styles from './SidePhotos.module.css';

interface SidePhotosProps {
    imagePaths: string[];
    leftSide?: boolean;
}

const SidePhotos = ({ imagePaths, leftSide = false }: SidePhotosProps) => {
    return (
        <div className={`${leftSide ? styles.photoWrapper : styles.photoWrapperLeft}`.trim()}>
            {imagePaths.map((path, index) => (
                <img className={styles.photo} key={index} src={path} alt={`Side photo ${index + 1}`} />
            ))}
        </div>
    );
};

export default SidePhotos;
