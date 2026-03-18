import malePlaceholder from '@/assets/img/pl-male.jpg';
import femalePlaceholder from '@/assets/img/pl-female.jpg';
import unknownPlaceholder from '@/assets/img/pl-unknown.jpg';

export const getDefaultPortrait = (gender?: 'male' | 'female' | 'unknown') =>
    gender === 'male' ? malePlaceholder : gender === 'female' ? femalePlaceholder : unknownPlaceholder;
