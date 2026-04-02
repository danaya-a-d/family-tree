import TextBlock from '../../common/TextBlock/TextBlock';
import styles from './MainHero.module.css';
import familyPhoto from '@/assets/img/family-photo.jpg';

const MainHero = () => {
    return (
        <section className={styles.mainHero}>
            <div className={styles.wrapper}>
                <TextBlock
                    title='Save
                     your history for the future'
                    paragraph='Keep family stories, names, dates, and photographs in one place. Build a lasting archive that can be explored, shared, and passed on.'
                    titleLevel='h1'
                    titleSize='large'
                    showDecoration={true}
                    highlightFirstLetter={true}
                    paragraphClassName={styles.about}
                    className={styles.textBlock}
                />

                <div className={styles.photoBlock}>
                    <img className={styles.photo} src={familyPhoto} alt='' />
                </div>
            </div>
        </section>
    );
};

export default MainHero;
