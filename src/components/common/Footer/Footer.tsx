import Logo from '../Logo/Logo';
import FooterMenu from './FooterMenu';
import Socials from '../Socials/Socials';
import Copyright from './Copyright';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.wrapper}>
                <div className={styles.main}>
                    <Logo className={styles.logo} />
                    <FooterMenu />
                    <Socials />
                </div>
                <Copyright>Copyright © 2022 All rights reserved.</Copyright>
            </div>
        </footer>
    );
};

export default Footer;
