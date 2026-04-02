import { Link } from 'react-router-dom';
import mailIcon from '../../../assets/img/mail.svg';
import globeIcon from '../../../assets/img/globe.svg';
import styles from './IconsNav.module.css';

const IconsNav = () => {
    return (
        <ul className={styles.iconsNav}>
            <li className={styles.iconNav}>
                <Link to='/'>
                    <img
                        className={styles.icon}
                        src={mailIcon}
                        alt='Mail icon'
                    />
                </Link>
            </li>

            <li className={styles.iconNav}>
                <Link to='/'>
                    <img
                        className={styles.icon}
                        src={globeIcon}
                        alt='Globe icon'
                    />
                </Link>
            </li>
        </ul>
    );
};

export default IconsNav;