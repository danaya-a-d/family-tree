import { memo } from 'react';
import { Handle, Position, type Node as RFNode, type NodeProps } from '@xyflow/react';
import { FAMILY_SIZE } from '../constants';

type FamilyData = { familyId: string };
type RFFamilyNode = RFNode<FamilyData>;

const FamilyNode = (_: NodeProps<RFFamilyNode>) => {
    return (
        <div
            style={{
                width: FAMILY_SIZE.width,
                height: FAMILY_SIZE.height,
                opacity: 1,
                pointerEvents: 'none',
            }}
        >
            <Handle id='top'
                    type='target'
                    position={Position.Top}
                    style={{ left: '50%', top: 26, transform: 'translate(-50%, -50%)' }}
            />
            <Handle id='bottom'
                    type='source'
                    position={Position.Bottom}
                    style={{ left: '50%', transform: 'translateX(-50%)' }}
            />
        </div>
    );
};

export default memo(FamilyNode);
