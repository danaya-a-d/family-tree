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
                textParagraph="Create a private space for relatives, records, notes, and connections. Update your tree anytime and keep every important detail organized."
                familyPhoto={familyPhoto}
                imagePaths={imagePaths1}
            />
            <FullWidthImage src={bigPhoto} alt="Family photo" />
            <PersonalAccount
                textTitle="Preserve your family's precious memories"
                textParagraph="Save old photographs, meaningful moments, and personal stories before they fade. Keep your family’s memory safe, accessible, and easy to revisit."
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
