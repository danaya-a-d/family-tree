import MainHero from '../../components/LandingPage/MainHero/MainHero';
import PersonalAccount from '../../components/LandingPage/PersonalAccount/PersonalAccount';
import FullWidthImage from '../../components/LandingPage/FullWidthImage/FullWidthImage';
import StoreOrganize from '../../components/LandingPage/StoreOrganize/StoreOrganize';

import bigPhoto from '../../assets/img/photo-screen-1.jpg';
import bigPhoto2 from '../../assets/img/photo-screen-2.jpg';
import familyPhoto from '../../assets/img/photo-1.jpg';
import familyPhoto2 from '../../assets/img/photo-2.png';
import imgGal1 from '../../assets/img/img-gal-1.jpg';
import imgGal2 from '../../assets/img/img-gal-2.jpg';
import imgGal3 from '../../assets/img/img-gal-3.jpg';
import imgGal4 from '../../assets/img/img-gal-4.jpg';

const imagePaths1: string[] = [imgGal1, imgGal2];
const imagePaths2: string[] = [imgGal3, imgGal4];

const LandingPage = () => {
    return (
        <div>
            <MainHero />
            <PersonalAccount
                textTitle="Personal account for&nbsp;your family history"
                textParagraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus egestas, erat eu molestie aliquet, eros turpis condimentum sem, et varius velit lectus feugiat mauris."
                familyPhoto={familyPhoto}
                imagePaths={imagePaths1}
            />
            <FullWidthImage src={bigPhoto} alt="Family photo" />
            <PersonalAccount
                textTitle="Preserve your family's precious memories"
                textParagraph="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus egestas, erat eu molestie aliquet, eros turpis condimentum sem, et varius velit lectus feugiat mauris."
                familyPhoto={familyPhoto2}
                imagePaths={imagePaths2}
                reverse={true}
            />
            <FullWidthImage src={bigPhoto2} alt="Family photo" />
            <StoreOrganize />
        </div>
    );
};

export default LandingPage;
