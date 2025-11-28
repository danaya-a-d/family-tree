import { useEffect, useMemo, useState } from 'react';
import { ReactFlow, Controls, type Node, type Edge, ReactFlowInstance } from '@xyflow/react';
import { useSelector } from 'react-redux';
import { buildGraph } from '@/features/tree/graph';
import { layoutWithELK } from '@/features/tree/layout/elk';
import type { RootState } from '@/app/store';
import Title from '@/components/common/Title/Title';
import PersonNode from '@/features/tree/nodes/PersonNode';
import FamilyNode from '@/features/tree/nodes/FamilyNode';
import ChamferEdge from '@/features/tree/edges/ChamferEdge';
import { PERSON_SIZE, FAMILY_SIZE } from '@/features/tree/constants';
import '@xyflow/react/dist/style.css';
import styles from './FamilyTree.module.css';

const FamilyTree = () => {
    const graph = useSelector((s: RootState) => buildGraph(s));
    const [nodes, setNodes] = useState<Node[]>(graph.nodes);
    const [edges, setEdges] = useState<Edge[]>(graph.edges);
    const [rf, setRf] = useState<ReactFlowInstance | null>(null);
    const edgeTypes = { chamfer: ChamferEdge };

    const applyLayout = async () => {
        const posMap = await layoutWithELK(graph.nodes, graph.edges);

        // Хелпер: размеры узла
        const getSize = (id: string) => {
            const n = graph.nodes.find(nn => nn.id === id);
            if (!n) return { w: PERSON_SIZE.width, h: PERSON_SIZE.height };
            if (n.type === 'family') return { w: FAMILY_SIZE.width, h: FAMILY_SIZE.height };
            if (n.type === 'person') return { w: PERSON_SIZE.width, h: PERSON_SIZE.height };
            return { w: n.width ?? PERSON_SIZE.width, h: n.height ?? PERSON_SIZE.height };
        };

        // 1) Центруем каждый family между супругами по X и Y (по центрам карточек)
        for (const family of graph.nodes.filter(n => n.type === 'family')) {
            const spouseEdges = graph.edges.filter(
                (e) => e.target === family.id && (e.data as any)?.role === 'spouse',
            );
            if (spouseEdges.length === 2) {
                const [e1, e2] = spouseEdges;
                const p1 = posMap[e1.source];
                const p2 = posMap[e2.source];
                if (p1 && p2) {
                    const s1 = getSize(e1.source);
                    const s2 = getSize(e2.source);
                    const f = getSize(family.id);

                    // центры супругов
                    const c1x = p1.x + s1.w / 2;
                    const c1y = p1.y + s1.h / 2;
                    const c2x = p2.x + s2.w / 2;
                    const c2y = p2.y + s2.h / 2;

                    // средняя точка между центрами супругов
                    const midX = (c1x + c2x) / 2;
                    const midY = (c1y + c2y) / 2;

                    // позиция family — это ЛВ-угол, чтобы его центр попал в midX/midY
                    posMap[family.id].x = midX - f.w / 2;
                    posMap[family.id].y = midY - f.h / 2;
                }
            }
        }

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
                const sW = PERSON_SIZE.width;
                const fW = FAMILY_SIZE.width;

                const sPos = posMap[e.source];
                const fPos = posMap[e.target];

                const sCenterX = sPos.x + sW / 2;
                const fCenterX = fPos.x + fW / 2;

                const personIsLeftOfFamily = sCenterX < fCenterX;

                return {
                    ...e,
                    type: 'chamfer',               // кастомный edge
                    sourceHandle: personIsLeftOfFamily ? 'right' : 'left',
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
        () => ({
            person: PersonNode,
            family: FamilyNode,
        }),
        [],
    );

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <Title level={'h1'} size={'medium'} showDecoration={false} highlightFirstLetter={false}>
                    {'Family tree'}
                </Title>
                {/*<button onClick={applyLayout}>Auto layout</button>*/}
            </div>

            <div className={styles.familyTree}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onInit={setRf}
                    fitView
                    style={{ width: '100%', height: '100%' }}>
                    <Controls />
                </ReactFlow>
            </div>
        </div>

    );
};

export default FamilyTree;
