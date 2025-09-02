import { useEffect, useMemo, useState } from 'react';
import { ReactFlow, useReactFlow, Background, Controls, type Node } from '@xyflow/react';
import { useSelector } from 'react-redux';
import { buildGraph } from '@/features/tree/graph';
import { layoutWithELK } from '@/features/tree/layout/elk';
import type { RootState } from '@/app/store';
import styles from './FamilyTree.module.css';

const FamilyTree = () => {
    const graph = useSelector((s: RootState) => buildGraph(s));
    const [nodes, setNodes] = useState<Node[]>(graph.nodes);
    const [edges] = useState(graph.edges);
    const rf = useReactFlow();

    useEffect(() => {
        setNodes(graph.nodes);
    }, [graph.nodes]);

    const applyLayout = async () => {
        const posMap = await layoutWithELK(nodes, edges);

        setNodes(prev =>
            prev.map(n => ({
                ...n,
                position: posMap[n.id] && n.position,
                draggable: false,
            })),
        );
        requestAnimationFrame(() => rf.fitView({padding: 0.2}))
    };

    useEffect(() => {
        if (graph.nodes.length) applyLayout();
    }, [graph.nodes.length]);

    return (
        <div className={styles.FamilyTree}>
            <button onClick={applyLayout}>Auto layout</button>
            <ReactFlow nodes={nodes} edges={edges} fitView>
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
};

export default FamilyTree;
