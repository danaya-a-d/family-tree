import styles from './MenuList.module.css';
import { MenuItem } from '@/components/common/MenuEdit/MenuEdit.types';

interface MenuListProps {
    list: MenuItem[];
    className?: string;
    onItemClick?: () => void;
    id?: string;
}

const MenuList = ({ list, className = '', onItemClick, id }: MenuListProps) => {
    return (
        <div id={id} className={`${styles.menu} ${className}`.trim()} role='menu'>
            <ul className={styles.list}>
                {list.map((item) => (
                    <li className={styles.item} key={item.id} role='none'>
                        {'href' in item ? (
                            <a
                                href={item.href}
                                target='_blank'
                                rel='noopener noreferrer'
                                className={styles.link}
                                role='menuitem'
                                onClick={onItemClick}
                            >
                                {item.name}
                            </a>
                        ) : (
                            <button
                                type='button'
                                onClick={() => {
                                    item.onClick();
                                    onItemClick?.();
                                }}
                                className={styles.link}
                                role='menuitem'
                            >
                                {item.name}
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MenuList;
