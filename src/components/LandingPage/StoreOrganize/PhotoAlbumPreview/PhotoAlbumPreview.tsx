import styles from './PhotoAlbumPreview.module.css';

interface PhotoAlbumPreviewProps {
    imagePaths: string[];
    className?: string;
}

const PhotoAlbumPreview = ({ imagePaths, className }: PhotoAlbumPreviewProps) => {
    return (
        <div className={className}>
            <ul className={styles.list}>
                {imagePaths.map((path, index) => (
                    <li className={styles.item} key={index}>
                        <img className={styles.photo} src={path} alt={`Photo ${index + 1}`} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PhotoAlbumPreview;
