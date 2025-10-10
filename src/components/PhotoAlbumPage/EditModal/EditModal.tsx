import Modal from '../../common/Modal/Modal';
import Form from '../../common/Form/Form';
import { useDispatch } from 'react-redux';
import { deletePhoto, updatePhoto } from '@/features/gallery/gallerySlice';
import { addPhoto } from '@/features/gallery/gallerySlice';
import Title from '../../common/Title/Title';
import type { ButtonConfig, FormField } from '../../common/ui.types';
import type { PhotoItem } from '@/features/gallery/types';
import styles from './EditModal.module.css';

interface EditModalProps {
    photo?: PhotoItem;
    onClose: () => void;
}

type EditFormValues = {
    title: string;
    tags: string[];
    photo: string | null;
};

const EditModal = ({ photo, onClose }: EditModalProps) => {
    const dispatch = useDispatch();
    const isEdit = !!photo;

    const handleDelete = () => {
        if (photo) {
            dispatch(deletePhoto(photo.id));
        }
        onClose();
    };

    const handleSubmit = (values: EditFormValues) => {
        const newPhoto = {
            ...values,
            alt: values.title,
            tags: values.tags.map((tag) => tag.trim()).filter(Boolean),
            path: values.photo,
            bigPath: values.photo,
        };

        if (photo) {
            dispatch(updatePhoto({ ...newPhoto, id: photo.id }));
        } else {
            dispatch(addPhoto({ ...newPhoto, id: Date.now() }));
        }

        onClose();
    };

    const fields = [
        { name: 'title', placeholder: 'Title', type: 'text' },
        { name: 'tags', placeholder: 'tag...', type: 'tagsinput' },
        { name: 'photo', placeholder: 'Photo', type: 'file' },
    ] satisfies ReadonlyArray<FormField>;

    const baseButtons = [
        {
            label: 'Okay',
            style: 'red',
            type: 'button',
            actionType: 'submit',
        },
        {
            label: 'Cancel',
            style: 'black',
            type: 'button',
            actionType: 'button',
            onClick: () => onClose(),
        },
    ] satisfies ReadonlyArray<ButtonConfig>;

    const deleteButton = {
        label: 'Delete photo',
        style: 'trans',
        type: 'button',
        actionType: 'button',
        onClick: handleDelete,
    } satisfies ButtonConfig;

    const buttons = isEdit ? [...baseButtons, deleteButton] : baseButtons;

    const formLayout = `"photo title"
                        "photo tags"
                        "buttons buttons"`;

    const formColumns = '325px auto';
    const formRows = '40px 265px auto';

    const initialValues: EditFormValues = photo
        ? {
              title: photo.title || '',
              tags: photo.tags || [],
              photo: photo.bigPath || null,
          }
        : {
              title: '',
              tags: [],
              photo: null,
          };

    return (
        <Modal onClose={onClose} btnClose={true}>
            <div className={styles.editModal}>
                <Title level={'h2'} size={'small'}>
                    {isEdit ? 'Edit Photo' : 'Add Photo'}
                </Title>
                <Form
                    className={styles.form}
                    buttons={buttons}
                    fields={fields}
                    initialValues={initialValues}
                    formLayout={formLayout}
                    formColumns={formColumns}
                    formRows={formRows}
                    onSubmit={handleSubmit}
                />
            </div>
        </Modal>
    );
};

export default EditModal;
