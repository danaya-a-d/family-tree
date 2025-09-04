import { useEffect, useMemo, useState } from 'react';
import { ReactFlow, useReactFlow, Background, Controls, type Node, ReactFlowInstance } from '@xyflow/react';
import { useSelector } from 'react-redux';
import { buildGraph } from '@/features/tree/graph';
import { layoutWithELK } from '@/features/tree/layout/elk';
import type { RootState } from '@/app/store';
import '@xyflow/react/dist/style.css';
import styles from './FamilyTree.module.css';
import Title from '@/components/common/Title/Title';

const FamilyTree = () => {
    const graph = useSelector((s: RootState) => buildGraph(s));
    const [nodes, setNodes] = useState<Node[]>(graph.nodes);
    const edges = graph.edges;
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
            }))
        );

        requestAnimationFrame(() => rf?.fitView({ padding: 0.2 }));
    };

    useEffect(() => {
        if (!rf) return;
        if (!graph.nodes.length) return;
        void applyLayout();
    }, [rf, graph.nodes.length, edges.length]);

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
                    onInit={setRf}
                    fitView>
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
};

export default FamilyTree;
