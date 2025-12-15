import MenuButton from '@/components/common/MenuEdit/MenuButton/MenuButton';
import MenuList from '@/components/common/MenuEdit/MenuList/MenuList';
import { MenuItem } from '@/components/common/MenuEdit/MenuEdit.types';
import styles from './MenuEdit.module.css';

type ListPosition = 'right' | 'bottom' | 'top';
type ButtonStyle = 'trans' | 'shadow';

interface MenuEditProps {
    menuList: MenuItem[];
    buttonStyle?: ButtonStyle;
    listPosition?: ListPosition;
    className: string;
}

const MenuEdit = ({
                      menuList,
                      buttonStyle,
                      listPosition = 'right',
                      className,
                  }: MenuEditProps) => {
    return (
        <div className={`${styles.menu} ${className}`}>
            <MenuButton className={`
                        ${styles.button} 
                        ${buttonStyle ? styles[buttonStyle] : ''}`.trim()} />
            <MenuList className={`
                            ${styles.list} 
                            ${styles[listPosition]}`}
                      list={menuList} />
        </div>
    );
};

export default MenuEdit;
