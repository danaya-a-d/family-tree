import Photo from './Photo';
import type { PhotoItem } from '@/features/gallery/types';
import styles from './Photos.module.css';

type PhotoForList = Pick<PhotoItem, 'path' | 'alt'>;

interface PhotosProps<T extends PhotoForList> {
    photos: T[];
    onPhotoClick: (photo: T) => void;
    className?: string;
}

const Photos = <T extends PhotoForList>({ photos, onPhotoClick, className }: PhotosProps<T>) => {
    return (
        <ul className={`${styles.photos} ${className}`.trim()}>
            {photos.map((photo, index) => (
                <li className={styles.photoItem} key={index}>
                    <Photo path={photo.path} alt={photo.alt} onClick={() => onPhotoClick(photo)} />
                </li>
            ))}
        </ul>
    );
};

export default Photos;
