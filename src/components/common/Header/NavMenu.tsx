import styles from './NavMenu.module.css';
import { Link } from 'react-router-dom';

const NavMenu = () => {
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
                        Research
                    </Link>
                </li>
                <li className={styles.navItem}>
                    <Link to="/family-tree" className={styles.navLink}>
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
export default NavMenu;
