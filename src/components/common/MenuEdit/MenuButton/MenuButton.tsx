import styles from './MenuButton.module.css';

interface MenuButtonProps {
    className?: string;
    onClick?: () => void;
    ariaExpanded?: boolean;
    ariaControls?: string;
    ariaLabel?: string;
}

const MenuButton = ({
                        className = '',
                        onClick,
                        ariaExpanded = false,
                        ariaControls,
                        ariaLabel = 'Open menu',
                    }: MenuButtonProps) => {

    return (
        <button
            type='button'
            className={`${styles.button} ${className}`.trim()}
            onClick={onClick}
            aria-haspopup='menu'
            aria-expanded={ariaExpanded}
            aria-controls={ariaControls}
            aria-label={ariaLabel}
        />
    );
};

export default MenuButton;
