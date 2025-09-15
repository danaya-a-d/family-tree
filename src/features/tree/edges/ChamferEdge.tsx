import { memo } from 'react';
import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';

const ChamferEdge = memo(function ChamferEdge(p: EdgeProps) {
    const [path] = getSmoothStepPath({
        sourceX: p.sourceX,
        sourceY: p.sourceY,
        sourcePosition: p.sourcePosition,
        targetX: p.targetX,
        targetY: p.targetY,
        targetPosition: p.targetPosition,
        borderRadius: 0,   // 0 => строгие 90°
        offset: 4,         // небольшой отступ от узла (опционально)
    });

    return (
        <BaseEdge
            id={p.id}
            path={path}
            markerEnd={p.markerEnd}
            style={{
                stroke: '#2F2F2F',
                strokeWidth: 1,
                strokeLinejoin: 'bevel', // ← «срезанный» угол
                strokeLinecap: 'square', // ← квадратные окончания
                ...p.style,
            }}
        />
    );
});

export default ChamferEdge;