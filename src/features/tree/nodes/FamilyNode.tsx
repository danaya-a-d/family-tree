import { memo } from 'react';
import { Handle, Position, type Node as RFNode, type NodeProps } from '@xyflow/react';
import { FAMILY_SIZE } from '../../../components/common/constants';
import styles from './FamilyNode.module.css';

type FamilyData = { familyId: string };
type RFFamilyNode = RFNode<FamilyData>;

const FamilyNode = (_: NodeProps<RFFamilyNode>) => {
    return (
        <div className={styles.node}
            style={{
                width: FAMILY_SIZE.width,
                height: FAMILY_SIZE.height,
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
