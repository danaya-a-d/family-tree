import Title from '../../common/Title/Title';
import Tags from '../../common/Tags/Tags';
import Photos from '../../common/Photos/Photos';
import { useState } from 'react';
import PhotoModal from '../PhotoModal/PhotoModal';
import EditModal from '../EditModal/EditModal';
import type { PhotoItem, Tag } from '../../../features/gallery/types';
import style from './Album.module.css';

interface AlbumProps {
    tags: Tag[];
    photos: PhotoItem[];
}

const Album = ({ tags, photos }: AlbumProps) => {
    const [activeTags, setActiveTags] = useState([]);
    const [activePhoto, setActivePhoto] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);

    //tags filter
    const toggleTag = (tag: Tag) => {
        setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
    };

    const filteredPhotos = activeTags.length
        ? photos.filter((photo) => photo.tags.some((tag) => activeTags.includes(tag)))
        : photos;

    //photo modal
    const openPhotoModal = (photo: PhotoItem) => {
        setActivePhoto(photo);
    };

    const closePhotoModal = () => {
        setActivePhoto(null);
    };

    //add modal
    const openAddModal = () => {
        setIsAddOpen(true);
    };

    const closeAddModal = () => {
        setIsAddOpen(false);
    };

    return (
        <div className={style.wrapper}>
            <div className={style.nav}>
                <Title level={'h1'} size={'medium'} showDecoration={false} highlightFirstLetter={false}>
                    {'Photo album'}
                </Title>

                <button className={style.button} onClick={openAddModal}>
                    Add Photo
                </button>
            </div>

            <Tags tags={tags} activeTags={activeTags} toggleTag={toggleTag} className={style.tags} />

            <Photos photos={filteredPhotos} onPhotoClick={openPhotoModal} className={style.photos} />

            {activePhoto && <PhotoModal photo={activePhoto} onClose={closePhotoModal} />}

            {isAddOpen && <EditModal onClose={closeAddModal} />}
        </div>
    );
};

export default Album;
