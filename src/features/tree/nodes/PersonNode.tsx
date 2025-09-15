import { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { setRootPerson } from '@/features/tree/treeSlice';
import { selectPersonById } from '@/features/tree/selectors';
import type { RootState } from '@/app/store';
import { PERSON_SIZE } from '@/features/tree/constants';
import styles from './PersonNode.module.css';

type PersonData = {
    personId: string;
    name: string;
    photoUrl?: string;
    birth?: string;
    death?: string;
};

type RFPersonNode = Node<PersonData>;

const PersonNode = ({ id, data, selected }: NodeProps<RFPersonNode>) => {
    const dispatch = useDispatch();
    const rf = useReactFlow();

    const person = useSelector((s: RootState) =>
        selectPersonById(s, data.personId),
    );

    const birth = person?.birth?.date ?? data.birth;
    const death = person?.death?.date ?? data.death;

    const onClick = () => {
        dispatch(setRootPerson(data.personId));

        const n = rf.getNode(id) as RFPersonNode | undefined;
        if (!n) return;

        const w = n.width ?? PERSON_SIZE.width;
        const h = n.height ?? PERSON_SIZE.height;
        const cx = n.position.x + w / 2;
        const cy = n.position.y + h / 2;

        rf.setCenter(cx, cy, { zoom: 1.1, duration: 300 });
    };

    return (
        <div className={`${styles.card} ${selected ? styles.selected : ''}`}>
            <div className={styles.info}>
                <div className={styles.photo}>
                    {data.photoUrl && <img src={data.photoUrl} alt={data.name} />}
                </div>

                <div className={styles.about}>
                    <div className={styles.name}>{data.name}</div>
                    <div className={styles.dates}>{birth}{death ? ` – ${death}` : ''}</div>
                </div>
            </div>

            <Handle id="left"  type="source" position={Position.Left}  />
            <Handle id="right" type="source" position={Position.Right} />
            <Handle id="top"   type="target" position={Position.Top}   />
        </div>
    );
};

export default memo(PersonNode);
