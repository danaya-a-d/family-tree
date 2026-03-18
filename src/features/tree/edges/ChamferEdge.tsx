import { memo } from 'react';
import { BaseEdge, type EdgeProps, Position } from '@xyflow/react';

const CHAMFER = 8;

export default memo(function ChamferEdge(p: EdgeProps) {
    const { sourceX, sourceY, targetX, targetY, sourcePosition, style, markerEnd, id } = p;

    // SPOUSE CASE
    if (sourcePosition === Position.Left || sourcePosition === Position.Right) {
        const dir = sourceX < targetX ? 1 : -1;
        const firstX = sourceX + dir;

        const s = Math.min(
            CHAMFER,
            Math.abs(targetX - firstX) / 2,
            Math.abs(targetY - sourceY) / 2,
        );

        const x1 = targetX - Math.sign(targetX - firstX) * s;
        const y1 = sourceY;
        const x2 = targetX;
        const y2 = sourceY + Math.sign(targetY - sourceY) * s;

        const d = [
            `M ${sourceX} ${sourceY}`,
            `L ${firstX} ${sourceY}`,
            `L ${x1} ${y1}`,
            `L ${x2} ${y2}`,
            `L ${x2} ${targetY}`,
            `L ${targetX} ${targetY}`,
        ].join(' ');

        return (
            <BaseEdge
                id={id}
                path={d}
                markerEnd={markerEnd}
                style={{
                    stroke: '#2F2F2F',
                    strokeWidth: 1,
                    strokeLinejoin: 'miter',
                    strokeLinecap: 'square',
                    vectorEffect: 'non-scaling-stroke',
                    shapeRendering: 'geometricPrecision',
                    ...style,
                }}
            />
        );
    }

    // CHILDREN CASE
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;

    // Nearly vertical line - draw as a straight line
    if (Math.abs(dx) <= 2) {
        const d = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

        return (
            <BaseEdge
                id={id}
                path={d}
                markerEnd={markerEnd}
                style={{
                    stroke: '#2F2F2F',
                    strokeWidth: 1,
                    strokeLinejoin: 'miter',
                    strokeLinecap: 'square',
                    vectorEffect: 'non-scaling-stroke',
                    shapeRendering: 'geometricPrecision',
                    ...style,
                }}
            />
        );
    }

    const TURN_OFFSET_Y = 128; // Down from the family before turning
    const bendY = Math.min(sourceY + TURN_OFFSET_Y, targetY - 2);

    const signX = Math.sign(dx) || 1;
    const s = Math.max(
        1,
        Math.min(CHAMFER, Math.abs(dx) / 2 - 1, Math.abs(targetY - bendY) - 1),
    );

    const d = [
        `M ${sourceX} ${sourceY}`,
        `L ${sourceX} ${bendY - s}`,
        `L ${sourceX + s * signX} ${bendY}`,
        `L ${targetX - s * signX} ${bendY}`,
        `L ${targetX} ${bendY + s}`,
        `L ${targetX} ${targetY}`,
    ].join(' ');

    return (
        <BaseEdge
            id={id}
            path={d}
            markerEnd={markerEnd}
            style={{
                stroke: '#2F2F2F',
                strokeWidth: 1,
                strokeLinejoin: 'miter',
                strokeLinecap: 'square',
                vectorEffect: 'non-scaling-stroke',
                shapeRendering: 'geometricPrecision',
                ...style,
            }}
        />
    );
});
