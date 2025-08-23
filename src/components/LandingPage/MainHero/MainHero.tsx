import TextBlock from '../../common/TextBlock/TextBlock';
import PhotoWithTags from './PhotoWithTags/PhotoWithTags';
import styles from './MainHero.module.css';

const MainHero = () => {
    return (
        <section className={styles.mainHero}>
            <div className={styles.wrapper}>
                <TextBlock
                    title="Save your history for the future"
                    paragraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus egestas, erat eu molestie aliquet, eros turpis condimentum sem, et varius velit."
                    titleLevel="h1"
                    titleSize="large"
                    showDecoration={true}
                    highlightFirstLetter={true}
                    paragraphClassName={styles.about}
                    className={styles.textBlock}
                />

                <div className={styles.photoBlock}>
                    <PhotoWithTags />
                </div>
            </div>
        </section>
    );
};

export default MainHero;
