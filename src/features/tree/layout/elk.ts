import type { Node, Edge } from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';

type Pos = { x: number; y: number };

export async function layoutWithELK(
    nodes: Node[],
    edges: Edge[],
    opts?: Partial<Record<string, string>>,
): Promise<Record<string, Pos>> {

    const elk = new ELK();

    // Base options
    const baseLayoutOptions: Record<string, string> = {
        'elk.algorithm': 'layered',
        'elk.direction': 'DOWN',
        'elk.spacing.nodeNode': '40',
        'elk.layered.spacing.nodeNodeBetweenLayers': '90',
        'elk.layered.considerModelOrder': 'true',
    };

    // RF -> ELK nodes
    const elkChildren = nodes.map((n) => ({
        id: n.id,
        width:  n.width ?? 180,   // если в ноде нет width/height — ставим дефолт
        height: n.height ?? 80,
    }));

    // RF -> ELK edges
    const elkEdges = edges.map((e) => ({
        id: e.id,
        sources: [e.source],
        targets: [e.target],
    }));

    const graph = {
        id: 'root',
        layoutOptions: { ...baseLayoutOptions, ...(opts ?? {}) },
        children: elkChildren,
        edges: elkEdges,
    };

    const res = await elk.layout(graph as any);

    const map: Record<string, Pos> = {};

    for (const child of res.children ?? []) {
        map[child.id] = { x: child.x ?? 0, y: child.y ?? 0 };
    }

    return map;
}