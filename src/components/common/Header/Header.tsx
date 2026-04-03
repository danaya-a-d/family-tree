import Logo from '../Logo/Logo';
import NavMenu from './NavMenu';
import IconsNav from './IconsNav';
import { useEffect, useState } from 'react';
import styles from './Header.module.css';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 769) {
                setIsMenuOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <header className={styles.header}>
            <div className={styles.wrapper}>
                <Logo />

                <div className={styles.desktopNav}>
                    <NavMenu />
                </div>

                <div className={styles.desktopIcons}>
                    <IconsNav />
                </div>

                <button
                    type='button'
                    className={`${styles.menuButton} ${isMenuOpen ? styles.menuButtonOpen : ''}`.trim()}
                    onClick={toggleMenu}
                    aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={isMenuOpen}
                    aria-controls='mobile-menu'
                >
                    <span className={styles.visuallyHidden}>
                        {isMenuOpen ? 'Close menu' : 'Open menu'}
                    </span>
                </button>
            </div>

            <div
                id='mobile-menu'
                className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ''}`.trim()}
            >
                <div className={styles.mobileNav}>
                    <NavMenu isMobile onNavigate={closeMenu} />
                </div>

                <div className={styles.mobileIcons}>
                    <IconsNav />
                </div>
            </div>
        </header>
    );
};

export default Header;
