import ImageWithTextBlock from '../../common/ImageWithTextBlock/ImageWithTextBlock';
import SidePhotos from './SidePhotos/SidePhotos';
import styles from './PersonalAccount.module.css';

interface PersonalAccountProps {
    textTitle: string;
    textParagraph: string;
    familyPhoto: string;
    imagePaths: string[];
    reverse?: boolean;
}

const PersonalAccount = ({
    textTitle,
    textParagraph,
    familyPhoto,
    imagePaths,
    reverse = false,
}: PersonalAccountProps) => {
    return (
        <section className={styles.personalAccount}>
            <div className={styles.wrapper}>
                <div className={styles.container}>
                    <ImageWithTextBlock
                        imageSrc={familyPhoto}
                        imageAlt="Family photo"
                        title={textTitle}
                        paragraph={textParagraph}
                        titleLevel="h2"
                        titleSize="medium"
                        textRight={!reverse}
                        showDecoration={true}
                        highlightFirstLetter={false}
                        paragraphClassName={styles.about}
                        className={`${reverse ? styles.textBlockReverse : styles.textBlock}`}
                        reverse={reverse}
                    />
                </div>
                <SidePhotos imagePaths={imagePaths} leftSide={!reverse} />
            </div>
        </section>
    );
};

export default PersonalAccount;
