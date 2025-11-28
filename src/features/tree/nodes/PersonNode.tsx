import { memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react';
import { setRootPerson } from '@/features/tree/treeSlice';
import { selectPersonById } from '@/features/tree/selectors';
import type { RootState } from '@/app/store';
import { PERSON_SIZE } from '@/features/tree/constants';
import { RelativeKind, AddRelativeContext } from '@/features/tree/types';
import styles from './PersonNode.module.css';
import femalePlaceholder from '@/assets/img/pl-female.jpg';
import malePlaceholder from '@/assets/img/pl-male.jpg';
import unknownPlaceholder from '@/assets/img/pl-unknown.jpg';
import MenuButton from '@/components/common/MenuButton/MenuButton';
import MenuEdit from '@/components/common/MenuEdit/MenuEdit';
import PersonModal from '@/components/FamilyTreePage/PersonModal/PersonModal';
import RelativeModal from '@/components/FamilyTreePage/RelativeModal/RelativeModal';

type PersonData = {
    personId: string;
    name: string;
    surname: string;
    photoUrl?: string;
    birth?: string;
    death?: string;
};

type RFPersonNode = Node<PersonData>;

const PersonNode = ({ id, data, selected }: NodeProps<RFPersonNode>) => {
    const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
    const [isEditPersonOpen, setIsEditPersonOpen] = useState(false);
    const [addCtx, setAddCtx] = useState<AddRelativeContext | null>(null);

    const dispatch = useDispatch();
    const rf = useReactFlow();

    const person = useSelector((s: RootState) =>
        selectPersonById(s, data.personId),
    );

    const getDefaultPortrait = (gender?: 'male' | 'female' | 'unknown') =>
        gender === 'male' ? malePlaceholder : gender === 'female' ? femalePlaceholder : unknownPlaceholder;

    const birth = person?.birth?.date ?? data.birth;
    const death = person?.death?.date ?? data.death;
    const name = person?.givenName || data.name || 'Unknown';
    const surname = `${person.familyName ?? ''} ${person.maidenName ? `(${person.maidenName})` : ''}`.trim() ?? data.surname;
    const photo = person?.portrait ?? data.photoUrl ?? getDefaultPortrait(person.gender);

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

    const menuList = [
        {
            id: 1,
            name: 'Edit person',
            onClick: () => setIsEditPersonOpen(true),
        },
        {
            id: 2,
            name: 'Add relative',
            onClick: () => setIsAddPersonOpen(true),
        },
        {
            id: 3,
            name: 'See details',
            href: '#',
        },
    ];

    const handlePickRelative = (kind: RelativeKind) => {
        setIsAddPersonOpen(true);
        setAddCtx({ anchorPersonId: person.id, kind });
    };

    return (
        <div className={`${styles.card} ${selected ? styles.selected : ''}`} onClick={onClick}>
            <div className={styles.info}>
                <div className={styles.photo}>
                    {photo && <img src={photo} alt={name} />}
                </div>
                <div className={styles.about}>
                    <div className={styles.name}>
                        <span>{name}</span>
                        <span>{surname}</span>
                    </div>
                    <div className={styles.dates}>{birth}{death ? ` – ${death}` : ''}</div>
                </div>
                <div className={styles.edit}>
                    <MenuButton className={styles.editButton} />
                    <MenuEdit list={menuList} className={styles.editList} />
                </div>
            </div>

            <Handle id='left' type='source' position={Position.Left} />
            <Handle id='right' type='source' position={Position.Right} />
            <Handle id='top' type='target' position={Position.Top} />

            {isAddPersonOpen &&
                <RelativeModal
                    onClose={() => setIsAddPersonOpen(false)}
                    anchor={person}
                    onPick={handlePickRelative}
                />}

            {isEditPersonOpen &&
                <PersonModal
                    onClose={() => setIsEditPersonOpen(false)}
                    person={person}
                />}

            {addCtx && (
                <PersonModal
                    addContext={addCtx}
                    onClose={() => setAddCtx(null)}
                />
            )}
        </div>
    );
};

export default memo(PersonNode);
