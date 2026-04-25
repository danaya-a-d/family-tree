import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FAMILY_SIZE } from '@/components/common/constants';
import styles from './FamilyNode.module.css';

const FamilyNode = () => {
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
