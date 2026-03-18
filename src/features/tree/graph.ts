import type { RootState } from '@/app/store';
import type { Node, Edge } from '@xyflow/react';
import { Id } from '@/features/tree/types';
import { personsSel, familiesSel } from './selectors';
import { PERSON_SIZE, FAMILY_SIZE } from '@/components/common/constants';

const pid = (id: string) => `p:${id}`;
const fid = (id: string) => `f:${id}`;

type QueueItem =
    | { kind: 'person'; id: Id; preferSpouseFamilyId?: Id }
    | { kind: 'family'; id: Id };

export function buildGraph(state: RootState): { nodes: Node[]; edges: Edge[] } {
    const persons = personsSel.selectAll(state);
    const families = familiesSel.selectAll(state);
    const personsById = personsSel.selectEntities(state);
    const familiesById = familiesSel.selectEntities(state);

    const storedRoot = state.tree.rootPersonId;
    const rootId: Id | undefined =
        (storedRoot && personsById[storedRoot] ? storedRoot : persons[0]?.id);

    if (!rootId) return { nodes: [], edges: [] };

    const spouseFamiliesByPerson = new Map<Id, Id[]>();
    const parentFamilyByChild = new Map<Id, Id>();
    const shownSpouseFamilyByPerson = new Map<Id, Id | null>();

    const visiblePersons = new Set<Id>();
    const visibleFamilies = new Set<Id>();

    const queue: QueueItem[] = [{ kind: 'person', id: rootId }];

    for (const fam of families) {
        for (const sId of fam.spouses) {
            const f = spouseFamiliesByPerson.get(sId) ?? [];
            f.push(fam.id);
            spouseFamiliesByPerson.set(sId, f);
        }

        for (const cId of fam.children) {
            if (!parentFamilyByChild.has(cId)) {
                parentFamilyByChild.set(cId, fam.id);
            }
        }
    }

    const getSpouseFamilyIds = (personId: Id) => spouseFamiliesByPerson.get(personId) ?? [];

    const getActiveSpouseFamilyId = (personId: Id, preferFamilyId?: Id): Id | null => {
        const spouseFamilyIds = getSpouseFamilyIds(personId);
        if (!spouseFamilyIds.length) return null;

        if (preferFamilyId && spouseFamilyIds.includes(preferFamilyId)) return preferFamilyId;

        const store = state.tree.activeSpouseFamily[personId] ?? null;
        if (store && spouseFamilyIds.includes(store)) return store;

        return spouseFamilyIds[0] ?? null;
    };

    while (queue.length) {
        const item = queue.shift()!;

        if (item.kind === 'person') {
            if (visiblePersons.has(item.id)) continue;

            const p = personsById[item.id];
            if (!p) continue;

            visiblePersons.add(item.id);

            const parentFamId = p.parentFamilyId ?? parentFamilyByChild.get(p.id);
            if (parentFamId && !visibleFamilies.has(parentFamId)) {
                queue.push({ kind: 'family', id: parentFamId });
            }

            const activeSpouseFamId = getActiveSpouseFamilyId(p.id, item.preferSpouseFamilyId);
            shownSpouseFamilyByPerson.set(p.id, activeSpouseFamId ?? null);

            if (activeSpouseFamId && !visibleFamilies.has(activeSpouseFamId)) {
                queue.push({ kind: 'family', id: activeSpouseFamId });
            }

        } else {
            if (visibleFamilies.has(item.id)) continue;
            visibleFamilies.add(item.id);

            const fam = familiesById[item.id];
            if (!fam) continue;

            for (const sId of fam.spouses) {
                queue.push({ kind: 'person', id: sId, preferSpouseFamilyId: fam.id });
            }
            for (const cId of fam.children) {
                queue.push({ kind: 'person', id: cId });
            }
        }
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    for (const personId of visiblePersons) {
        const p = personsById[personId];
        if (!p) continue;

        nodes.push({
            id: pid(p.id),
            type: 'person',
            position: { x: 0, y: 0 },
            data: {
                personId: p.id,
                shownSpouseFamilyId: shownSpouseFamilyByPerson.get(p.id) ?? null,
            },
            width: PERSON_SIZE.width,
            height: PERSON_SIZE.height,
        });
    }


    for (const fam of families) {
        if (!visibleFamilies.has(fam.id)) continue;

        const hasSpouses = fam.spouses.length > 0;
        const childrenCnt = fam.children.length;

        if (!hasSpouses && childrenCnt === 0) continue;
        if (!hasSpouses && childrenCnt === 1) continue;

        nodes.push({
            id: fid(fam.id),
            type: 'family',
            position: { x: 0, y: 0 },
            data: { kind: 'family', familyId: fam.id },
            width: FAMILY_SIZE.width,
            height: FAMILY_SIZE.height,
        });

        for (const sId of fam.spouses) {
            if (!visiblePersons.has(sId)) continue;

            edges.push({
                id: `e:${sId}->${fam.id}`,
                source: pid(sId),
                target: fid(fam.id),
                type: 'chamfer',
                data: { role: 'spouse' as const },
            });
        }

        for (const cId of fam.children) {
            if (!visiblePersons.has(cId)) continue;

            edges.push({
                id: `e:${fam.id}->${cId}`,
                source: fid(fam.id),
                target: pid(cId),
                type: 'chamfer',
                data: { role: 'child' as const },
            });
        }
    }

    return { nodes, edges };
}