import type { PhotoItem } from '../features/gallery/types';

// Импорты изображений
import preview1 from '../assets/img/album-preview-photo-1.jpg';
import preview2 from '../assets/img/album-preview-photo-2.jpg';
import preview3 from '../assets/img/album-preview-photo-3.jpg';
import preview4 from '../assets/img/album-preview-photo-4.jpg';
import preview5 from '../assets/img/album-preview-photo-5.jpg';

import big1 from '../assets/img/album-photo-1.jpg';

export const initialPhotos: PhotoItem[] = [
    {
        id: 1,
        path: preview1,
        bigPath: big1,
        alt: 'Dad and His Friends by the House',
        title: 'Dad and His Friends by the House',
        tags: ['dad', 'friends', '1950s'],
    },
    {
        id: 2,
        path: preview2,
        bigPath: big1,
        title: 'Mom and Dad in the Garden',
        alt: 'Mom and Dad in the Garden',
        tags: ['mom', 'dad'],
    },
    {
        id: 3,
        path: preview3,
        bigPath: big1,
        title: 'Grandma, Aunt, and Little Cousin',
        alt: 'Grandma, Aunt, and Little Cousin',
        tags: ['grandma', 'aunt', 'cousin', 'family'],
    },
    {
        id: 4,
        path: preview4,
        bigPath: big1,
        title: 'Mom as a Child with Her Doll',
        alt: 'Mom as a Child with Her Doll',
        tags: ['mom', 'childhood', '1970s'],
    },
    {
        id: 5,
        path: preview5,
        bigPath: big1,
        title: 'Me as a Baby Smiling on a Chair',
        alt: 'Me as a Baby Smiling on a Chair',
        tags: ['me', 'baby', 'childhood'],
    },
];
