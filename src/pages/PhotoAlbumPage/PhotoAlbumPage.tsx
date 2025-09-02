import type { RootState, AppDispatch } from '@/app/store';
import { useDispatch, useSelector } from 'react-redux';
import { initialPhotos } from '@/mock/gallery';
import { useEffect } from 'react';
import { setPhotos } from '@/features/gallery/gallerySlice';
import Album from '../../components/PhotoAlbumPage/Album/Album';
import styles from './PhotoAlbumPage.module.css';

const PhotoAlbumPage = () => {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(setPhotos(initialPhotos));
    }, [dispatch]);

    const photos = useSelector((state: RootState) => state.gallery.photos);

    const tags = [...new Set(photos.flatMap((photo) => photo.tags))];

    return (
        <div className={styles.photoAlbumPage}>
            <Album photos={photos} tags={tags} />
        </div>
    );
};

export default PhotoAlbumPage;
