import styles from './PhotoWithTags.module.css';
import familyPhoto from '../../../../assets/img/family-photo.jpg';

const PhotoWithTags = () => {
    return (
        <div className={styles.photoWrapper}>
            <img className={styles.photo} src={familyPhoto} alt='' />
        </div>
    );
};

export default PhotoWithTags;
