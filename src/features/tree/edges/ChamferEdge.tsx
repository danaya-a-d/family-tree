import { memo } from 'react';
import { BaseEdge, type EdgeProps, Position } from '@xyflow/react';

const CHAMFER = 8;

export default memo(function ChamferEdge(p: EdgeProps) {
    const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style, markerEnd, id } = p;

    // === КЕЙС ДЛЯ СУПРУГОВ: горизонталь сначала, скос у family ===
    if (sourcePosition === Position.Left || sourcePosition === Position.Right) {
        const dir = sourceX < targetX ? 1 : -1;
        const firstX = sourceX + dir;

        // скос ставим у вертикали x = targetX
        const s = Math.min(
            CHAMFER,
            Math.abs(targetX - firstX) / 2,
            Math.abs(targetY - sourceY) / 2
        );

        const x1 = targetX - Math.sign(targetX - firstX) * s; // перед коленом (по X)
        const y1 = sourceY;
        const x2 = targetX;
        const y2 = sourceY + Math.sign(targetY - sourceY) * s; // после колена (по Y)

        const d = [
            `M ${sourceX} ${sourceY}`,
            `L ${firstX} ${sourceY}`, // короткий выход из карточки
            `L ${x1} ${y1}`,          // к точке перед коленом
            `L ${x2} ${y2}`,          // диагональ = видимый «скос»
            `L ${x2} ${targetY}`,     // строго вниз/вверх по центру family
            `L ${targetX} ${targetY}`
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

    // === КЕЙС ДЛЯ ДЕТЕЙ: вертикаль → горизонталь → вертикаль (через midY) ===
    const midY = (sourceY + targetY) / 2;
    const signX = Math.sign(targetX - sourceX) || 1;
    const s = Math.max(
        1,
        Math.min(CHAMFER, Math.abs(targetX - sourceX) / 2 - 1, Math.abs(targetY - midY) - 1)
    );

    const d = [
        `M ${sourceX} ${sourceY}`,
        `L ${sourceX} ${midY - s}`,
        `L ${sourceX + s * signX} ${midY}`,   // скос (верт→гор)
        `L ${targetX - s * signX} ${midY}`,   // горизонталь
        `L ${targetX} ${midY + s}`,           // скос (гор→верт)
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
