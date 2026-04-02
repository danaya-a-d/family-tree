import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string) => {
    const getMatches = () => window.matchMedia(query).matches;

    const [matches, setMatches] = useState(() => getMatches());

    useEffect(() => {
        const media = window.matchMedia(query);
        const handler = () => setMatches(media.matches);

        handler();
        media.addEventListener('change', handler);

        return () => media.removeEventListener('change', handler);
    }, [query]);

    return matches;
};