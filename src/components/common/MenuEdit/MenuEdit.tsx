import { createPortal } from 'react-dom';
import { useEffect, useId, useRef, useState } from 'react';

import MenuButton from '@/components/common/MenuEdit/MenuButton/MenuButton';
import MenuList from '@/components/common/MenuEdit/MenuList/MenuList';
import { MenuItem } from '@/components/common/MenuEdit/MenuEdit.types';
import { useMediaQuery } from '@/hooks/useMediaQuery';

import styles from './MenuEdit.module.css';

type ListPosition = 'right' | 'bottom' | 'top';
type ButtonStyle = 'trans' | 'shadow';

interface MenuEditProps {
    menuList: MenuItem[];
    buttonStyle?: ButtonStyle;
    listPosition?: ListPosition;
    className?: string;
}

const MenuEdit = ({
                      menuList,
                      buttonStyle,
                      listPosition = 'right',
                      className = '',
                  }: MenuEditProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const isMobile = useMediaQuery('(hover: none), (pointer: coarse)');

    const menuRef = useRef<HTMLDivElement | null>(null);
    const popupRef = useRef<HTMLDivElement | null>(null);
    const menuId = useId();

    useEffect(() => {
        if (!isOpen || isMobile) return;

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node | null;

            const isInsideMenuButton = !!menuRef.current?.contains(target);
            const isInsidePopup = !!popupRef.current?.contains(target);

            if (!isInsideMenuButton && !isInsidePopup) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('pointerdown', handlePointerDown, true);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDown, true);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, isMobile]);

    useEffect(() => {
        setIsOpen(false);
    }, [isMobile]);

    const handleToggleMenu = () => {
        setIsOpen((prev) => !prev);
    };

    const handleCloseMenu = () => {
        setIsOpen(false);
    };

    return (
        <>
            <div ref={menuRef} className={`${styles.menu} ${className}`.trim()}>
                <MenuButton
                    className={`
                             ${styles.button}
                             ${buttonStyle ? styles[buttonStyle] : ''}
                             `.trim()}
                    onClick={handleToggleMenu}
                    ariaExpanded={isOpen}
                    ariaControls={menuId}
                    ariaLabel='Open actions menu'
                />

                {!isMobile && (
                    <MenuList
                        id={menuId}
                        className={`
                            ${styles.list}
                            ${styles[listPosition]}
                            ${isOpen ? styles.open : ''}
                        `.trim()}
                        list={menuList}
                        onItemClick={handleCloseMenu}
                    />
                )}
            </div>

            {isMobile && isOpen &&
                createPortal(
                    <>
                        <button
                            type='button'
                            className={styles.backdrop}
                            aria-label='Close actions menu'
                            onClick={handleCloseMenu}
                        />

                        <div ref={popupRef} className={styles.mobilePopup}>
                            <MenuList
                                id={menuId}
                                className={styles.mobileList}
                                list={menuList}
                                onItemClick={handleCloseMenu}
                            />
                        </div>
                    </>,
                    document.body,
                )}
        </>
    );
};

export default MenuEdit;