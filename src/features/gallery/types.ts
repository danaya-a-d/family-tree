export type PhotoId = number;

export type Tag = string;

export type PhotoItem = {
    id: PhotoId;
    path: string;
    alt: string;
    bigPath?: string;
    title?: string;
    tags?: Tag[];
};

export interface GalleryState {
    photos: PhotoItem[];
    filters: string[];
}
