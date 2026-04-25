import type { Node, Edge } from '@xyflow/react';
import ELK, { type ElkExtendedEdge, type ElkNode } from 'elkjs/lib/elk.bundled.js';

type Pos = { x: number; y: number };

type TreeEdgeData = {
    role?: 'spouse' | 'child';
};

const getEdgeRole = (edge: Edge) => (edge.data as TreeEdgeData | undefined)?.role;

export async function layoutWithELK(
    nodes: Node[],
    edges: Edge[],
    opts?: Partial<Record<string, string>>,
): Promise<Record<string, Pos>> {

    const elk = new ELK();

    // Base outer graph settings
    const baseLayoutOptions: Record<string, string> = {
        'elk.algorithm': 'layered',
        'elk.direction': 'DOWN',
        'elk.spacing.nodeNode': '40',
        'elk.layered.spacing.nodeNodeBetweenLayers': '90',
        'elk.layered.considerModelOrder': 'true',
        'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    };

    // Store node sizes by id
    const sizeById = new Map<string, { w: number; h: number }>();
    for (const n of nodes) {
        sizeById.set(n.id, {
            w: (n.width ?? 180) as number,
            h: (n.height ?? 80) as number,
        });
    }

    // Collect spouse edges
    const spouseEdgesByFamily = new Map<string, Edge[]>();
    for (const e of edges) {
        const role = getEdgeRole(e);
        if (role !== 'spouse') continue;

        const familyId = e.target;
        const arr = spouseEdgesByFamily.get(familyId) ?? [];
        arr.push(e);
        spouseEdgesByFamily.set(familyId, arr);
    }

    // Map nodeIds to their groups
    const memberToGroup = new Map<string, string>();
    const groupChildren = new Map<string, string[]>();

    for (const [familyId, sEdges] of spouseEdgesByFamily.entries()) {
        if (sEdges.length < 1 || sEdges.length > 2) continue;

        const spouses = sEdges.map((e) => e.source);
        const groupId = `g:${familyId}`;
        const kids = [...spouses, familyId];

        if (kids.some((id) => memberToGroup.has(id))) continue;

        groupChildren.set(groupId, kids);
        for (const id of kids) memberToGroup.set(id, groupId);
    }

    // Create top-level children for ELK
    const elkChildrenTop: ElkNode[] = [];

    for (const [groupId, kids] of groupChildren.entries()) {
        const elkKids: ElkNode[] = kids.map((id) => {
            const s = sizeById.get(id) ?? { w: 10, h: 10 };
            return { id, width: s.w, height: s.h };
        });

        elkChildrenTop.push({
            id: groupId,
            width: 1,
            height: 1,
            children: elkKids,
            layoutOptions: {
                'elk.algorithm': 'layered',
                'elk.direction': 'DOWN',

                // Padding inside the group
                'elk.padding': '[top=0,left=20,bottom=20,right=20]',
                'elk.spacing.nodeNode': '40',
                'elk.layered.spacing.nodeNodeBetweenLayers': '30',

                'elk.layered.considerModelOrder': 'true',
            },
        });
    }

    // Regular nodes without a group
    for (const n of nodes) {
        if (memberToGroup.has(n.id)) continue;

        const s = sizeById.get(n.id) ?? { w: 10, h: 10 };
        elkChildrenTop.push({
            id: n.id,
            width: s.w,
            height: s.h,
        });
    }

    const elkEdges: ElkExtendedEdge[] = edges.map((e) => ({
        id: e.id,
        sources: [e.source],
        targets: [e.target],
    }));

    // Root graph
    const graph: ElkNode = {
        id: 'root',
        layoutOptions: { ...baseLayoutOptions, ...(opts ?? {}) },
        children: elkChildrenTop,
        edges: elkEdges,
    };

    // Run the layout
    const res = await elk.layout(graph);

    const map: Record<string, Pos> = {};

    const walk = (node: ElkNode, ox: number, oy: number) => {
        const x = (node.x ?? 0) + ox;
        const y = (node.y ?? 0) + oy;

        map[node.id] = { x, y };

        if (node.children) {
            for (const ch of node.children) {
                walk(ch, x, y);
            }
        }
    };

    walk(res, 0, 0);

    return map;
}
