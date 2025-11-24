import type { RootState } from '@/app/store';
import type { Node, Edge } from '@xyflow/react';
import { personsSel, familiesSel } from './selectors';
import { PERSON_SIZE, FAMILY_SIZE } from './constants';

const pid = (id: string) => `p:${id}`;
const fid = (id: string) => `f:${id}`;

export function buildGraph(state: RootState): { nodes: Node[]; edges: Edge[] } {
    const persons = personsSel.selectAll(state);
    const families = familiesSel.selectAll(state);

    const personNodes: Node[] = persons.map((p) => ({
        id: pid(p.id),
        type: 'person',
        position: { x: 0, y: 0 }, // временно; ELK проставит координаты
        data: {
            kind: 'person',
            personId: p.id,
            name: `${p.givenName ?? 'Unknown'}`,
            surname: `${p.familyName ?? ''} ${p.maidenName ? `(${p.maidenName})` : ''}`.trim(),
            photoUrl: p.portrait,
            birth: p.birth?.date,
            death: p.death?.date,
        },
        width: PERSON_SIZE.width,
        height: PERSON_SIZE.height,
    }));

    const familyNodes: Node[] = families.map((f) => ({
        id: fid(f.id),
        type: 'family',
        position: { x: 0, y: 0 },
        data: { kind: 'family', familyId: f.id },
        width: FAMILY_SIZE.width,
        height: FAMILY_SIZE.height,
    }));

    const edges: Edge[] = [];

    for (const fam of families) {
        for (const sId of fam.spouses) {
            edges.push({
                id: `e:${sId}->${fam.id}`,
                source: pid(sId),
                target: fid(fam.id),
                type: 'chamfer',
                data: { role: 'spouse' as const },
            });
        }

        for (const cId of fam.children) {
            edges.push({
                id: `e:${fam.id}->${cId}`,
                source: fid(fam.id),
                target: pid(cId),
                type: 'chamfer',
                data: { role: 'child' as const },
            });
        }
    }

    return { nodes: [...personNodes, ...familyNodes], edges };
}