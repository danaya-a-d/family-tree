import Title from '../../common/Title/Title';
import PhotoAlbumPreview from './PhotoAlbumPreview/PhotoAlbumPreview';
import styles from './StoreOrganize.module.css';

import image1 from '../../../assets/img/img-gal-5.jpg';
import image2 from '../../../assets/img/img-gal-6.jpg';
import image3 from '../../../assets/img/img-gal-7.jpg';
import image4 from '../../../assets/img/img-gal-8.jpg';
import image5 from '../../../assets/img/img-gal-9.jpg';
import image6 from '../../../assets/img/img-gal-10.jpg';
import image7 from '../../../assets/img/img-gal-11.jpg';
import image8 from '../../../assets/img/img-gal-12.jpg';
import image9 from '../../../assets/img/img-gal-13.jpg';
import image10 from '../../../assets/img/img-gal-14.jpg';
import image11 from '../../../assets/img/img-gal-15.jpg';

const StoreOrganize = () => {
    const imagePaths = [image1, image2, image3, image4, image5, image6, image7, image8, image9, image10, image11];

    return (
        <section className={styles.storeOrganize}>
            <div className={styles.wrapper}>
                <div className={styles.textBlock}>
                    <Title level='h2' size='medium'>
                        Store and organize your photos in the family album history
                    </Title>
                </div>
                <PhotoAlbumPreview className={styles.photos} imagePaths={imagePaths} />
            </div>
        </section>
    );
};

export default StoreOrganize;
