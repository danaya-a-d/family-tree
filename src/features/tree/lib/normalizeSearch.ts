export const normalizeSearch = (s: string) =>
    s.toLowerCase().replace(/\s+/g, ' ').trim();
