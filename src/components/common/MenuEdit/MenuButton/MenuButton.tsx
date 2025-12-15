import styles from './MenuButton.module.css';

interface MenuButtonProps {
    className?: string;
}

const MenuButton = ({ className = '' }: MenuButtonProps) => {

    return (
        <button className={`${styles.button} ${className}`}></button>
    );
};

export default MenuButton;
