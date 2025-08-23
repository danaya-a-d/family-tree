import { Link } from 'react-router-dom';
import logo from '../../../assets/img/logo.svg';
import styles from './Logo.module.css';

interface LogoProps {
    className?: string;
}

const Logo = ({ className = '' }: LogoProps) => {
    return (
        <Link to="/" className={`${styles.logoLink} ${className}`}>
            <img className={styles.logo} src={logo} alt="My Roots" />
        </Link>
    );
};
export default Logo;
