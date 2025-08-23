import Logo from '../Logo/Logo';
import NavMenu from './NavMenu';
import IconsNav from './IconsNav';
import styles from './Header.module.css';

const Header = () => {
    return (
        <header className={styles.header}>
            <div className={styles.wrapper}>
                <Logo />
                <NavMenu />
                <IconsNav />
            </div>
        </header>
    );
};

export default Header;
