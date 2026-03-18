import type { PhotoItem } from '@/features/gallery/types';

import preview1 from '../assets/img/album-preview-photo-1.jpg';
import preview2 from '../assets/img/album-preview-photo-2.jpg';
import preview3 from '../assets/img/album-preview-photo-3.jpg';
import preview4 from '../assets/img/album-preview-photo-4.jpg';
import preview5 from '../assets/img/album-preview-photo-5.jpg';
import preview6 from '../assets/img/album-preview-photo-6.jpg';
import preview7 from '../assets/img/album-preview-photo-7.jpg';
import preview8 from '../assets/img/album-preview-photo-8.jpg';

import big1 from '../assets/img/album-photo-1.jpg';
import big2 from '../assets/img/album-photo-2.jpg';
import big3 from '../assets/img/album-photo-3.jpg';
import big4 from '../assets/img/album-photo-4.jpg';
import big5 from '../assets/img/album-photo-5.jpg';
import big6 from '../assets/img/album-photo-6.jpg';
import big7 from '../assets/img/album-photo-7.jpg';
import big8 from '../assets/img/album-photo-8.jpg';

export const initialPhotos: PhotoItem[] = [
    {
        id: 1,
        path: preview1,
        bigPath: big1,
        alt: 'Family Christmas at Home',
        title: 'Family Christmas at Home',
        tags: ['christmas', 'parents', 'home'],
    },
    {
        id: 2,
        path: preview2,
        bigPath: big2,
        title: 'Around the Family Table',
        alt: 'Around the Family Table',
        tags: ['parents', 'table', 'home', 'children'],
    },
    {
        id: 3,
        path: preview3,
        bigPath: big3,
        title: 'Grandma and Grandpa, Newlyweds',
        alt: 'Grandma and Grandpa, Newlyweds',
        tags: ['wedding', 'grandparents'],
    },
    {
        id: 4,
        path: preview4,
        bigPath: big4,
        title: 'Grandma and Grandpa by the Car, 1958',
        alt: 'Grandma and Grandpa by the Car, 1958',
        tags: ['grandparents', 'car', 'home'],
    },
    {
        id: 5,
        path: preview5,
        bigPath: big5,
        title: 'Grandma, Grandpa and the Kids',
        alt: 'Grandma, Grandpa and the Kids',
        tags: ['home', 'children', 'grandparents'],
    },
    {
        id: 6,
        path: preview6,
        bigPath: big6,
        title: 'Family Picnic in the Park',
        alt: 'Family Picnic in the Park',
        tags: ['picnic', 'grandparents', 'children'],
    },
    {
        id: 7,
        path: preview7,
        bigPath: big7,
        title: 'Summer Fair with Mom and Dad',
        alt: 'Summer Fair with Mom and Dad',
        tags: ['parents', 'fair', 'children'],
    },
    {
        id: 8,
        path: preview8,
        bigPath: big8,
        title: 'Three Generations at Home',
        alt: 'Three Generations at Home',
        tags: ['grandparents', 'parents', 'children', 'home'],
    },
];
