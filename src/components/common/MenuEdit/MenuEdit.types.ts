export interface MenuItemLink {
    id: number;
    name: string;
    href: string;
}

export interface MenuItemAction {
    id: number;
    name: string;
    onClick: () => void;
}

export type MenuItem = MenuItemLink | MenuItemAction;