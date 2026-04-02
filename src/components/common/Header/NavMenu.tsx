import { NavLink } from 'react-router-dom';
import styles from './NavMenu.module.css';

type NavMenuProps = {
    isMobile?: boolean;
    onNavigate?: () => void;
};

const NavMenu = ({ isMobile = false, onNavigate }: NavMenuProps) => {
    return (
        <nav
            className={`${styles.mainNav} ${isMobile ? styles.mainNavMobile : ''}`}
            aria-label='Main navigation'>
            <ul className={`${styles.nav} ${isMobile ? styles.navMobile : ''}`}>
                <li className={styles.navItem}>
                    <NavLink
                        to='/' end
                        className={({ isActive }) =>
                            `${styles.navLink} ${isMobile ? styles.navLinkMobile : ''} ${
                                isActive ? styles.active : ''
                            }`
                        }
                        onClick={onNavigate}>
                        Home
                    </NavLink>
                </li>

                <li className={styles.navItem}>
                    <NavLink
                        to='/family-tree'
                        className={({ isActive }) =>
                            `${styles.navLink} ${isMobile ? styles.navLinkMobile : ''} ${
                                isActive ? styles.active : ''
                            }`
                        }
                        onClick={onNavigate}>
                        Family tree
                    </NavLink>
                </li>

                <li className={styles.navItem}>
                    <NavLink
                        to='/photo-album'
                        className={({ isActive }) =>
                            `${styles.navLink} ${isMobile ? styles.navLinkMobile : ''} ${
                                isActive ? styles.active : ''
                            }`
                        }
                        onClick={onNavigate}>
                        My photos
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
};
export default NavMenu;
