import styles from './Photos.module.css';
import Photo from './Photo';
import type { PhotoItem } from '../../../features/gallery/types';

type PhotoForList = Pick<PhotoItem, 'path' | 'alt'>;

interface PhotosProps {
    photos: PhotoForList[];
    onPhotoClick: (photo: PhotoForList) => void;
    className?: string;
}

const Photos = ({ photos, onPhotoClick, className }: PhotosProps) => {
    return (
        <ul className={`${styles.photos} ${className}`}>
            {photos.map((photo, index) => (
                <li className={styles.photoItem} key={index}>
                    <Photo path={photo.path} alt={photo.alt} onClick={() => onPhotoClick(photo)} />
                </li>
            ))}
        </ul>
    );
};

export default Photos;
