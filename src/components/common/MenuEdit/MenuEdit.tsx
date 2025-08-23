import styles from './MenuEdit.module.css';

interface MenuItemLink {
    id: number;
    name: string;
    href: string;
}

interface MenuItemAction {
    id: number;
    name: string;
    onClick: () => void;
}

type MenuItem = MenuItemLink | MenuItemAction;

interface MenuEditProps {
    list: MenuItem[];
    className?: string;
}

const MenuEdit = ({ list, className }: MenuEditProps) => {
    return (
        <div className={`${styles.menu} ${className}`}>
            <ul className={styles.list}>
                {list.map((item, index) => (
                    <li className={styles.item} key={index}>
                        {'href' in item ? (
                            <a href={item.href} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                {item.name}
                            </a>
                        ) : (
                            <button onClick={item.onClick} className={styles.link}>
                                {item.name}
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MenuEdit;
