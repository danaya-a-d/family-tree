import Modal from '../../common/Modal/Modal';
import MenuEdit from '@/components/common/MenuEdit/MenuEdit';
import { useDispatch } from 'react-redux';
import { deletePhoto } from '@/features/gallery/gallerySlice';
import { useState } from 'react';
import EditModal from '../EditModal/EditModal';
import type { PhotoItem } from '@/features/gallery/types';
import styles from './PhotoModal.module.css';

interface PhotoModalProps {
    photo: PhotoItem;
    onClose: () => void;
}

const PhotoModal = ({ photo, onClose }: PhotoModalProps) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const dispatch = useDispatch();

    const handleDelete = () => {
        dispatch(deletePhoto(photo.id));
        onClose();
    };

    const openEditModal = () => {
        setIsOpen(false);
        setIsEditOpen(true);
    };

    const handleCloseEdit = (type?: 'return') => {
        if (type === 'return') {
            setIsOpen(true);
            setIsEditOpen(false);
        } else onClose();
    };

    const menuList = [
        {
            id: 1,
            name: 'Edit photo',
            onClick: openEditModal,
        },
        {
            id: 2,
            name: 'Open full',
            href: photo.bigPath,
        },
        {
            id: 3,
            name: 'Delete photo',
            onClick: handleDelete,
        },
    ];

    return (
        <>
            {isOpen && (
                <Modal onClose={onClose} overlaySize='big'>
                    <div className={styles.photoModal}>
                        <MenuEdit menuList={menuList}
                                  listPosition='bottom'
                                  buttonStyle='shadow'
                                  className={styles.editList}
                        />

                        <img className={styles.photo} src={photo.bigPath} alt='' />

                        <div className={styles.about}>
                            <h4 className={styles.title}>{photo.title}</h4>
                            {photo.tags?.length > 0 && (
                                <ul className={styles.tags}>
                                    {photo.tags.map((tag, index) => (
                                        <li className={styles.tag} key={index}>
                                            #{tag}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </Modal>
            )}

            {isEditOpen && <EditModal onClose={handleCloseEdit} photo={photo} />}
        </>
    );
};

export default PhotoModal;
