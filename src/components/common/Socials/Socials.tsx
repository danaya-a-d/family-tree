import styles from './Socials.module.css';
import instagramIcon from '../../../assets/img/instagramIcon.svg';
import facebookIcon from '../../../assets/img/facebookIcon.svg';
import twitterIcon from '../../../assets/img/twitterIcon.svg';
import { Link } from 'react-router-dom';

const Socials = () => {
    return (
        <div className={styles.socialsList}>
            <Link to="/" className={styles.socialLink}>
                <img className={styles.logo} src={instagramIcon} alt="Instagram" />
            </Link>

            <Link to="/" className={styles.socialLink}>
                <img className={styles.logo} src={facebookIcon} alt="Facebook" />
            </Link>

            <Link to="/" className={styles.socialLink}>
                <img className={styles.logo} src={twitterIcon} alt="Twitter" />
            </Link>
        </div>
    );
};
export default Socials;
