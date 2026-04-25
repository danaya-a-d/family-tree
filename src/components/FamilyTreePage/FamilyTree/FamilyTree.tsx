import { useCallback, useEffect, useMemo, useState } from 'react';
import { ReactFlow, Controls, type Node, type Edge, ReactFlowInstance } from '@xyflow/react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { layoutWithELK } from '@/features/tree/layout/elk';
import { selectGraph, selectSpouseFamilyIdsOfPerson } from '@/features/tree/selectors';
import type { RootState } from '@/app/store';
import { PERSON_SIZE, FAMILY_SIZE } from '@/components/common/constants';
import '@xyflow/react/dist/style.css';
import { setActiveSpouseFamily, setRootPerson } from '@/features/tree/treeSlice';
import PersonNode from '@/features/tree/nodes/PersonNode';
import FamilyNode from '@/features/tree/nodes/FamilyNode';
import ChamferEdge from '@/features/tree/edges/ChamferEdge';
import Title from '@/components/common/Title/Title';
import PersonSearchBar from '@/components/common/PersonSearchBar/PersonSearchBar';
import ExportModal from '@/components/FamilyTreePage/ExportModal/ExportModal';
import styles from './FamilyTree.module.css';

type TreeEdgeData = {
    role?: 'spouse' | 'child';
};

const getEdgeRole = (edge: Edge) => (edge.data as TreeEdgeData | undefined)?.role;

const FamilyTree = () => {
    const graph = useSelector(selectGraph);

    const dispatch = useDispatch();
    const store = useStore<RootState>();

    const [nodes, setNodes] = useState<Node[]>(graph.nodes);
    const [edges, setEdges] = useState<Edge[]>(graph.edges);
    const [rf, setRf] = useState<ReactFlowInstance | null>(null);
    const edgeTypes = useMemo(
        () => ({ chamfer: ChamferEdge }), [],
    );

    const rootPersonId = useSelector((s: RootState) => s.tree.rootPersonId);

    const [isExportOpen, setIsExportOpen] = useState(false);

    const centerPerson = (personId: string) => {
        if (!rf) return;

        const nodeId = `p:${personId}`;
        const n = rf.getNode(nodeId);
        if (!n) return;

        const w = n.width ?? PERSON_SIZE.width;
        const h = n.height ?? PERSON_SIZE.height;

        rf.setCenter(n.position.x + w / 2, n.position.y + h / 2, {
            zoom: 1.1,
            duration: 300,
        });
    };

    const applyLayout = useCallback(async () => {
        const posMap = await layoutWithELK(graph.nodes, graph.edges);

        // Node size
        const getSize = (id: string) => {
            const n = graph.nodes.find(nn => nn.id === id);
            if (!n) return { w: PERSON_SIZE.width, h: PERSON_SIZE.height };
            if (n.type === 'family') return { w: FAMILY_SIZE.width, h: FAMILY_SIZE.height };
            if (n.type === 'person') return { w: PERSON_SIZE.width, h: PERSON_SIZE.height };
            return { w: n.width ?? PERSON_SIZE.width, h: n.height ?? PERSON_SIZE.height };
        };

        // Center each family between spouses on the X and Y axes (using card centers)
        for (const family of graph.nodes.filter(n => n.type === 'family')) {
            const spouseEdges = graph.edges.filter(
                (e) => e.target === family.id && getEdgeRole(e) === 'spouse',
            );
            if (spouseEdges.length === 2) {
                const [e1, e2] = spouseEdges;
                const p1 = posMap[e1.source];
                const p2 = posMap[e2.source];
                if (p1 && p2) {
                    const s1 = getSize(e1.source);
                    const s2 = getSize(e2.source);
                    const f = getSize(family.id);

                    const c1x = p1.x + s1.w / 2;
                    const c1y = p1.y + s1.h / 2;
                    const c2x = p2.x + s2.w / 2;
                    const c2y = p2.y + s2.h / 2;

                    const midX = (c1x + c2x) / 2;
                    const midY = (c1y + c2y) / 2;

                    posMap[family.id].x = midX - f.w / 2;
                    posMap[family.id].y = midY - f.h / 2;
                }
            }
        }

        // 80px padding on the edges
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

        // Edge handles to make the line start from the correct side of the card
        const enhancedEdges: Edge[] = graph.edges.map((e) => {

            const role = getEdgeRole(e);

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
                    type: 'chamfer',
                    sourceHandle: personIsLeftOfFamily ? 'right' : 'left',
                    targetHandle: 'top',
                };
            }
            if (role === 'child') {
                return {
                    ...e,
                    type: 'chamfer',
                    sourceHandle: 'bottom',
                    targetHandle: 'top',
                };
            }
            return e;
        });

        setEdges(enhancedEdges);

        const rootNodeId = rootPersonId
            ? `p:${rootPersonId}`
            : graph.nodes.find(n => n.type === 'person')?.id;

        if (rootNodeId && posMap[rootNodeId]) {
            const { w, h } = getSize(rootNodeId);
            const dx = offX > 0 ? offX : 0;
            const dy = offY > 0 ? offY : 0;

            const cx = (posMap[rootNodeId].x ?? 0) + dx + w / 2;
            const cy = (posMap[rootNodeId].y ?? 0) + dy + h / 2;

            requestAnimationFrame(() => {
                rf?.setCenter(cx, cy, { zoom: 1.1, duration: 300 });
            });
        } else {
            requestAnimationFrame(() => rf?.fitView({ padding: 0.2 }));
        }

    }, [graph, rf, rootPersonId]);

    useEffect(() => {
        if (!rf) return;

        if (!graph.nodes.length) {
            setNodes([]);
            setEdges([]);
            return;
        }

        void applyLayout();
    }, [rf, graph.nodes.length, applyLayout]);

    const nodeTypes = useMemo(
        () => ({
            person: PersonNode,
            family: FamilyNode,
        }), [],
    );

    // Sync the active family after search
    const syncActiveSpouseAfterSearch = (personId: string) => {
        const state = store.getState();

        const spouseFamilyIds = selectSpouseFamilyIdsOfPerson(state, personId);
        if (spouseFamilyIds.length !== 1) return;

        const familyId = spouseFamilyIds[0];

        dispatch(setActiveSpouseFamily({ personId, familyId }));

        const fam = state.tree.families.entities[familyId];
        if (!fam) return;

        for (const sId of fam.spouses) {
            dispatch(setActiveSpouseFamily({ personId: sId, familyId }));
        }
    };

    // Export modal
    const openExportModal = () => {
        setIsExportOpen(true);
    };

    const closeExportModal = () => {
        setIsExportOpen(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <button className={styles.button} onClick={openExportModal}>
                    Export and Import
                </button>

                <Title
                    className={styles.title}
                    level={'h1'}
                    size={'medium'}
                    showDecoration={false} highlightFirstLetter={false}>
                    {'Family tree'}
                </Title>

                <PersonSearchBar
                    className={styles.search}
                    onPickPerson={(id) => {
                        if (id === rootPersonId) {
                            centerPerson(id);
                            return;
                        }

                        syncActiveSpouseAfterSearch(id);
                        dispatch(setRootPerson(id));
                    }}
                />
            </div>

            <div className={styles.familyTree}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onInit={setRf}
                    style={{ width: '100%', height: '100%' }}>
                    <Controls />
                </ReactFlow>
            </div>

            {isExportOpen && <ExportModal onClose={closeExportModal} />}
        </div>

    );
};

export default FamilyTree;
