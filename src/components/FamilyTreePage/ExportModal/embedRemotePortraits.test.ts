// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TreeState } from '@/features/tree/treeSlice';
import type { Person } from '@/features/tree/types';
import { embedRemotePortraits } from './embedRemotePortraits';

const makeTree = (persons: Person[]): TreeState => ({
    persons: {
        ids: persons.map((person) => person.id),
        entities: Object.fromEntries(persons.map((person) => [person.id, person])),
    },
    families: {
        ids: [],
        entities: {},
    },
    activeSpouseFamily: {},
});

describe('embedRemotePortraits', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('embeds fetched image portraits and keeps failed URLs unchanged', async () => {
        const fetchMock = vi.fn(async (input: RequestInfo | URL): Promise<Response> => {
            const url = String(input);
            if (url.includes('ok.png')) {
                return new Response(new Blob(['image'], { type: 'image/png' }), {
                    status: 200,
                    headers: { 'content-type': 'image/png' },
                });
            }

            throw new Error('CORS blocked');
        });

        vi.stubGlobal('fetch', fetchMock);

        const result = await embedRemotePortraits(makeTree([
            { id: 'p:ok', gender: 'unknown', portrait: 'https://example.com/ok.png' },
            { id: 'p:bad', gender: 'unknown', portrait: 'https://example.com/bad.png' },
            { id: 'p:local', gender: 'unknown', portrait: 'data:image/png;base64,abc' },
        ]));

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(result.embeddedCount).toBe(1);
        expect(result.tree.persons.entities['p:ok']?.portrait).toMatch(/^data:image\/png;base64,/);
        expect(result.tree.persons.entities['p:bad']?.portrait).toBe('https://example.com/bad.png');
        expect(result.tree.persons.entities['p:local']?.portrait).toBe('data:image/png;base64,abc');
        expect(result.warnings).toEqual([
            {
                personId: 'p:bad',
                url: 'https://example.com/bad.png',
                message: 'CORS blocked',
            },
        ]);
    });
});
