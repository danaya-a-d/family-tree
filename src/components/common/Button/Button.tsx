import { Link } from 'react-router-dom';
import styles from './Button.module.css';
import { ButtonProps } from '../ui.types';

const Button = ({ type = 'button', onClick, actionType, to, style = 'black', children }: ButtonProps) => {
    const buttonStyle = `${styles.button} ${styles[style] || ''}`.trim();

    return (
        <>
            {type === 'link' ? (
                <Link to={to ?? '#'} onClick={onClick} className={buttonStyle}>
                    {children}
                </Link>
            ) : type === 'button' ? (
                <button type={actionType} onClick={onClick} className={buttonStyle}>
                    {children}
                </button>
            ) : null}
        </>
    );
};

export default Button;
