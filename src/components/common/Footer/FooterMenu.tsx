import styles from './FooterMenu.module.css';
import { Link } from 'react-router-dom';

const FooterNav = () => {
    return (
        <div className={styles.mainNav}>
            <ul className={styles.nav}>
                <li className={styles.navItem}>
                    <Link to="/" className={styles.navLink}>
                        Home
                    </Link>
                </li>
                <li className={styles.navItem}>
                    <Link to="/" className={styles.navLink}>
                        Family tree
                    </Link>
                </li>
                <li className={styles.navItem}>
                    <Link to="/photo-album" className={styles.navLink}>
                        My photos
                    </Link>
                </li>
            </ul>
        </div>
    );
};
export default FooterNav;
