import { useEffect, useMemo, useState } from 'react';
import { ReactFlow, useReactFlow, Background, Controls, type Node, type Edge, ReactFlowInstance } from '@xyflow/react';
import { useSelector } from 'react-redux';
import { buildGraph } from '@/features/tree/graph';
import { layoutWithELK } from '@/features/tree/layout/elk';
import type { RootState } from '@/app/store';
import Title from '@/components/common/Title/Title';
import PersonNode from '@/features/tree/nodes/PersonNode';
import FamilyNode from '@/features/tree/nodes/FamilyNode';
import ChamferEdge from '@/features/tree/edges/ChamferEdge';
import '@xyflow/react/dist/style.css';
import styles from './FamilyTree.module.css';

const FamilyTree = () => {
    const graph = useSelector((s: RootState) => buildGraph(s));
    const [nodes, setNodes] = useState<Node[]>(graph.nodes);
    const [edges, setEdges] = useState<Edge[]>(graph.edges);
    const [rf, setRf] = useState<ReactFlowInstance | null>(null);

    const applyLayout = async () => {
        const posMap = await layoutWithELK(graph.nodes, edges);

        // запас по краям — отступ 80px
        const xs = Object.values(posMap).map(p => p.x);
        const ys = Object.values(posMap).map(p => p.y);
        const offX = 80 - Math.min(...xs);
        const offY = 80 - Math.min(...ys);

        setNodes(
            graph.nodes.map(n => ({
                ...n,
                position: {
                    x: (posMap[n.id]?.x ?? 0) + (offX > 0 ? offX : 0),
                    y: (posMap[n.id]?.y ?? 0) + (offY > 0 ? offY : 0),
                },
                draggable: false,
            })),
        );

        // Назначаем хэндлы у рёбер, чтобы линия выходила из нужного бока карточки
        const enhancedEdges: Edge[] = graph.edges.map((e) => {
            const role = (e.data as any)?.role as 'spouse' | 'child' | undefined;
            if (role === 'spouse') {
                const sX = posMap[e.source].x;   // позиция персоны
                const fX = posMap[e.target].x;   // позиция "ствола" (family)
                const fromLeft = sX <= fX; // персона слева от «ствола»?
                return {
                    ...e,
                    type: 'chamfer',               // наш кастомный edge
                    sourceHandle: fromLeft ? 'left' : 'right',   // из нужного бока карточки
                    targetHandle: 'top',   // в соответствующий бок family
                };
            }
            if (role === 'child') {
                return {
                    ...e,
                    type: 'chamfer',
                    sourceHandle: 'bottom',        // от ствола вниз
                    targetHandle: 'top',           // в верх ребёнка
                };
            }
            return e;
        });
        setEdges(enhancedEdges);

        requestAnimationFrame(() => rf?.fitView({ padding: 0.2 }));
    };

    useEffect(() => {
        if (!rf) return;
        if (!graph.nodes.length) return;
        void applyLayout();
    }, [rf, graph.nodes.length, graph.edges.length]);

    const nodeTypes = useMemo(
        () => ({ person: PersonNode, family: FamilyNode }), [],
    );

    const edgeTypes = { chamfer: ChamferEdge };

    return (
        <div className={styles.wrapper}>
            <Title level={'h1'} size={'medium'} showDecoration={false} highlightFirstLetter={false}>
                {'Family tree'}
            </Title>

            <button onClick={applyLayout}>Auto layout</button>

            <div className={styles.familyTree}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onInit={setRf}
                    fitView
                    style={{ width: '100%', height: '100%' }}>
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
};

export default FamilyTree;
